#!/bin/bash

# VPS Production Deploy Script
# Runs on VPS to deploy the application with host nginx + Docker app

set -e

# Configuration
COMPOSE_FILE="docker-compose.production.yml"
PROJECT_DIR="/opt/telesite"
BACKUP_DIR="/opt/telesite/backups"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Create backup of current deployment
create_backup() {
    log "📦 Creating backup of current deployment..."

    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"

    if [ -d ".next" ]; then
        tar -czf "$BACKUP_FILE" .next/ docker-compose.production.yml || true
        success "Backup created: $BACKUP_FILE"
    else
        warning "No existing .next directory to backup"
    fi
}

# Extract build archive
extract_build() {
    log "📦 Extracting build archive..."

    if [ -f "next-build.tar.gz" ]; then
        tar -xzf next-build.tar.gz
        rm next-build.tar.gz
        success "Build extracted successfully"
    else
        error "Build archive not found!"
    fi
}

# Install/update dependencies
install_dependencies() {
    log "📚 Installing dependencies..."

    # Update npm if needed
    if ! npm --version >/dev/null 2>&1; then
        error "npm not found. Please install Node.js"
    fi

    # Install production dependencies
    NODE_ENV=production npm ci --only=production
    success "Dependencies installed"
}

# Stop current services
stop_services() {
    log "🛑 Stopping current services..."

    if [ -f "$COMPOSE_FILE" ]; then
        docker-compose -f "$COMPOSE_FILE" down || warning "Failed to stop some containers"
    fi

    # Clean up orphaned containers
    docker container prune -f || true

    success "Services stopped"
}

# Start services
start_services() {
    log "🚀 Starting services..."

    # Build and start containers
    docker-compose -f "$COMPOSE_FILE" up --build -d

    # Wait for services to be healthy
    log "⏳ Waiting for services to be healthy..."
    sleep 5

    # Check if services are running
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        success "Services started successfully"
    else
        error "Services failed to start properly"
    fi
}

# Verify nginx configuration
verify_nginx() {
    log "🔍 Verifying nginx configuration..."

    if nginx -t; then
        success "Nginx configuration is valid"

        # Reload nginx to apply any changes
        systemctl reload nginx
        success "Nginx reloaded"
    else
        error "Nginx configuration is invalid"
    fi
}

# Health check
health_check() {
    log "🏥 Performing health check..."

    # Wait a bit more for app to fully start
    sleep 10

    # Check if app responds
    if curl -f -s "http://localhost:3000/api/health" > /dev/null; then
        success "Internal health check passed"
    else
        warning "Internal health check failed, but continuing..."
    fi

    # Check external access
    if curl -f -s "https://dsgrating.ru/api/health" > /dev/null; then
        success "External health check passed"
    else
        warning "External health check failed"
    fi
}

# Cleanup old backups (keep last 10)
cleanup_backups() {
    log "🧹 Cleaning up old backups..."

    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -name "backup-*.tar.gz" -type f | sort -r | tail -n +11 | xargs rm -f || true
        success "Old backups cleaned up"
    fi
}

# Main deployment process
main() {
    log "🚀 Starting VPS production deployment..."

    # Change to project directory
    cd "$PROJECT_DIR"

    # Run deployment steps
    create_backup
    extract_build
    install_dependencies
    stop_services
    start_services
    verify_nginx
    health_check
    cleanup_backups

    success "🎉 Production deployment completed successfully!"

    # Show final status
    log "📊 Final status:"
    docker-compose -f "$COMPOSE_FILE" ps
    systemctl status nginx --no-pager -l
}

# Run main function
main "$@"
