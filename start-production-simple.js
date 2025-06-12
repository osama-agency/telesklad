const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting production servers...');
console.log('📍 Environment:', process.env.NODE_ENV);
console.log('📍 Frontend Port:', process.env.PORT || 3000);
console.log('📍 Backend Port: 3011');
console.log('📍 Database URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Not set ❌');

// Запускаем backend сервер
console.log('🔧 Starting backend server on port 3011...');
const backendProcess = spawn('npx', ['ts-node', 'src/server.ts'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: '3011',
    DATABASE_URL: process.env.DATABASE_URL
  }
});

backendProcess.on('error', (error) => {
  console.error('❌ Backend error:', error);
});

backendProcess.on('close', (code) => {
  console.log('🔴 Backend process exited with code:', code);
});

// Ждем запуска backend
setTimeout(() => {
  console.log('🚀 Starting Next.js frontend...');
  const frontendPort = process.env.PORT || '3000';

  const frontendProcess = spawn('./node_modules/.bin/next', ['start', '-p', frontendPort], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      BACKEND_URL: 'http://localhost:3011'
    }
  });

  frontendProcess.on('error', (error) => {
    console.error('❌ Frontend error:', error);
  });

  frontendProcess.on('close', (code) => {
    console.log('🔴 Frontend process exited with code:', code);
    backendProcess.kill('SIGTERM');
    process.exit(code);
  });

  // Обработка сигналов
  process.on('SIGTERM', () => {
    console.log('📴 Received SIGTERM, shutting down...');
    frontendProcess.kill('SIGTERM');
    backendProcess.kill('SIGTERM');
    setTimeout(() => process.exit(0), 5000);
  });

  process.on('SIGINT', () => {
    console.log('📴 Received SIGINT, shutting down...');
    frontendProcess.kill('SIGINT');
    backendProcess.kill('SIGINT');
    setTimeout(() => process.exit(0), 5000);
  });
}, 5000); // Даем backend 5 секунд на запуск
