const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Backend Server...');
console.log('📍 Environment:', process.env.NODE_ENV);
console.log('📍 Backend Port: 3011');
console.log('📍 Database URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Not set ❌');

// Запускаем backend с ts-node
const backendProcess = spawn('npx', ['ts-node', 'src/server.ts'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: '3011'
  }
});

backendProcess.on('error', (error) => {
  console.error('❌ Failed to start backend:', error);
  process.exit(1);
});

backendProcess.on('close', (code) => {
  console.log('Backend process exited with code:', code);
  process.exit(code);
});

// Обработка сигналов
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down backend...');
  backendProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down backend...');
  backendProcess.kill('SIGINT');
});
