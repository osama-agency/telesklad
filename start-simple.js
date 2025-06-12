const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Next.js in production mode...');
console.log('📍 Environment:', process.env.NODE_ENV);
console.log('📍 Port:', process.env.PORT || 3000);
console.log('📍 Working directory:', process.cwd());

// Проверяем наличие .next директории
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  console.log('✅ .next directory found at:', nextDir);
  const buildIdPath = path.join(nextDir, 'BUILD_ID');
  if (fs.existsSync(buildIdPath)) {
    const buildId = fs.readFileSync(buildIdPath, 'utf8').trim();
    console.log('✅ Build ID:', buildId);
  } else {
    console.log('❌ BUILD_ID file not found');
  }
} else {
  console.log('❌ .next directory not found at:', nextDir);
  console.log('📁 Current directory contents:');
  const files = fs.readdirSync(process.cwd());
  files.forEach(file => {
    const stats = fs.statSync(file);
    console.log(`  ${stats.isDirectory() ? '📁' : '📄'} ${file}`);
  });
}

// Запускаем Next.js напрямую
const port = process.env.PORT || '3000';
console.log('🚀 Starting Next.js on port', port);

const nextProcess = spawn('./node_modules/.bin/next', ['start', '-p', port], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

nextProcess.on('error', (error) => {
  console.error('❌ Failed to start Next.js:', error);
  process.exit(1);
});

nextProcess.on('close', (code) => {
  console.log('Next.js process exited with code:', code);
  if (code !== 0) {
    // Не выходим сразу, даем время увидеть ошибку
    setTimeout(() => process.exit(code), 5000);
  }
});

// Обработка сигналов
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  nextProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  nextProcess.kill('SIGINT');
});
