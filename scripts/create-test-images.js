const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../temp-images');

// Создаем красивые SVG изображения для товаров
const productImages = [
  {
    name: 'abilify-30mg.svg',
    content: `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="abilify30grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#abilify30grad)"/>
      <rect x="50" y="150" width="300" height="100" rx="15" fill="white" opacity="0.9"/>
      <text x="200" y="190" text-anchor="middle" fill="#333" font-size="20" font-family="Arial, sans-serif" font-weight="bold">ABILIFY</text>
      <text x="200" y="220" text-anchor="middle" fill="#666" font-size="16" font-family="Arial, sans-serif">30 mg</text>
      <circle cx="100" cy="300" r="15" fill="white" opacity="0.8"/>
      <circle cx="140" cy="300" r="15" fill="white" opacity="0.8"/>
      <circle cx="180" cy="300" r="15" fill="white" opacity="0.8"/>
    </svg>`
  },
  {
    name: 'abilify-15mg.svg',
    content: `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="abilify15grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffecd2;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fcb69f;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#abilify15grad)"/>
      <rect x="50" y="150" width="300" height="100" rx="15" fill="white" opacity="0.9"/>
      <text x="200" y="190" text-anchor="middle" fill="#333" font-size="20" font-family="Arial, sans-serif" font-weight="bold">ABILIFY</text>
      <text x="200" y="220" text-anchor="middle" fill="#666" font-size="16" font-family="Arial, sans-serif">15 mg</text>
      <circle cx="100" cy="300" r="15" fill="#fcb69f" opacity="0.8"/>
      <circle cx="140" cy="300" r="15" fill="#fcb69f" opacity="0.8"/>
      <circle cx="180" cy="300" r="15" fill="#fcb69f" opacity="0.8"/>
    </svg>`
  },
  {
    name: 'attex-40mg.svg',
    content: `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="attex40grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#a8edea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fed6e3;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#attex40grad)"/>
      <rect x="50" y="130" width="300" height="140" rx="20" fill="white" opacity="0.95"/>
      <text x="200" y="170" text-anchor="middle" fill="#333" font-size="24" font-family="Arial, sans-serif" font-weight="bold">ATTEX</text>
      <text x="200" y="200" text-anchor="middle" fill="#666" font-size="18" font-family="Arial, sans-serif">40 mg</text>
      <text x="200" y="230" text-anchor="middle" fill="#999" font-size="12" font-family="Arial, sans-serif">atomoxetine</text>
      <rect x="80" y="280" width="240" height="40" rx="20" fill="#4CAF50" opacity="0.8"/>
      <text x="200" y="305" text-anchor="middle" fill="white" font-size="14" font-family="Arial, sans-serif">Capsules</text>
    </svg>`
  },
  {
    name: 'atominex-18mg.svg',
    content: `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="atominex18grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff9a9e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fecfef;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#atominex18grad)"/>
      <rect x="50" y="130" width="300" height="140" rx="20" fill="white" opacity="0.95"/>
      <text x="200" y="170" text-anchor="middle" fill="#333" font-size="22" font-family="Arial, sans-serif" font-weight="bold">ATOMINEX</text>
      <text x="200" y="200" text-anchor="middle" fill="#666" font-size="18" font-family="Arial, sans-serif">18 mg</text>
      <text x="200" y="230" text-anchor="middle" fill="#999" font-size="12" font-family="Arial, sans-serif">atomoxetine</text>
      <rect x="80" y="280" width="240" height="40" rx="20" fill="#FF5722" opacity="0.8"/>
      <text x="200" y="305" text-anchor="middle" fill="white" font-size="14" font-family="Arial, sans-serif">Capsules</text>
    </svg>`
  },
  {
    name: 'mirena.svg',
    content: `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mirenagrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#a1c4fd;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#c2e9fb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#mirenagrad)"/>
      <rect x="50" y="130" width="300" height="140" rx="20" fill="white" opacity="0.95"/>
      <text x="200" y="170" text-anchor="middle" fill="#333" font-size="28" font-family="Arial, sans-serif" font-weight="bold">MIRENA</text>
      <text x="200" y="200" text-anchor="middle" fill="#666" font-size="16" font-family="Arial, sans-serif">20 мкг/24 часа</text>
      <text x="200" y="230" text-anchor="middle" fill="#999" font-size="12" font-family="Arial, sans-serif">levonorgestrel</text>
      <path d="M 150 280 Q 200 260 250 280 Q 200 300 150 280" fill="#2196F3" opacity="0.7"/>
      <text x="200" y="290" text-anchor="middle" fill="white" font-size="12" font-family="Arial, sans-serif">IUD</text>
    </svg>`
  },
  {
    name: 'euthyrox-100mcg.svg',
    content: `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="euthyroxgrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#fad0c4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#ffd1ff;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#euthyroxgrad)"/>
      <rect x="50" y="130" width="300" height="140" rx="20" fill="white" opacity="0.95"/>
      <text x="200" y="170" text-anchor="middle" fill="#333" font-size="24" font-family="Arial, sans-serif" font-weight="bold">EUTHYROX</text>
      <text x="200" y="200" text-anchor="middle" fill="#666" font-size="16" font-family="Arial, sans-serif">100 mcg</text>
      <text x="200" y="230" text-anchor="middle" fill="#999" font-size="12" font-family="Arial, sans-serif">levothyroxine</text>
      <rect x="80" y="280" width="240" height="40" rx="20" fill="#9C27B0" opacity="0.8"/>
      <text x="200" y="305" text-anchor="middle" fill="white" font-size="14" font-family="Arial, sans-serif">Tablets</text>
    </svg>`
  }
];

console.log('🎨 Создаю тестовые изображения товаров...\n');

// Создаем папку если её нет
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Создаем изображения
let createdCount = 0;
productImages.forEach(image => {
  const filePath = path.join(IMAGES_DIR, image.name);
  
  if (fs.existsSync(filePath)) {
    console.log(`⏭️  Пропускаю: ${image.name} (уже существует)`);
  } else {
    fs.writeFileSync(filePath, image.content);
    console.log(`✅ Создано: ${image.name}`);
    createdCount++;
  }
});

console.log(`\n📊 ИТОГИ:`);
console.log(`✅ Создано новых изображений: ${createdCount}`);
console.log(`📁 Всего файлов в папке: ${fs.readdirSync(IMAGES_DIR).length}`);

console.log('\n🚀 Теперь можете запустить:');
console.log('   npm run upload:images');

// Показываем список всех файлов
const allFiles = fs.readdirSync(IMAGES_DIR);
if (allFiles.length > 0) {
  console.log('\n📸 Файлы в temp-images/:');
  allFiles.forEach(file => {
    console.log(`  - ${file}`);
  });
} 