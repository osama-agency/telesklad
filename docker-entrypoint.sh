#!/bin/bash
set -e

echo "🐳 Starting Docker container..."
echo "📍 Environment: $NODE_ENV"
echo "📍 Port: $PORT"
echo "📍 Database URL: ${DATABASE_URL:+SET ✅}"

# Function to wait for database
wait_for_db() {
    if [ -n "$DATABASE_URL" ]; then
        echo "⏳ Waiting for database connection..."
        timeout=30
        while [ $timeout -gt 0 ]; do
            if pg_isready -d "$DATABASE_URL" >/dev/null 2>&1; then
                echo "✅ Database is ready"
                return 0
            fi
            echo "⏳ Database not ready, waiting... ($timeout seconds left)"
            sleep 2
            timeout=$((timeout - 2))
        done
        echo "⚠️ Database connection timeout, continuing anyway..."
    else
        echo "⚠️ DATABASE_URL not set, skipping database check"
    fi
}

# Function to run migrations
run_migrations() {
    if [ -n "$DATABASE_URL" ]; then
        echo "🗄️ Running database migrations..."
        cd backend

        # Generate Prisma client
        echo "🔧 Generating Prisma client..."
        npx prisma generate || echo "⚠️ Prisma generate failed, continuing..."

        # Run migrations
        echo "📋 Applying migrations..."
        npx prisma migrate deploy || echo "⚠️ Migrations failed, continuing..."

        cd ..
        echo "✅ Database setup completed"
    else
        echo "⚠️ Skipping migrations (no DATABASE_URL)"
    fi
}

# Function to start backend
start_backend() {
    echo "🔧 Starting backend server..."
    cd backend
    PORT=3011 node dist/server.js &
    BACKEND_PID=$!
    cd ..

    # Wait for backend to start
    echo "⏳ Waiting for backend to be ready..."
    for i in {1..30}; do
        if curl -f http://localhost:3011/health >/dev/null 2>&1; then
            echo "✅ Backend is ready (PID: $BACKEND_PID)"
            return 0
        fi
        sleep 1
    done
    echo "⚠️ Backend health check timeout, continuing anyway..."
}

# Function to start frontend
start_frontend() {
    echo "🚀 Starting frontend server on port $PORT..."
    exec npx next start -p "$PORT"
}

# Main execution
main() {
    # Wait for database
    wait_for_db

    # Run migrations
    run_migrations

    # Start backend in background
    start_backend

    # Start frontend (this will keep the container running)
    start_frontend
}

# Handle signals for graceful shutdown
cleanup() {
    echo "📴 Received signal, shutting down gracefully..."
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    exit 0
}

trap cleanup SIGTERM SIGINT

# Start everything
main
