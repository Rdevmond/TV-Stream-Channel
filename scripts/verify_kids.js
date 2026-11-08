const http = require('http');
const https = require('https');

const candidates = [
  { name: 'Cartoon Network (US)', url: 'https://turnerlive.warnermediacdn.com/hls/live/2023160/tooneast/noslate/VIDEO_3_1928000.m3u8', category: 'Animation' },
  { name: 'Cartoon Network Asia', url: 'https://cdn4.skygo.mn/live/disk1/Cartoon_Network/HLSv3-FTA/Cartoon_Network.m3u8', category: 'Animation' },
  { name: 'Cartoon Network Asia 2', url: 'http://202.150.165.66:8088/play/200-CartoonNetwork/index.m3u8', category: 'Animation' },
  { name: 'Cartoonito Asia', url: 'http://cdn4.skygo.mn/live/disk1/Boomerang/HLSv3-FTA/Boomerang.m3u8', category: 'Animation' },
  { name: 'Disney Channel US', url: 'http://4.30.180.36:8420/disneychannel/index.m3u8?token=test', category: 'Animation' },
  { name: 'Disney Junior US', url: 'http://tvsen5.aynascope.net/disney/index.m3u8', category: 'Animation' },
  { name: 'Disney Junior US 2', url: 'http://tvsen7.aynascope.net/disneyjr/index.m3u8', category: 'Animation' },
  { name: 'Disney XD US', url: 'http://89.187.179.148:826/1368/gXwiagaXda/1672', category: 'Animation' },
  { name: 'Nickelodeon Asia', url: 'http://103.253.74.210:7070/stream/117/index.m3u8', category: 'Animation' },
  { name: 'Nick Jr Asia', url: 'http://103.253.74.210:7070/stream/116/index.m3u8', category: 'Animation' },
  { name: 'Nicktoons US', url: 'https://tvsen7.aynascope.net/nicktoons/index.m3u8', category: 'Animation' },
  { name: 'Nicktoons US 2', url: 'http://41.205.93.154/NICKTOONS/index.m3u8', category: 'Animation' },
  { name: 'TeenNick US', url: 'http://tvsen7.aynascope.net/teennick/index.m3u8', category: 'Animation' },
  { name: 'Nick Jr US', url: 'http://tvsen7.aynascope.net/nickjr/index.m3u8', category: 'Animation' }
];

function test(item) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(item.url);
      const mod = parsed.protocol === 'https:' ? https : http;
      const req = mod.get(item.url, {
        timeout: 6000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => {
          body += chunk;
          if (body.length > 2000) req.destroy();
        });
        res.on('close', () => {
          const isHls = body.includes('#EXTM3U') || body.includes('.m3u8') || body.includes('.ts');
          resolve({ ...item, status: res.statusCode, isHls, length: body.length });
        });
      });
      req.on('error', err => resolve({ ...item, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ...item, error: 'timeout' }); });
    } catch (e) {
      resolve({ ...item, error: e.message });
    }
  });
}

(async () => {
  console.log('Testing candidates...');
  for (const c of candidates) {
    const res = await test(c);
    console.log(res.name, '=>', res.status || res.error, 'isHls:', res.isHls);
  }
})();

