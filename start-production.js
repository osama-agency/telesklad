const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting production servers...');

// Start Next.js frontend
const frontend = spawn('./node_modules/.bin/next', ['start'], {
  env: { ...process.env, PORT: '3000' },
  stdio: 'inherit',
  shell: true
});

// Start backend
const backend = spawn('node', ['dist/server.js'], {
  cwd: path.join(__dirname, 'backend'),
  env: { ...process.env, PORT: '3011' },
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Shutting down servers...');
  frontend.kill();
  backend.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  frontend.kill();
  backend.kill();
  process.exit(0);
});
