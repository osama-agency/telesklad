#!/bin/bash
set -e

echo "🚀 Starting Railway build process..."

# Step 1: Generate Prisma client for frontend
echo "📦 Generating Prisma client for frontend..."
if [ -f "./node_modules/.bin/prisma" ]; then
    ./node_modules/.bin/prisma generate
else
    echo "⚠️  Prisma not found in frontend, skipping..."
fi

# Step 2: Build Next.js with reduced memory usage
echo "🏗️ Building Next.js application..."
NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS="--max-old-space-size=1536" ./node_modules/.bin/next build || {
    echo "❌ Next.js build failed, trying with even less memory..."
    NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS="--max-old-space-size=1024" ./node_modules/.bin/next build
}

# Step 3: Build backend
echo "🔧 Building backend..."
cd backend
if [ -f "./node_modules/.bin/prisma" ]; then
    ./node_modules/.bin/prisma generate
fi
./node_modules/.bin/tsc || npx tsc
cd ..

echo "✅ Build completed successfully!"
