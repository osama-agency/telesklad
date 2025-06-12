#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Prisma configuration...');

// Check if we're in Railway environment
const isRailway = process.env.RAILWAY_ENVIRONMENT_NAME;
console.log(`Environment: ${isRailway ? 'Railway' : 'Local'}`);

// Check Node.js version
console.log(`Node.js: ${process.version}`);

// Check if Prisma client is generated
const backendPrismaPath = path.join(__dirname, '../backend/node_modules/.prisma/client');
const frontendPrismaPath = path.join(__dirname, '../node_modules/.prisma/client');

console.log('\n📁 Prisma Client Status:');
console.log(`Backend: ${fs.existsSync(backendPrismaPath) ? '✅ Generated' : '❌ Missing'}`);
console.log(`Frontend: ${fs.existsSync(frontendPrismaPath) ? '✅ Generated' : '❌ Missing'}`);

// Check binary targets
if (fs.existsSync(backendPrismaPath)) {
  const binariesPath = path.join(backendPrismaPath, 'runtime');
  if (fs.existsSync(binariesPath)) {
    const binaries = fs.readdirSync(binariesPath).filter(f => f.includes('query_engine'));
    console.log('\n🔧 Available Query Engine binaries:');
    binaries.forEach(binary => console.log(`  - ${binary}`));
  }
}

// Check environment variables
console.log('\n🌍 Environment Variables:');
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`PRISMA_QUERY_ENGINE_LIBRARY: ${process.env.PRISMA_QUERY_ENGINE_LIBRARY ? '✅ Set' : '❌ Not Set'}`);
console.log(`PRISMA_CLI_BINARY_TARGETS: ${process.env.PRISMA_CLI_BINARY_TARGETS ? '✅ Set' : '❌ Not Set'}`);

// Try to load Prisma client
console.log('\n🚀 Testing Prisma Client:');
try {
  const { PrismaClient } = require('../backend/node_modules/@prisma/client');
  console.log('✅ Backend Prisma client loaded successfully');

  // Try to instantiate (but don't connect)
  const prisma = new PrismaClient();
  console.log('✅ Backend Prisma client instantiated successfully');
} catch (error) {
  console.log('❌ Backend Prisma client error:', error.message);
}

console.log('\n✨ Prisma check complete');
