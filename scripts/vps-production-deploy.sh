#!/bin/bash

# VPS Production Deploy Script with Telegram Notifications
# Runs on VPS to deploy the application with host nginx + Docker app

set -e

# Load notification functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/deploy-notifications.sh" 2>/dev/null || echo "Warning: Notification system not available"

# Track deployment start time
DEPLOY_START_TIME=$(date +%s)

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
    log "📦 Создание резервной копии текущего деплоя..."
    notify_deployment_progress "Резервное копирование" "progress" "Создание резервной копии текущего деплоя" 2>/dev/null || true

    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"

    if [ -d ".next" ]; then
        tar -czf "$BACKUP_FILE" .next/ docker-compose.production.yml || true
        success "Резервная копия создана: $BACKUP_FILE"
        notify_deployment_progress "Резервное копирование" "success" "Резервная копия создана: $(basename $BACKUP_FILE)" 2>/dev/null || true
    else
        warning "Нет существующей папки .next для резервного копирования"
        notify_deployment_progress "Резервное копирование" "warning" "Нет существующей папки .next для резервного копирования" 2>/dev/null || true
    fi
}

# Extract build archive
extract_build() {
    log "📦 Извлечение архива сборки..."

    if [ -f "next-build.tar.gz" ]; then
        tar -xzf next-build.tar.gz
        rm next-build.tar.gz
        success "Архив сборки успешно извлечен"
    else
        error "Архив сборки не найден!"
    fi
}

# Install/update dependencies
install_dependencies() {
    log "📚 Установка зависимостей..."

    # Update npm if needed
    if ! npm --version >/dev/null 2>&1; then
        error "npm не найден. Установите Node.js"
    fi

    # Install production dependencies
    NODE_ENV=production npm ci --only=production
    success "Зависимости установлены"
}

# Stop current services
stop_services() {
    log "🛑 Остановка текущих сервисов..."

    if [ -f "$COMPOSE_FILE" ]; then
        docker-compose -f "$COMPOSE_FILE" down || warning "Не удалось остановить некоторые контейнеры"
    fi

    # Clean up orphaned containers
    docker container prune -f || true

    success "Сервисы остановлены"
}

# Start services
start_services() {
    log "🚀 Запуск сервисов..."

    # Build and start containers
    docker-compose -f "$COMPOSE_FILE" up --build -d

    # Wait for services to be healthy
    log "⏳ Ожидание готовности сервисов..."
    sleep 5

    # Check if services are running
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        success "Сервисы запущены успешно"
    else
        error "Сервисы не смогли запуститься корректно"
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
    log "🚀 Запуск production деплоя на VPS..."

    # Send start notification
    notify_deployment_start "VPS_Manual" 2>/dev/null || true

    # Change to project directory
    cd "$PROJECT_DIR"

    # Run deployment steps with error handling
    if ! {
        create_backup
        extract_build
        install_dependencies
        stop_services
        start_services
        verify_nginx
        health_check
        cleanup_backups
    }; then
        # Calculate duration and send failure notification
        local duration=$(get_duration $DEPLOY_START_TIME 2>/dev/null || echo "неизвестно")
        notify_deployment_complete "error" "$duration" "Деплой завершился с ошибкой во время выполнения" 2>/dev/null || true
        error "Деплой завершился с ошибкой!"
    fi

    success "🎉 Production деплой завершен успешно!"

    # Calculate duration and send success notification
    local duration=$(get_duration $DEPLOY_START_TIME 2>/dev/null || echo "неизвестно")
    notify_deployment_complete "success" "$duration" "Все сервисы работают нормально" 2>/dev/null || true

    # Show final status
    log "📊 Final status:"
    docker-compose -f "$COMPOSE_FILE" ps
    systemctl status nginx --no-pager -l
}

# Run main function
main "$@"
