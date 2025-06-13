#!/bin/bash

# Deploy script for production (no nginx in Docker)
# Host nginx proxy to Docker app + postgres

set -e  # Exit on any error

# Configuration
VPS_HOST="82.202.131.251"
VPS_USER="deploy"
SSH_KEY="~/.ssh/telesite_deploy"
PROJECT_DIR="/opt/telesite"
COMPOSE_FILE="docker-compose.production.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
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

# Function to execute commands on VPS
vps_exec() {
    ssh -i "$SSH_KEY" "$VPS_USER@$VPS_HOST" "$1"
}

# Function to check if command exists on VPS
vps_command_exists() {
    vps_exec "command -v $1 >/dev/null 2>&1"
}

# Main deployment function
deploy() {
    log "🚀 Starting production deployment..."

    # Step 1: Build Next.js locally
    log "📦 Building Next.js application..."
    if ! npm run build:next; then
        error "Failed to build Next.js application"
    fi
    success "Next.js build completed"

    # Step 2: Copy files to VPS
    log "📤 Uploading files to VPS..."
    if ! rsync -avz --delete \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=.next \
        --exclude=backend/node_modules \
        -e "ssh -i $SSH_KEY" \
        ./ "$VPS_USER@$VPS_HOST:$PROJECT_DIR/"; then
        error "Failed to upload files to VPS"
    fi
    success "Files uploaded successfully"

    # Step 3: Create build archive and upload
    log "📦 Creating and uploading build archive..."
    tar -czf next-build.tar.gz .next/
    if ! scp -i "$SSH_KEY" next-build.tar.gz "$VPS_USER@$VPS_HOST:$PROJECT_DIR/"; then
        error "Failed to upload build archive"
    fi
    rm next-build.tar.gz
    success "Build archive uploaded"

    # Step 4: Deploy on VPS
    log "🔄 Deploying on VPS..."
    vps_exec "cd $PROJECT_DIR && ./scripts/vps-production-deploy.sh"

    # Step 5: Health check
    log "🏥 Performing health check..."
    sleep 10  # Wait for services to start

    if curl -f -s "https://dsgrating.ru/api/health" > /dev/null; then
        success "🎉 Deployment successful! Site is available at https://dsgrating.ru"
    else
        warning "⚠️  Deployment completed but health check failed. Please check manually."
    fi

    # Step 6: Show status
    log "📊 Current system status:"
    vps_exec "cd $PROJECT_DIR && docker-compose -f $COMPOSE_FILE ps"
}

# Help function
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Production deployment script for telesite (nginx on host + Docker app)"
    echo ""
    echo "Options:"
    echo "  help          Show this help message"
    echo "  status        Show current deployment status"
    echo "  logs          Show application logs"
    echo "  restart       Restart services"
    echo ""
    echo "Examples:"
    echo "  $0                  # Deploy to production"
    echo "  $0 status           # Check status"
    echo "  $0 logs             # View logs"
}

# Handle command line arguments
case "${1:-deploy}" in
    "help"|"-h"|"--help")
        show_help
        ;;
    "status")
        log "📊 Checking deployment status..."
        vps_exec "cd $PROJECT_DIR && docker-compose -f $COMPOSE_FILE ps"
        vps_exec "systemctl status nginx"
        ;;
    "logs")
        log "📋 Showing application logs..."
        vps_exec "cd $PROJECT_DIR && docker-compose -f $COMPOSE_FILE logs --tail=50 -f"
        ;;
    "restart")
        log "🔄 Restarting services..."
        vps_exec "cd $PROJECT_DIR && docker-compose -f $COMPOSE_FILE restart"
        vps_exec "systemctl reload nginx"
        success "Services restarted"
        ;;
    "deploy"|"")
        deploy
        ;;
    *)
        error "Unknown command: $1. Use 'help' to see available commands."
        ;;
esac
