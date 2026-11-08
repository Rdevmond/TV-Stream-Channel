import fs from 'fs';

async function verifyStream(url) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: ctrl.signal
    });
    clearTimeout(timer);
    if (!res.ok) return false;
    const reader = res.body.getReader();
    const { value } = await reader.read();
    reader.cancel();
    if (!value) return false;
    const text = new TextDecoder().decode(value);
    return text.includes('#EXTM3U') || text.includes('.m3u8') || text.includes('.ts');
  } catch (err) {
    return false;
  }
}

async function search() {
  console.log('Downloading iptv-org index.m3u...');
  const res = await fetch('https://iptv-org.github.io/iptv/index.m3u');
  const text = await res.text();
  console.log('Index downloaded, size:', (text.length / 1024 / 1024).toFixed(2), 'MB');

  const targets = [
    'nickelodeon',
    'gtv',
    'global tv',
    'inews',
    'trans7',
    'trans 7',
    'discovery',
    'motortrend',
    'motorvision',
    'speed',
    'auto',
    'history',
    'national geographic',
    'nat geo',
    'mtv',
    'trace'
  ];

  const lines = text.split('\n');
  const matches = [];
  let cur = null;

  for (let l of lines) {
    l = l.trim();
    if (l.startsWith('#EXTINF:')) {
      const parts = l.split(',');
      const rawName = parts.length > 1 ? parts[parts.length - 1].trim() : '';
      const logoMatch = l.match(/tvg-logo="([^"]+)"/i);
      const groupMatch = l.match(/group-title="([^"]+)"/i);
      cur = {
        name: rawName,
        logo: logoMatch ? logoMatch[1] : '',
        category: groupMatch ? groupMatch[1] : ''
      };
    } else if (l.startsWith('http') && cur) {
      cur.url = l;
      const lower = cur.name.toLowerCase();
      for (const t of targets) {
        if (lower.includes(t)) {
          matches.push({ ...cur, matchedTarget: t });
          break;
        }
      }
      cur = null;
    }
  }

  console.log(`Found ${matches.length} matching channel candidates. Testing streams for active status...`);

  const activeResults = [];
  for (let i = 0; i < matches.length; i += 10) {
    const batch = matches.slice(i, i + 10);
    const checks = await Promise.all(
      batch.map(async (m) => {
        const isOk = await verifyStream(m.url);
        return isOk ? m : null;
      })
    );

    for (const item of checks) {
      if (item) {
        console.log(`[AKTIF ✓] [${item.matchedTarget.toUpperCase()}] ${item.name} -> ${item.url.slice(0, 50)}...`);
        activeResults.push(item);
      }
    }
  }

  console.log(`\nTOTAL TARGET CHANNELS AKTIF: ${activeResults.length}`);
  fs.writeFileSync('scripts/active_requested.json', JSON.stringify(activeResults, null, 2));
}

search().catch(console.error);

