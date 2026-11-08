import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newUSChannels = [
  {
    id: "cartoon-network-us",
    name: "Cartoon Network (US)",
    category: "Animation",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/80/Cartoon_Network_2010_logo.svg",
    country: "United States",
    language: "Bahasa Inggris",
    streamUrl: "http://tvsen7.aynascope.net/cartoonnetwork/index.m3u8",
    description: "Saluran animasi terpopuler dari Warner Bros Discovery yang menyiarkan serial animasi legendaris dan modern 24 jam nonstop."
  },
  {
    id: "disney-channel-us",
    name: "Disney Channel (US)",
    category: "Animation",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d2/2019_Disney_Channel_logo.svg",
    country: "United States",
    language: "Bahasa Inggris",
    streamUrl: "http://4.30.180.36:8420/disneychannel/index.m3u8?token=test",
    description: "Saluran televisi resmi Disney menyiarkan serial orisinal, film animasi keluarga, dan petualangan khas Disney Channel."
  },
  {
    id: "disney-junior-us",
    name: "Disney Junior (US)",
    category: "Animation",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Disney_Junior_2019_logo.svg",
    country: "United States",
    language: "Bahasa Inggris",
    streamUrl: "http://tvsen7.aynascope.net/disney/index.m3u8",
    description: "Tayangan kartun edukatif dan menyenangkan untuk anak-anak dan keluarga dari Disney Junior."
  },
  {
    id: "nickelodeon-global",
    name: "Nickelodeon",
    category: "Animation",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Nickelodeon_2009_logo.svg",
    country: "United States",
    language: "Bahasa Inggris",
    streamUrl: "http://103.135.253.32:8080/NICK/index.m3u8",
    description: "Saluran utama Nickelodeon menyiarkan serial anak-anak dan kartun legendaris berbahasa Inggris."
  },
  {
    id: "nickelodeon-nicktoons-us",
    name: "Nicktoons (US)",
    category: "Animation",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Nicktoons_2014.png",
    country: "United States",
    language: "Bahasa Inggris",
    streamUrl: "https://tvsen7.aynascope.net/nicktoons/index.m3u8",
    description: "Saluran khusus kartun Nickelodeon 24 jam nonstop: SpongeBob SquarePants, The Fairly OddParents, Avatar, dan Danny Phantom."
  },
  {
    id: "nickelodeon-nickjr-us",
    name: "Nick Jr. (US)",
    category: "Animation",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/23/Nick_Jr._logo_2009.svg",
    country: "United States",
    language: "Bahasa Inggris",
    streamUrl: "http://tvsen7.aynascope.net/nickjr/index.m3u8",
    description: "Siaran edukatif dan ramah anak dari Nick Jr: PAW Patrol, Blue's Clues, Dora the Explorer, dan Peppa Pig."
  },
  {
    id: "nickelodeon-teennick-us",
    name: "TeenNick (US)",
    category: "Animation",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/ec/TeenNick_2019.png",
    country: "United States",
    language: "Bahasa Inggris",
    streamUrl: "http://tvsen7.aynascope.net/teennick/index.m3u8",
    description: "Program komedi remaja dan drama dari Nickelodeon: iCarly, Victorious, Sam & Cat, Henry Danger, dan Drake & Josh."
  },
  {
    id: "pbs-kids-us",
    name: "PBS Kids (US)",
    category: "Animation",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/ee/PBS_Kids_logo_2022.svg",
    country: "United States",
    language: "Bahasa Inggris",
    streamUrl: "https://tvsen7.aynascope.net/pbskids/index.m3u8",
    description: "Saluran animasi publik nomor satu Amerika dengan kurikulum edukasi pemenang penghargaan Emmy Awards."
  },
  {
    id: "cartoon-network-hd",
    name: "Cartoon Network HD",
    category: "Animation",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/80/Cartoon_Network_2010_logo.svg",
    country: "United States",
    language: "Bahasa Inggris",
    streamUrl: "https://cdn4.skygo.mn/live/disk1/Cartoon_Network/HLSv3-FTA/Cartoon_Network.m3u8",
    description: "Siaran langsung berkualitas HD menayangkan Ben 10, Adventure Time, The Amazing World of Gumball, dan Teen Titans Go."
  },
  {
    id: "hbo-us",
    name: "HBO (US)",
    category: "Movies",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg",
    country: "United States",
    language: "Bahasa Inggris",
    streamUrl: "http://tvsen7.aynascope.net/hbo/index.m3u8",
    description: "Saluran film premium terkemuka Amerika yang menayangkan film-film blockbuster Hollywood dan serial orisinal ternama."
  },
  {
    id: "hbo-2-us",
    name: "HBO 2 (US)",
    category: "Movies",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg",
    country: "United States",
    language: "Bahasa Inggris",
    streamUrl: "http://tvsen7.aynascope.net/hbo2/index.m3u8",
    description: "Saluran kedua dari HBO yang menayangkan pilihan film aksi, komedi, drama, dan serial pilihan 24 jam."
  },
  {
    id: "comedy-central-us",
    name: "Comedy Central (US)",
    category: "Entertainment",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Comedy_Central_2018.svg",
    country: "United States",
    language: "Bahasa Inggris",
    streamUrl: "http://tvsen7.aynascope.net/comedycentral/index.m3u8",
    description: "Saluran komedi nomor satu Amerika, rumah bagi South Park, The Daily Show, stand-up comedy, dan komedi situasi."
  },
  {
    id: "fx-network-us",
    name: "FX (US)",
    category: "Entertainment",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/84/FX_Network_logo.svg",
    country: "United States",
    language: "Bahasa Inggris",
    streamUrl: "https://tvsen7.aynascope.net/fx/index.m3u8",
    description: "Saluran drama dan film berkualitas tinggi dari FX Networks yang menyuguhkan serial pemenang penghargaan bergengsi."
  },
  {
    id: "syfy-us",
    name: "SYFY (US)",
    category: "Entertainment",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Syfy_2017.svg",
    country: "United States",
    language: "Bahasa Inggris",
    streamUrl: "http://tvsen7.aynascope.net/syfy/index.m3u8",
    description: "Saluran khusus fiksi ilmiah, fantasi, paranormal, dan petualangan futuristik dari NBCUniversal."
  },
  {
    id: "hgtv-us",
    name: "HGTV (US)",
    category: "Entertainment",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/18/HGTV_2015_logo.svg",
    country: "United States",
    language: "Bahasa Inggris",
    streamUrl: "http://tvsen7.aynascope.net/hgtv/index.m3u8",
    description: "Home & Garden Television: Inspirasi desain interior, renovasi rumah, dan gaya hidup properti terpopuler di Amerika."
  },
  {
    id: "lifetime-us",
    name: "Lifetime (US)",
    category: "Entertainment",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Lifetime_2020.svg",
    country: "United States",
    language: "Bahasa Inggris",
    streamUrl: "https://tvsen7.aynascope.net/lifetime/index.m3u8",
    description: "Saluran drama wanita dan film keluarga orisinal terpopuler yang menginspirasi penonton di seluruh Amerika Serikat."
  },
  {
    id: "laff-tv-us",
    name: "Laff TV (US)",
    category: "Entertainment",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Laff_logo_2015.png",
    country: "United States",
    language: "Bahasa Inggris",
    streamUrl: "http://tvsen7.aynascope.net/laff/index.m3u8",
    description: "Jaringan komedi klasik Amerika yang menyiarkan sitkom legendaris seperti That '70s Show, Home Improvement, dan 3rd Rock."
  }
];

const targetPath = path.join(__dirname, '../src/data/channels.js');

async function run() {
  const { DEFAULT_CHANNELS, CATEGORIES } = await import('../src/data/channels.js');
  console.log('Existing channels count:', DEFAULT_CHANNELS.length);

  const existingIds = new Set(DEFAULT_CHANNELS.map(c => c.id));
  const toAdd = newUSChannels.filter(c => !existingIds.has(c.id));

  console.log('Adding new US channels:', toAdd.length);

  // Group: Put Indonesian channels first, then US major channels, then rest
  const indoChannels = DEFAULT_CHANNELS.filter(c => c.category === 'Indonesia');
  const otherChannels = DEFAULT_CHANNELS.filter(c => c.category !== 'Indonesia');

  const combined = [...indoChannels, ...toAdd, ...otherChannels];
  console.log('Total combined channels:', combined.length);

  const fileContent = `// Dataset Bersih: HANYA Bahasa Indonesia & Bahasa Inggris
// Termasuk Saluran Unggulan US: Cartoon Network, Disney, Nickelodeon, HBO, FX, SYFY, Comedy Central
// Dilengkapi Deskripsi Informatif & Nama Bersih

export const DEFAULT_CHANNELS = ${JSON.stringify(combined, null, 2)};

export const CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)};
`;

  fs.writeFileSync(targetPath, fileContent, 'utf8');
  console.log('Successfully saved to', targetPath);
}

run();

