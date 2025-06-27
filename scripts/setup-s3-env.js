const fs = require('fs');
const path = require('path');

console.log('🔧 Настройка переменных окружения для S3...\n');

const envPath = path.join(__dirname, '../.env.local');
const envTemplate = `# S3 Configuration for Beget Cloud Storage
S3_ACCESS_KEY=your_access_key_here
S3_SECRET_KEY=your_secret_key_here
S3_BUCKET=2c11548b454d-eldar-agency
S3_ENDPOINT=https://s3.ru1.storage.beget.cloud
S3_REGION=ru-1

# Database
DATABASE_URL=postgresql://eldarweb:fFBFZ9rVxE%26J@suhemaprole.beget.app:5432/eldarweb

# NextAuth
NEXTAUTH_URL=https://strattera.ngrok.app
NEXTAUTH_SECRET=your_nextauth_secret_here

# Telegram
WEBAPP_URL=https://strattera.ngrok.app/webapp
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELESKLAD_BOT_TOKEN=your_telesklad_bot_token
WEBAPP_TELEGRAM_BOT_TOKEN=your_webapp_bot_token
TELEGRAM_COURIER_ID=7690550402

# Redis
REDIS_URL=redis://localhost:6379
`;

if (fs.existsSync(envPath)) {
  console.log('⚠️  Файл .env.local уже существует');
  console.log('📝 Проверьте что в нем есть следующие переменные:');
  console.log('   - S3_ACCESS_KEY');
  console.log('   - S3_SECRET_KEY');
  console.log('   - S3_BUCKET');
  console.log('   - S3_ENDPOINT');
  console.log('   - S3_REGION\n');
  
  const content = fs.readFileSync(envPath, 'utf8');
  const hasS3Keys = content.includes('S3_ACCESS_KEY') && content.includes('S3_SECRET_KEY');
  
  if (hasS3Keys) {
    console.log('✅ S3 переменные найдены в .env.local');
  } else {
    console.log('❌ S3 переменные не найдены');
    console.log('📋 Добавьте следующие строки в .env.local:');
    console.log('');
    console.log('S3_ACCESS_KEY=your_access_key_here');
    console.log('S3_SECRET_KEY=your_secret_key_here');
    console.log('S3_BUCKET=2c11548b454d-eldar-agency');
    console.log('S3_ENDPOINT=https://s3.ru1.storage.beget.cloud');
    console.log('S3_REGION=ru-1');
  }
} else {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Создан файл .env.local с шаблоном');
  console.log('📝 Отредактируйте файл .env.local и укажите:');
  console.log('   - S3_ACCESS_KEY (ваш ключ доступа)');
  console.log('   - S3_SECRET_KEY (ваш секретный ключ)');
  console.log('   - Другие необходимые переменные\n');
}

console.log('📚 Для получения ключей S3:');
console.log('   1. Войдите в панель управления Beget');
console.log('   2. Перейдите в раздел "Облачное хранилище"');
console.log('   3. Создайте новые ключи доступа');
console.log('   4. Скопируйте Access Key и Secret Key в .env.local\n');

console.log('🚀 После настройки запустите:');
console.log('   npm run upload:images'); 