import fs from 'fs';
import path from 'path';

// Helper to generate meaningful descriptions based on channel name & category
function getChannelDescription(c) {
  const nameLower = c.name.toLowerCase();
  const cat = c.category;

  if (nameLower.includes('cartoon network')) {
    return 'Saluran animasi legendaris 24 jam dengan serial kartun populer dunia, komedi aksi, dan petualangan seru.';
  }
  if (nameLower.includes('disney')) {
    return 'Dunia siaran hiburan keluarga, serial animasi orisinal Disney, film animasi magis, dan tayangan edukatif anak.';
  }
  if (nameLower.includes('nickelodeon') || nameLower.includes('nick')) {
    return 'Saluran kartun dan serial komedi remaja ikonik dari Nickelodeon untuk anak, remaja, dan keluarga.';
  }
  if (nameLower.includes('spacetoon')) {
    return 'Stasiun televisi animasi dan kartun ramah anak dengan berbagai genre petualangan dan edukasi moral.';
  }
  if (nameLower.includes('discovery')) {
    return 'Dokumenter sains mendalam, eksplorasi teknologi masa depan, bertahan hidup di alam liar, dan misteri bumi.';
  }
  if (nameLower.includes('animal planet')) {
    return 'Saluran khusus satwa liar, konservasi fauna dunia, hubungan manusia dan hewan, serta petualangan alam terbuka.';
  }
  if (nameLower.includes('bbc earth')) {
    return 'Dokumenter sinematik keajaiban alam semesta, flora-fauna eksotis, dan keindahan planet bumi bersuara jernih.';
  }
  if (nameLower.includes('history')) {
    return 'Eksplorasi peristiwa bersejarah dunia, misteri peradaban kuno, perang besar, dan artefak berharga.';
  }
  if (nameLower.includes('nasa')) {
    return 'Siaran langsung peluncuran roket, kehidupan astronot di stasiun ISS, dan penelitian astronomi antariksa terbaru.';
  }
  if (nameLower.includes('motorvision') || nameLower.includes('car') || nameLower.includes('turbo')) {
    return 'Ulasan mobil super cepat, balapan sirkuit internasional, restorasi otomotif klasik, dan teknologi mesin terkini.';
  }
  if (nameLower.includes('mtv') || nameLower.includes('music') || nameLower.includes('trace')) {
    return 'Koleksi video musik terpopuler 24 jam, tangga lagu dunia hits terbaru, konser live, dan budaya pop.';
  }
  if (nameLower.includes('amc') || nameLower.includes('axn') || nameLower.includes('movie') || nameLower.includes('cinema')) {
    return 'Film-film blockbuster pilihan, sinema laga menegangkan, serial thriller kriminal, dan drama Hollywood berkelas.';
  }
  if (nameLower.includes('abc news') || nameLower.includes('news')) {
    return 'Liputan berita global 24 jam nonstop, analisis tajam peristiwa politik dunia, dan wawancara eksklusif.';
  }
  if (c.country === 'Indonesia') {
    return 'Saluran televisi nasional terpercaya di Indonesia dengan informasi terkini, dialog mendalam, dan edukasi kebudayaan.';
  }

  // Fallbacks per category
  switch (cat) {
    case 'Animation':
      return 'Tayangan kartun dan animasi seru penuh warna untuk hiburan anak-anak dan penggemar kartun.';
    case 'Documentary':
      return 'Dokumenter edukatif mengenai sains, alam semesta, sejarah dunia, dan penemuan menakjubkan.';
    case 'Automotive':
      return 'Dunia otomotif, uji coba mobil performa tinggi, balapan motor dan gaya hidup pengendara.';
    case 'Music':
      return 'Alunan musik nonstop dan video klip pilihan dari berbagai musisi terkemuka dunia.';
    case 'Movies':
      return 'Sinema film pilihan dan serial drama berkualitas untuk menemani waktu santai Anda.';
    case 'News':
      return 'Siaran langsung warta berita terkini dari berbagai belahan dunia dengan fakta akurat.';
    case 'Entertainment':
      return 'Ragam acara hiburan televisi, komedi, gelar wicara, dan pertunjukan panggung menarik.';
    default:
      return 'Siaran langsung berkualitas tinggi yang siap ditonton kapan saja.';
  }
}

async function main() {
  const { DEFAULT_CHANNELS } = await import('../src/data/channels.js');
  console.log('Original total channels:', DEFAULT_CHANNELS.length);

  // Blacklist words indicating Latin, Arabic, Czech, Russian, Turkish, etc.
  const excludePatterns = [
    /latin/i, /latam/i, /brazil/i, /colombia/i, /chile/i, /argentina/i, /mexico/i, /peru/i,
    /espanol/i, /spanish/i, /portuguese/i, /italy/i, /italian/i,
    /arabic/i, /arab/i, /asharq/i, /al arabiya/i, /al araby/i, /aghani/i,
    /czech/i, /cz/i, /hungary/i, /hun/i, /poland/i, /polsat/i, /russia/i, /russian/i,
    /turkey/i, /turkiye/i, /ukraine/i, /ukrainian/i,
    /tamil/i, /telugu/i, /hindi/i, /bengali/i, /urdu/i, /punjabi/i,
    /greek/i, /greece/i, /serbia/i, /croatia/i, /romania/i
  ];

  const filtered = [];
  const seenNames = new Set();

  for (const c of DEFAULT_CHANNELS) {
    const isIndo = c.country === 'Indonesia' || c.language === 'Indonesia' || c.category === 'Indonesia';
    
    if (isIndo) {
      // Keep Indonesian channels
      c.country = 'Indonesia';
      c.language = 'Bahasa Indonesia';
      c.description = getChannelDescription(c);
      filtered.push(c);
      seenNames.add(c.name.toLowerCase());
      continue;
    }

    // Check if channel name or language contains excluded non-English patterns
    const nameStr = c.name.toLowerCase();
    const isExcluded = excludePatterns.some(pat => pat.test(nameStr));

    if (isExcluded) {
      continue;
    }

    // Clean up channel name (e.g. remove "CEE Germany", "Pluto TV" tags, etc. for cleaner display)
    let cleanName = c.name
      .replace(/CEE\s.*$/i, '')
      .replace(/Pluto\sTV/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Deduplicate feeds: if we already have "Cartoon Network" or "Nickelodeon", skip repetitive feeds
    const normalizedKey = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seenNames.has(normalizedKey)) {
      continue;
    }
    seenNames.add(normalizedKey);

    c.name = cleanName;
    c.country = c.country || 'Internasional';
    c.language = 'Bahasa Inggris';
    c.description = getChannelDescription(c);
    filtered.push(c);
  }

  console.log('Filtered clean total (Hanya Indonesia & Bahasa Inggris):', filtered.length);

  // Group breakdown
  const map = {};
  filtered.forEach(c => map[c.category] = (map[c.category] || 0) + 1);
  console.log('Breakdown:', map);

  const categories = [
    "Semua",
    "Indonesia",
    "Animation",
    "Documentary",
    "Automotive",
    "Music",
    "News",
    "Movies",
    "Entertainment"
  ];

  const fileOutput = `// Dataset Bersih: HANYA Bahasa Indonesia & Bahasa Inggris
// Bebas siaran Latin/Arab/Czech/Eropa Timur
// Dilengkapi Deskripsi Informatif & Nama Bersih

export const DEFAULT_CHANNELS = ${JSON.stringify(filtered, null, 2)};

export const CATEGORIES = ${JSON.stringify(categories, null, 2)};
`;

  const targetPath = path.resolve('./src/data/channels.js');
  fs.writeFileSync(targetPath, fileOutput, 'utf-8');
  console.log('Sukses menulis data baru ke:', targetPath);
}

main().catch(console.error);

