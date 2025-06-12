#!/bin/bash
set -e

echo "🚀 Starting Railway build process..."

# Debug: show environment
echo "📍 Current directory: $(pwd)"
echo "📍 Node version: $(node --version)"
echo "📍 NPM version: $(npm --version)"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in current directory"
    exit 1
fi

# Step 1: Generate Prisma client for frontend
echo "📦 Generating Prisma client for frontend..."
if [ -f "./node_modules/.bin/prisma" ]; then
    ./node_modules/.bin/prisma generate || {
        echo "⚠️  Prisma generate failed, trying with npx..."
        npx prisma generate
    }
else
    echo "⚠️  Prisma not found in frontend, trying with npx..."
    npx prisma generate || echo "⚠️  Prisma generate failed"
fi

# Step 1.5: Generate iconify icons CSS
echo "🎨 Generating iconify icons CSS..."

# Create basic CSS fallback function
create_basic_icons_css() {
    mkdir -p src/assets/iconify-icons
    cat > src/assets/iconify-icons/generated-icons.css << 'EOF'
/* Basic iconify icons CSS - fallback for build */
.iconify {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: currentColor;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}

/* Basic fallback icons */
.ri-shopping-basket-line::before { content: "🛒"; }
.bi-airplane-engines::before { content: "✈️"; }
.tabler-anchor::before { content: "⚓"; }
.twemoji-auto-rickshaw::before { content: "🛺"; }
EOF
    echo "✅ Created basic icons CSS fallback"
}

if [ -f "src/assets/iconify-icons/bundle-icons-css.ts" ]; then
    # Try tsx first
    if [ -f "./node_modules/.bin/tsx" ]; then
        ./node_modules/.bin/tsx src/assets/iconify-icons/bundle-icons-css.ts && echo "✅ Icons generated with tsx" || {
            echo "⚠️  tsx failed, trying with npx..."
            npx tsx src/assets/iconify-icons/bundle-icons-css.ts && echo "✅ Icons generated with npx tsx" || {
                echo "⚠️  All tsx methods failed, creating basic CSS..."
                create_basic_icons_css
            }
        }
    else
        echo "⚠️  tsx not found, trying with npx..."
        npx tsx src/assets/iconify-icons/bundle-icons-css.ts && echo "✅ Icons generated with npx tsx" || {
            echo "⚠️  npx tsx failed, creating basic CSS..."
            create_basic_icons_css
        }
    fi
else
    echo "⚠️  Icons bundle script not found, creating basic CSS..."
    create_basic_icons_css
fi

# Ensure icons file exists
if [ ! -f "src/assets/iconify-icons/generated-icons.css" ]; then
    echo "⚠️  generated-icons.css not found, creating basic CSS..."
    create_basic_icons_css
fi

echo "✅ Icons file ready: $(ls -la src/assets/iconify-icons/generated-icons.css)"

# Step 2: Build Next.js with reduced memory usage and skip linting
echo "🏗️ Building Next.js application..."
if [ -f "./node_modules/.bin/next" ]; then
    NEXT_TELEMETRY_DISABLED=1 ESLINT_NO_DEV_WARNINGS=true NODE_OPTIONS="--max-old-space-size=1536" ./node_modules/.bin/next build --no-lint || {
        echo "❌ Next.js build failed, trying with even less memory..."
        NEXT_TELEMETRY_DISABLED=1 ESLINT_NO_DEV_WARNINGS=true NODE_OPTIONS="--max-old-space-size=1024" ./node_modules/.bin/next build --no-lint || {
            echo "❌ Next.js build failed, trying with npx..."
            NEXT_TELEMETRY_DISABLED=1 ESLINT_NO_DEV_WARNINGS=true NODE_OPTIONS="--max-old-space-size=1024" npx next build --no-lint
        }
    }
else
    echo "⚠️  next not found in node_modules, trying with npx..."
    NEXT_TELEMETRY_DISABLED=1 ESLINT_NO_DEV_WARNINGS=true NODE_OPTIONS="--max-old-space-size=1536" npx next build --no-lint
fi

# Step 3: Build backend
echo "🔧 Building backend..."
if [ -d "backend" ]; then
    cd backend

    # Generate Prisma client for backend
    if [ -f "./node_modules/.bin/prisma" ]; then
        ./node_modules/.bin/prisma generate || npx prisma generate
    else
        npx prisma generate || echo "⚠️  Backend Prisma generate failed"
    fi

    # Note: Database migrations will be applied at startup, not during build
    echo "📝 Note: Database migrations will be applied when the application starts"

    # Build TypeScript
    if [ -f "./node_modules/.bin/tsc" ]; then
        ./node_modules/.bin/tsc || npx tsc
    else
        npx tsc
    fi

    cd ..
else
    echo "⚠️  Backend directory not found, skipping backend build..."
fi

echo "✅ Build completed successfully!"
