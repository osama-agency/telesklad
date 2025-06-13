const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production servers...');
console.log('📍 Environment:', process.env.NODE_ENV);
console.log('📍 Next.js Port:', process.env.PORT || 3000);
console.log('📍 Backend Port:', process.env.BACKEND_PORT || 3011);

// Запускаем backend
console.log('🔧 Starting backend server...');
const backendProcess = spawn('node', ['backend/dist/server.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.BACKEND_PORT || '3011'
  }
});

backendProcess.on('error', (error) => {
  console.error('❌ Failed to start backend:', error);
  // Пробуем запустить через ts-node если dist не существует
  console.log('🔧 Trying to start backend with ts-node...');
  const tsBackendProcess = spawn('npx', ['ts-node', 'backend/src/server.ts'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: process.env.BACKEND_PORT || '3011'
    }
  });

  tsBackendProcess.on('error', (error) => {
    console.error('❌ Failed to start backend with ts-node:', error);
  });
});

// Запускаем Next.js
console.log('🚀 Starting Next.js...');
const nextProcess = spawn('./node_modules/.bin/next', ['start', '-p', process.env.PORT || '3000'], {
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

// Обработка сигналов
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  backendProcess.kill('SIGTERM');
  nextProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  backendProcess.kill('SIGINT');
  nextProcess.kill('SIGINT');
});
