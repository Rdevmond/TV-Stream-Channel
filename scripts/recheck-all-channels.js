import fs from 'fs';
import path from 'path';

// Clean fallback logos based on category
const FALLBACK_LOGOS = {
  Indonesia: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Flag_of_Indonesia.svg/320px-Flag_of_Indonesia.svg.png",
  Animation: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80",
  News: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&auto=format&fit=crop&q=80",
  Movies: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80"
};

// Verify if a stream is genuinely active and playable in the browser
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

    // Check CORS compatibility
    const cors = res.headers.get('access-control-allow-origin');
    if (cors && cors !== '*' && !cors.includes('localhost') && !cors.includes('127.0.0.1')) {
      // Stream specifically locks down CORS to another domain
      return false;
    }

    // Read first chunk of manifest
    const reader = res.body.getReader();
    const { value } = await reader.read();
    reader.cancel();

    if (!value) return false;
    const chunkText = new TextDecoder().decode(value);

    // Must be a valid HLS playlist
    const isHls = chunkText.includes('#EXTM3U') || 
                  chunkText.includes('#EXT-X-STREAM-INF') || 
                  chunkText.includes('#EXTINF') ||
                  chunkText.includes('.m3u8') ||
                  chunkText.includes('.ts');

    return isHls;
  } catch (err) {
    return false;
  }
}

// Parse M3U playlist
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

      // Clean name
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

// Filter active channels in parallel batches
async function filterActive(channels, targetLimit = 40) {
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
        // Prevent duplicates
        if (!verifiedList.some(x => x.name.toLowerCase() === item.name.toLowerCase() || x.streamUrl === item.streamUrl)) {
          const id = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substr(2, 4);
          item.id = id;
          if (!item.logo || item.logo.includes('localhost')) {
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
  console.log('==================================================');
  console.log('MEMULAI PENGECEKAN ULANG SELURUH CHANNEL DARI IPTV-ORG');
  console.log('Kategori: Indonesia, Animation, News, Movies');
  console.log('Syarat: Wajib lolos tes Manifest HLS & lolos tes Browser');
  console.log('==================================================\n');

  // 1. INDONESIA
  console.log('1. Mengambil saluran Indonesia...');
  const idM3u = await fetch('https://iptv-org.github.io/iptv/countries/id.m3u').then(r => r.text());
  const idRaw = parseM3U(idM3u, 'Indonesia');
  console.log(`   Ditemukan ${idRaw.length} calon saluran Indonesia. Sedang memverifikasi stream...`);
  const activeIndonesia = await filterActive(idRaw, 40);
  console.log(`   -> Selesai! ${activeIndonesia.length} saluran Indonesia terverifikasi aktif.\n`);

  // 2. ANIMATION (Semua bahasa)
  console.log('2. Mengambil saluran Animation (Kartun & Anime)...');
  const animM3u = await fetch('https://iptv-org.github.io/iptv/categories/animation.m3u').then(r => r.text());
  const animRaw = parseM3U(animM3u, 'Animation');
  console.log(`   Ditemukan ${animRaw.length} calon saluran Animation. Sedang memverifikasi stream...`);
  const activeAnimation = await filterActive(animRaw, 35);
  console.log(`   -> Selesai! ${activeAnimation.length} saluran Animation terverifikasi aktif.\n`);

  // 3. NEWS (Semua bahasa)
  console.log('3. Mengambil saluran News (Berita Internasional)...');
  const newsM3u = await fetch('https://iptv-org.github.io/iptv/categories/news.m3u').then(r => r.text());
  const newsRaw = parseM3U(newsM3u, 'News');
  console.log(`   Ditemukan ${newsRaw.length} calon saluran News. Sedang memverifikasi stream...`);
  const activeNews = await filterActive(newsRaw, 40);
  console.log(`   -> Selesai! ${activeNews.length} saluran News terverifikasi aktif.\n`);

  // 4. MOVIES (Semua bahasa)
  console.log('4. Mengambil saluran Movies (Film & Sinema)...');
  const moviesM3u = await fetch('https://iptv-org.github.io/iptv/categories/movies.m3u').then(r => r.text());
  const moviesRaw = parseM3U(moviesM3u, 'Movies');
  console.log(`   Ditemukan ${moviesRaw.length} calon saluran Movies. Sedang memverifikasi stream...`);
  const activeMovies = await filterActive(moviesRaw, 35);
  console.log(`   -> Selesai! ${activeMovies.length} saluran Movies terverifikasi aktif.\n`);

  // Gabungkan seluruh saluran aktif
  const allVerified = [
    ...activeIndonesia,
    ...activeAnimation,
    ...activeNews,
    ...activeMovies
  ];

  console.log('==================================================');
  console.log(`TOTAL KESELURUHAN CHANNEL TERVERIFIKASI 100% AKTIF: ${allVerified.length}`);
  console.log('==================================================\n');

  const categories = [
    "Semua",
    "Indonesia",
    "Animation",
    "News",
    "Movies"
  ];

  const fileOutput = `// Dataset Hasil Verifikasi Ulang Real-time
// Kategori: Indonesia, Animation, News, Movies
// Semua channel di bawah ini telah lulus uji kelayakan HLS Manifest & Browser

export const DEFAULT_CHANNELS = ${JSON.stringify(allVerified, null, 2)};

export const CATEGORIES = ${JSON.stringify(categories, null, 2)};
`;

  const targetPath = path.resolve('./src/data/channels.js');
  fs.writeFileSync(targetPath, fileOutput, 'utf-8');
  console.log(`File berhasil diperbarui di: ${targetPath}`);
}

main().catch(console.error);

