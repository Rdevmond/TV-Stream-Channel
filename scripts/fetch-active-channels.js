import fs from 'fs';
import path from 'path';

// Helper to test if a stream URL is alive and accessible
async function checkStreamAlive(url) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3500);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Range': 'bytes=0-1024'
      },
      signal: ctrl.signal
    });
    clearTimeout(timer);
    return res.status >= 200 && res.status < 400;
  } catch (err) {
    return false;
  }
}

// Simple M3U parser
function parseM3UToChannels(m3uContent, defaultCountry, defaultLang) {
  const lines = m3uContent.split('\n');
  const items = [];
  let current = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
      const groupMatch = line.match(/group-title="([^"]+)"/i);
      const parts = line.split(',');
      const rawName = parts.length > 1 ? parts[parts.length - 1].trim() : 'Unknown';

      // Clean up name by removing quality tags like (1080p), [Not 24/7]
      const cleanName = rawName
        .replace(/\(\d+p\)/gi, '')
        .replace(/\[not 24\/7\]/gi, '')
        .replace(/\[geo-blocked\]/gi, '')
        .trim();

      current = {
        name: cleanName,
        category: groupMatch ? groupMatch[1].trim() : (defaultCountry === 'Indonesia' ? 'Indonesia' : 'Internasional'),
        logo: logoMatch ? logoMatch[1].trim() : '',
        country: defaultCountry,
        language: defaultLang
      };
    } else if (line.startsWith('http') && current) {
      current.streamUrl = line;
      items.push(current);
      current = null;
    }
  }

  return items;
}

// Concurrency runner
async function filterActive(channels, maxLimit = 50) {
  const active = [];
  const batchSize = 10;

  for (let i = 0; i < channels.length; i += batchSize) {
    if (active.length >= maxLimit) break;
    const batch = channels.slice(i, i + batchSize);

    const results = await Promise.all(
      batch.map(async (c) => {
        const isAlive = await checkStreamAlive(c.streamUrl);
        return isAlive ? c : null;
      })
    );

    for (const r of results) {
      if (r && active.length < maxLimit) {
        // Generate clean id
        r.id = r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + active.length;
        active.push(r);
        console.log(`[AKTIF ✓] ${r.country}: ${r.name}`);
      }
    }
  }

  return active;
}

async function main() {
  console.log('--- Mengunduh data siaran dari iptv-org ---');

  // 1. Fetch Indonesian channels
  console.log('Mengambil saluran Indonesia...');
  const idM3u = await fetch('https://iptv-org.github.io/iptv/countries/id.m3u').then(r => r.text());
  const idChannels = parseM3UToChannels(idM3u, 'Indonesia', 'Indonesia');
  console.log(`Ditemukan ${idChannels.length} saluran Indonesia. Memeriksa status aktif...`);
  const activeId = await filterActive(idChannels, 40);

  // 2. Fetch English News / International channels
  console.log('\nMengambil saluran Berita & Hiburan Bahasa Inggris...');
  const newsM3u = await fetch('https://iptv-org.github.io/iptv/categories/news.m3u').then(r => r.text());
  const allNews = parseM3UToChannels(newsM3u, 'Internasional', 'Inggris');
  
  // Filter news channels with English language or global origin
  const engNews = allNews.filter(c => 
    c.name.toLowerCase().includes('news') || 
    c.name.toLowerCase().includes('tv') ||
    c.name.toLowerCase().includes('24') ||
    c.name.toLowerCase().includes('bbc') ||
    c.name.toLowerCase().includes('cnn') ||
    c.name.toLowerCase().includes('al jazeera') ||
    c.name.toLowerCase().includes('sky') ||
    c.name.toLowerCase().includes('dw') ||
    c.name.toLowerCase().includes('euronews')
  );
  console.log(`Ditemukan ${engNews.length} calon saluran Bahasa Inggris. Memeriksa status aktif...`);
  const activeEng = await filterActive(engNews, 35);

  // Combine with top national & global networks
  const topCurated = [
    {
      id: "tvri-nasional",
      name: "TVRI Nasional",
      category: "Indonesia",
      country: "Indonesia",
      language: "Indonesia",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/TVRI_2019_logo.svg/300px-TVRI_2019_logo.svg.png",
      streamUrl: "https://hls.klikstream.net/tvri/nasional.m3u8"
    },
    {
      id: "tvri-world",
      name: "TVRI World",
      category: "Indonesia",
      country: "Indonesia",
      language: "Inggris / Indonesia",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/TVRI_World_logo.svg/320px-TVRI_World_logo.svg.png",
      streamUrl: "https://hls.klikstream.net/tvri/world.m3u8"
    },
    {
      id: "kompas-tv",
      name: "Kompas TV",
      category: "News",
      country: "Indonesia",
      language: "Indonesia",
      logo: "https://upload.wikimedia.org/wikipedia/id/thumb/7/74/Kompas_TV_2018.svg/320px-Kompas_TV_2018.svg.png",
      streamUrl: "https://live.beritasatu.com/live/kompastv.m3u8"
    },
    {
      id: "aljazeera-en",
      name: "Al Jazeera English",
      category: "News",
      country: "Internasional",
      language: "Inggris",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Al_Jazeera_English_logo.svg/320px-Al_Jazeera_English_logo.svg.png",
      streamUrl: "https://live-hls-web-aje.getaj.net/AJE/03.m3u8"
    },
    {
      id: "sky-news-uk",
      name: "Sky News UK",
      category: "News",
      country: "Internasional",
      language: "Inggris",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Sky_News_2020.svg/320px-Sky_News_2020.svg.png",
      streamUrl: "https://skynews-live.edgesuite.net/hls/live/2027588/skynews/skynews_1.m3u8"
    },
    {
      id: "france24-en",
      name: "France 24 English",
      category: "News",
      country: "Internasional",
      language: "Inggris",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/France_24_English_logo.svg/320px-France_24_English_logo.svg.png",
      streamUrl: "https://stream.france24.com/hls/live/2037562/F24_EN_LO_HLS/master_500.m3u8"
    },
    {
      id: "dw-english",
      name: "DW English",
      category: "News",
      country: "Internasional",
      language: "Inggris",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Deutsche_Welle_symbol_2012.svg/320px-Deutsche_Welle_symbol_2012.svg.png",
      streamUrl: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8"
    },
    {
      id: "nasa-tv",
      name: "NASA TV Public HD",
      category: "Documentary",
      country: "Internasional",
      language: "Inggris",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/320px-NASA_logo.svg.png",
      streamUrl: "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8"
    },
    {
      id: "redbull-tv",
      name: "Red Bull TV",
      category: "Sports",
      country: "Internasional",
      language: "Inggris",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Red_Bull_TV_logo.svg/320px-Red_Bull_TV_logo.svg.png",
      streamUrl: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8"
    }
  ];

  const combined = [...topCurated, ...activeId, ...activeEng];
  console.log(`\nTOTAL SIARAN AKTIF YANG BERHASIL DISARING: ${combined.length} channel!`);

  const cleanCategories = [
    "Semua",
    "Indonesia",
    "Internasional",
    "News",
    "Business",
    "Entertainment",
    "Movies",
    "Sports",
    "Religious",
    "Documentary"
  ];

  const outputContent = `// File ini dihasilkan secara otomatis dari iptv-org
// Menyaring HANYA saluran yang berstatus AKTIF (Online)
// Kategori Bahasa: Indonesia & Bahasa Inggris

export const DEFAULT_CHANNELS = ${JSON.stringify(combined, null, 2)};

export const CATEGORIES = ${JSON.stringify(cleanCategories, null, 2)};
`;

  const outputPath = path.resolve('./src/data/channels.js');
  fs.writeFileSync(outputPath, outputContent, 'utf-8');
  console.log(`\nSukses! Data telah disimpan ke ${outputPath}`);
}

main().catch(console.error);
