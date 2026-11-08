import fs from 'fs';
import path from 'path';

// Clean fallback logos based on category
const FALLBACK_LOGOS = {
  Indonesia: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Flag_of_Indonesia.svg/320px-Flag_of_Indonesia.svg.png",
  Animation: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80",
  News: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&auto=format&fit=crop&q=80",
  Movies: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80",
  Documentary: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&auto=format&fit=crop&q=80",
  Entertainment: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80",
  Automotive: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&auto=format&fit=crop&q=80",
  Music: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80"
};

// Verify if a stream is genuinely active and playable in browser
async function verifyStream(url) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3500);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*'
      },
      signal: ctrl.signal
    });

    clearTimeout(timer);

    if (!res.ok) return false;

    // Check CORS
    const cors = res.headers.get('access-control-allow-origin');
    if (cors && cors !== '*' && !cors.includes('localhost') && !cors.includes('127.0.0.1')) {
      return false;
    }

    // Check HLS manifest
    const reader = res.body.getReader();
    const { value } = await reader.read();
    reader.cancel();

    if (!value) return false;
    const chunkText = new TextDecoder().decode(value);

    return chunkText.includes('#EXTM3U') || 
           chunkText.includes('#EXT-X-STREAM-INF') || 
           chunkText.includes('#EXTINF') ||
           chunkText.includes('.m3u8') ||
           chunkText.includes('.ts');
  } catch (err) {
    return false;
  }
}

// Parse M3U
function parseM3U(m3uContent, categoryName) {
  const lines = m3uContent.split('\n');
  const items = [];
  let current = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
      const langMatch = line.match(/tvg-language="([^"]+)"/i);
      const countryMatch = line.match(/tvg-country="([^"]+)"/i);
      const parts = line.split(',');
      const rawName = parts.length > 1 ? parts[parts.length - 1].trim() : 'Channel TV';

      const cleanName = rawName
        .replace(/\(\d+p\)/gi, '')
        .replace(/\[not 24\/7\]/gi, '')
        .replace(/\[geo-blocked\]/gi, '')
        .replace(/\[.*?\]/gi, '')
        .trim();

      current = {
        name: cleanName || rawName,
        category: categoryName,
        logo: logoMatch ? logoMatch[1].trim() : '',
        country: countryMatch ? countryMatch[1].trim() : (categoryName === 'Indonesia' ? 'Indonesia' : 'Global'),
        language: langMatch ? langMatch[1].trim() : (categoryName === 'Indonesia' ? 'Indonesia' : 'Multilingual')
      };
    } else if (line.startsWith('http') && current) {
      current.streamUrl = line;
      items.push(current);
      current = null;
    }
  }

  return items;
}

// Batch test
async function filterActive(channels, targetLimit = 35) {
  const verifiedList = [];
  const batchSize = 15;

  for (let i = 0; i < channels.length; i += batchSize) {
    if (verifiedList.length >= targetLimit) break;
    const batch = channels.slice(i, i + batchSize);

    const checks = await Promise.all(
      batch.map(async (c) => {
        const isOk = await verifyStream(c.streamUrl);
        return isOk ? c : null;
      })
    );

    for (const item of checks) {
      if (item && verifiedList.length < targetLimit) {
        if (!verifiedList.some(x => x.name.toLowerCase() === item.name.toLowerCase() || x.streamUrl === item.streamUrl)) {
          const id = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substr(2, 4);
          item.id = id;
          if (!item.logo || item.logo.includes('localhost') || item.logo.length < 5) {
            item.logo = FALLBACK_LOGOS[item.category] || FALLBACK_LOGOS.News;
          }
          verifiedList.push(item);
          console.log(`[AKTIF ✓] [${item.category}] ${item.name}`);
        }
      }
    }
  }

  return verifiedList;
}

async function main() {
  console.log('--- MEMULAI BUILD LENGKAP KATALOG CHANNEL IPTV AKTIF ---');

  // Load requested special channels if available
  let specialRequested = [];
  if (fs.existsSync('scripts/active_requested.json')) {
    const raw = JSON.parse(fs.readFileSync('scripts/active_requested.json', 'utf8'));
    
    // Map Nick, Discovery, MTV, Trace, Auto
    specialRequested = raw.map(item => {
      let cat = 'Entertainment';
      if (item.matchedTarget === 'nickelodeon') cat = 'Animation';
      else if (item.matchedTarget === 'discovery') cat = 'Documentary';
      else if (item.matchedTarget === 'history') cat = 'Documentary';
      else if (item.matchedTarget === 'auto' || item.matchedTarget === 'motorvision' || item.matchedTarget === 'speed') cat = 'Automotive';
      else if (item.matchedTarget === 'mtv' || item.matchedTarget === 'trace') cat = 'Music';

      const cleanName = item.name
        .replace(/\(\d+p\)/gi, '')
        .replace(/\[not 24\/7\]/gi, '')
        .trim();

      return {
        id: cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substr(2, 4),
        name: cleanName,
        category: cat,
        logo: item.logo || FALLBACK_LOGOS[cat],
        country: 'Global',
        language: 'Multilingual',
        streamUrl: item.url
      };
    });
    console.log(`Loaded ${specialRequested.length} verified special channels (Nick, Discovery, MTV, Trace, etc.)`);
  }

  // 1. INDONESIA
  console.log('\n[1/8] Verifikasi Indonesia...');
  const idM3u = await fetch('https://iptv-org.github.io/iptv/countries/id.m3u').then(r => r.text());
  const activeIndonesia = await filterActive(parseM3U(idM3u, 'Indonesia'), 40);

  // 2. ANIMATION (Target diperbanyak!)
  console.log('\n[2/8] Verifikasi Animation...');
  const animM3u = await fetch('https://iptv-org.github.io/iptv/categories/animation.m3u').then(r => r.text());
  const activeAnimation = await filterActive(parseM3U(animM3u, 'Animation'), 50);

  // 3. DOCUMENTARY
  console.log('\n[3/8] Verifikasi Documentary...');
  const docM3u = await fetch('https://iptv-org.github.io/iptv/categories/documentary.m3u').then(r => r.text());
  const activeDocumentary = await filterActive(parseM3U(docM3u, 'Documentary'), 35);

  // 4. ENTERTAINMENT
  console.log('\n[4/8] Verifikasi Entertainment...');
  const entM3u = await fetch('https://iptv-org.github.io/iptv/categories/entertainment.m3u').then(r => r.text());
  const activeEntertainment = await filterActive(parseM3U(entM3u, 'Entertainment'), 35);

  // 5. AUTOMOTIVE
  console.log('\n[5/8] Verifikasi Automotive (Otomotif)...');
  const autoM3u = await fetch('https://iptv-org.github.io/iptv/categories/auto.m3u').then(r => r.text());
  const activeAuto = await filterActive(parseM3U(autoM3u, 'Automotive'), 30);

  // 6. MUSIC
  console.log('\n[6/8] Verifikasi Music...');
  const musicM3u = await fetch('https://iptv-org.github.io/iptv/categories/music.m3u').then(r => r.text());
  const activeMusic = await filterActive(parseM3U(musicM3u, 'Music'), 35);

  // 7. NEWS
  console.log('\n[7/8] Verifikasi News...');
  const newsM3u = await fetch('https://iptv-org.github.io/iptv/categories/news.m3u').then(r => r.text());
  const activeNews = await filterActive(parseM3U(newsM3u, 'News'), 35);

  // 8. MOVIES
  console.log('\n[8/8] Verifikasi Movies...');
  const movM3u = await fetch('https://iptv-org.github.io/iptv/categories/movies.m3u').then(r => r.text());
  const activeMovies = await filterActive(parseM3U(movM3u, 'Movies'), 35);

  // Merge everything and deduplicate by streamUrl
  const seenUrls = new Set();
  const allFinal = [];

  const rawCombined = [
    ...specialRequested,
    ...activeIndonesia,
    ...activeAnimation,
    ...activeDocumentary,
    ...activeEntertainment,
    ...activeAuto,
    ...activeMusic,
    ...activeNews,
    ...activeMovies
  ];

  for (const c of rawCombined) {
    if (!seenUrls.has(c.streamUrl)) {
      seenUrls.add(c.streamUrl);
      allFinal.push(c);
    }
  }

  console.log(`\n======================================================`);
  console.log(`TOTAL KESELURUHAN CHANNEL AKTIF SIAP PAKAI: ${allFinal.length} CHANNEL`);
  console.log(`======================================================`);

  const categories = [
    "Semua",
    "Indonesia",
    "Animation",
    "Documentary",
    "Entertainment",
    "Automotive",
    "Music",
    "News",
    "Movies"
  ];

  const fileOutput = `// Dataset Lengkap Hasil Verifikasi Ulang
// Kategori: Indonesia, Animation, Documentary, Entertainment, Automotive, Music, News, Movies
// Termasuk Nickelodeon, Discovery, Motorvision, MTV, Trace, dll.

export const DEFAULT_CHANNELS = ${JSON.stringify(allFinal, null, 2)};

export const CATEGORIES = ${JSON.stringify(categories, null, 2)};
`;

  const targetPath = path.resolve('./src/data/channels.js');
  fs.writeFileSync(targetPath, fileOutput, 'utf-8');
  console.log(`Sukses disimpan ke: ${targetPath}`);
}

main().catch(console.error);

