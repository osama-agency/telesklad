#!/bin/bash
set -e

echo "🚀 Starting Railway build process..."

# Step 1: Generate Prisma client for frontend
echo "📦 Generating Prisma client for frontend..."
./node_modules/.bin/prisma generate

# Step 2: Build Next.js
echo "🏗️ Building Next.js application..."
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Step 3: Build backend
echo "🔧 Building backend..."
cd backend
./node_modules/.bin/prisma generate
npm run build
cd ..

echo "✅ Build completed successfully!"
