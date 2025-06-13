#!/bin/bash

# 🚀 Professional Auto-Deploy Script for Production
# Author: DevOps Engineer 2025
# Usage: ./deploy.sh

set -euo pipefail  # Exit on error, undefined vars, pipe failures
IFS=$'\n\t'       # Secure Internal Field Separator

# ============================================================================
# CONFIGURATION
# ============================================================================
PROJECT_DIR="/opt/telesite"
BRANCH="main"
LOG_FILE="/var/log/deploy.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================
log() {
    echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo "[$TIMESTAMP] ❌ ERROR: $1" | tee -a "$LOG_FILE" >&2
}

log_success() {
    echo "[$TIMESTAMP] ✅ SUCCESS: $1" | tee -a "$LOG_FILE"
}

# ============================================================================
# TELEGRAM NOTIFICATION FUNCTION
# ============================================================================
send_telegram_notification() {
    local message="$1"
    local status="$2"

    if [[ -n "${TELEGRAM_BOT_TOKEN:-}" && -n "${TELEGRAM_CHAT_ID:-}" ]]; then
        local emoji="🚀"
        [[ "$status" == "error" ]] && emoji="❌"
        [[ "$status" == "success" ]] && emoji="✅"

        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=${emoji} Deploy $(hostname): ${message}" \
            -d "parse_mode=HTML" \
            --max-time 10 || true
    fi
}

# ============================================================================
# ERROR HANDLER
# ============================================================================
cleanup_on_error() {
    log_error "Deploy failed at line $1"
    send_telegram_notification "Deploy failed at line $1" "error"
    exit 1
}

trap 'cleanup_on_error $LINENO' ERR

# ============================================================================
# MAIN DEPLOYMENT LOGIC
# ============================================================================
main() {
    log "🚀 Starting deployment process..."
    send_telegram_notification "Starting deployment..." "info"

    # 1. Navigate to project directory
    log "📁 Navigating to project directory: $PROJECT_DIR"
    if [[ ! -d "$PROJECT_DIR" ]]; then
        log_error "Project directory $PROJECT_DIR does not exist"
        exit 1
    fi
    cd "$PROJECT_DIR"

    # 2. Verify git repository
    log "🔍 Verifying git repository..."
    if [[ ! -d ".git" ]]; then
        log_error "Not a git repository: $PROJECT_DIR"
        exit 1
    fi

    # 3. Stash local changes and clean untracked files
    log "🧹 Stashing local changes and cleaning untracked files..."
    git stash push -m "Auto-stash before deploy $(date)" || true
    git clean -fd || true

    # 4. Reset and pull latest changes
    log "🔄 Resetting to HEAD and pulling latest changes..."
    git reset --hard HEAD
    git fetch origin
    git reset --hard origin/"$BRANCH"
    git pull origin "$BRANCH" --ff-only

    local COMMIT_HASH=$(git rev-parse --short HEAD)
    local COMMIT_MSG=$(git log -1 --pretty=format:"%s")
    log "📝 Deployed commit: $COMMIT_HASH - $COMMIT_MSG"

    # 5. Install/update dependencies if package.json exists
    if [[ -f "package.json" ]]; then
        log "📦 Installing production dependencies..."
        if command -v npm >/dev/null 2>&1; then
            npm ci --omit=dev --silent
            log_success "Dependencies installed successfully"
        else
            log_error "npm not found, skipping dependency installation"
        fi
    fi

    # 6. Docker Compose deployment
    if [[ -f "docker-compose.yml" || -f "docker-compose.letsencrypt.yml" ]]; then
        log "🐳 Deploying with Docker Compose..."

        # Determine which compose file to use
        local COMPOSE_FILE="docker-compose.yml"
        [[ -f "docker-compose.letsencrypt.yml" ]] && COMPOSE_FILE="docker-compose.letsencrypt.yml"

        # Stop containers gracefully
        docker compose -f "$COMPOSE_FILE" down --timeout 30 || true

        # Pull latest images
        docker compose -f "$COMPOSE_FILE" pull --quiet || true

        # Build and start containers
        docker compose -f "$COMPOSE_FILE" up --build -d --wait

        # Clean up unused images and containers
        docker system prune -f --volumes || true

        log_success "Docker services deployed successfully"
    fi

    # 7. PM2 restart if ecosystem.config.js exists
    if [[ -f "ecosystem.config.js" ]] && command -v pm2 >/dev/null 2>&1; then
        log "🔄 Restarting PM2 processes..."
        pm2 restart ecosystem.config.js --update-env
        pm2 save
        log_success "PM2 processes restarted successfully"
    fi

    # 8. Health check (optional)
    log "🏥 Performing health check..."
    sleep 5  # Give services time to start

    # Check if main service is responding
    if command -v curl >/dev/null 2>&1; then
        if curl -f -s -o /dev/null --max-time 10 "http://localhost" || \
           curl -f -s -o /dev/null --max-time 10 "https://localhost" || \
           curl -f -s -o /dev/null --max-time 10 "http://localhost:3000"; then
            log_success "Health check passed"
        else
            log "⚠️  Health check failed, but continuing deployment"
        fi
    fi

    # 9. Final success notification
    local DEPLOY_TIME=$((SECONDS))
    log_success "Deployment completed successfully in ${DEPLOY_TIME}s"
    log_success "Commit: $COMMIT_HASH - $COMMIT_MSG"

    send_telegram_notification "Deploy completed successfully in ${DEPLOY_TIME}s\nCommit: $COMMIT_HASH" "success"
}

# ============================================================================
# SCRIPT EXECUTION
# ============================================================================
log "🎯 Deploy script started by user: $(whoami)"
log "🖥️  Server: $(hostname)"
log "📅 Date: $TIMESTAMP"

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Run main deployment
main "$@"

log "🏁 Deploy script finished successfully"
exit 0
