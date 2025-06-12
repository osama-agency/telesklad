const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting production servers...');

// Function to run migrations
async function runMigrations() {
  return new Promise((resolve) => {
    console.log('🗄️ Applying database migrations...');

    const migrationProcess = spawn('npx', ['prisma', 'migrate', 'deploy'], {
      cwd: path.join(__dirname, 'backend'),
      env: process.env,
      stdio: 'inherit',
      shell: true
    });

    migrationProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Database migrations applied successfully');
        resolve();
      } else {
        console.log('⚠️  Migration failed, continuing anyway...');
        resolve(); // Continue even if migrations fail
      }
    });

    migrationProcess.on('error', (error) => {
      console.log('⚠️  Migration error:', error.message);
      resolve(); // Continue even if migrations fail
    });
  });
}

// Start the application
async function startServers() {
  // Apply migrations first (only if DATABASE_URL is set)
  if (process.env.DATABASE_URL) {
    await runMigrations();
  } else {
    console.log('⚠️  DATABASE_URL not set, skipping migrations...');
  }

  // Get the port from Railway or default to 3000
  const port = process.env.PORT || '3000';
  console.log(`🌐 Starting Next.js server on port ${port}`);

  // Start Next.js frontend on Railway's assigned port
  const frontend = spawn('./node_modules/.bin/next', ['start'], {
    env: { ...process.env, PORT: port },
    stdio: 'inherit',
    shell: true
  });

  // Start backend on port 3011 (internal)
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
}

// Start everything
startServers().catch(error => {
  console.error('Failed to start servers:', error);
  process.exit(1);
});
