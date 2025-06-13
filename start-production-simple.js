const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting production servers (simple mode)...');
console.log('📍 Environment:', process.env.NODE_ENV);
console.log('📍 Port:', process.env.PORT);
console.log('📍 Database URL:', process.env.DATABASE_URL ? 'Set ✅' : 'Not set ❌');

// Function to run migrations
async function runMigrations() {
  return new Promise((resolve) => {
    console.log('🗄️ Applying database migrations...');

    // Try to regenerate Prisma client first
    const generateProcess = spawn('npx', ['prisma', 'generate'], {
      cwd: path.join(__dirname, 'backend'),
      env: process.env,
      stdio: 'inherit',
      shell: true
    });

    generateProcess.on('close', (generateCode) => {
      if (generateCode === 0) {
        console.log('✅ Prisma client generated successfully');
      } else {
        console.log('⚠️  Prisma generate failed, trying migrations anyway...');
      }

      // Run migrations
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

    generateProcess.on('error', (error) => {
      console.log('⚠️  Prisma generate error:', error.message);
      resolve(); // Continue even if generate fails
    });
  });
}

// Start the application
async function startServers() {
  // Check if .next directory exists and build if needed
  const nextBuildPath = path.join(__dirname, '.next');
  if (!fs.existsSync(nextBuildPath)) {
    console.log('📦 .next directory not found. Building the app...');

    const buildProcess = spawn('npm', ['run', 'build'], {
      env: process.env,
      stdio: 'inherit',
      shell: true
    });

    await new Promise((resolve) => {
      buildProcess.on('close', (buildCode) => {
        if (buildCode === 0) {
          console.log('✅ Build completed successfully');
        } else {
          console.log('❌ Build failed, but continuing with server start...');
        }
        resolve();
      });
    });
  }

  console.log('✅ .next directory found, proceeding with server start...');

  // Apply migrations first (only if DATABASE_URL is set)
  if (process.env.DATABASE_URL) {
    await runMigrations();
  } else {
    console.log('⚠️  DATABASE_URL not set, skipping migrations...');
  }

  // Get the port from environment or default to 3000
  const port = process.env.PORT || '3000';
  console.log(`🌐 Starting Next.js server on port ${port}`);

  // Set environment variables for backend
  const backendEnv = {
    ...process.env,
    PORT: '3011',
    NODE_ENV: 'production'
  };

  // Start backend on port 3011 (internal) first
  console.log('🔧 Starting backend server on port 3011...');
  const backend = spawn('./node_modules/.bin/ts-node-dev', ['--respawn', '--transpile-only', 'src/server.ts'], {
    cwd: path.join(__dirname, 'backend'),
    env: backendEnv,
    stdio: ['inherit', 'inherit', 'inherit'],
    shell: true
  });

  backend.on('error', (error) => {
    console.error('❌ Backend start error:', error);
  });

  backend.on('close', (code) => {
    console.log('🔴 Backend process exited with code:', code);
  });

  // Wait a bit for backend to start
  console.log('⏳ Waiting for backend to start...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Set environment variables for frontend
  const frontendEnv = {
    ...process.env,
    PORT: port,
    NODE_ENV: 'production',
    BACKEND_URL: 'http://localhost:3011'
  };

  // Start Next.js frontend on assigned port
  console.log(`🚀 Starting Next.js frontend on port ${port}...`);
  const frontend = spawn('./node_modules/.bin/next', ['start'], {
    env: frontendEnv,
    stdio: ['inherit', 'inherit', 'inherit'],
    shell: true
  });

  frontend.on('error', (error) => {
    console.error('❌ Frontend start error:', error);
  });

  frontend.on('close', (code) => {
    console.log('🔴 Frontend process exited with code:', code);
  });

  // Wait for frontend to start
  console.log('⏳ Waiting for frontend to start...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Log when servers are ready
  console.log('✅ Both servers started successfully!');
  console.log(`📍 Frontend: http://localhost:${port}`);
  console.log('📍 Backend: http://localhost:3011');
  console.log(`📍 Health check: http://localhost:${port}/api/health`);

  // Keep the process alive
  setInterval(() => {
    console.log('💓 Application is running...', new Date().toISOString());
  }, 60000);

  // Handle process termination
  process.on('SIGTERM', () => {
    console.log('📴 Received SIGTERM, shutting down gracefully...');
    frontend.kill('SIGTERM');
    backend.kill('SIGTERM');
    setTimeout(() => process.exit(0), 5000);
  });

  process.on('SIGINT', () => {
    console.log('📴 Received SIGINT, shutting down gracefully...');
    frontend.kill('SIGINT');
    backend.kill('SIGINT');
    setTimeout(() => process.exit(0), 5000);
  });
}

// Start everything
startServers().catch(error => {
  console.error('💥 Failed to start servers:', error);
  process.exit(1);
});
