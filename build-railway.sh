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

# Step 1.5: Generate iconify icons CSS
echo "🎨 Generating iconify icons CSS..."
if [ -f "./node_modules/.bin/tsx" ]; then
    ./node_modules/.bin/tsx src/assets/iconify-icons/bundle-icons-css.ts
else
    echo "⚠️  tsx not found, trying with npx..."
    npx tsx src/assets/iconify-icons/bundle-icons-css.ts
fi

# Step 2: Build Next.js with reduced memory usage and skip linting
echo "🏗️ Building Next.js application..."
NEXT_TELEMETRY_DISABLED=1 ESLINT_NO_DEV_WARNINGS=true NODE_OPTIONS="--max-old-space-size=1536" ./node_modules/.bin/next build --no-lint || {
    echo "❌ Next.js build failed, trying with even less memory..."
    NEXT_TELEMETRY_DISABLED=1 ESLINT_NO_DEV_WARNINGS=true NODE_OPTIONS="--max-old-space-size=1024" ./node_modules/.bin/next build --no-lint
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
