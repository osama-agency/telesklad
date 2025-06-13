#!/bin/bash

# GitHub Actions Setup Script
# Helps configure all necessary secrets and settings

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="82.202.131.251"
VPS_USER="deploy"
PROJECT_DIR="/opt/telesite"
SSH_KEY_PATH="$HOME/.ssh/telesite_deploy"

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

header() {
    echo -e "\n${PURPLE}================================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================================${NC}\n"
}

# Check if GitHub CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        warning "GitHub CLI не установлен. Установите его для автоматической настройки секретов:"
        echo "  macOS: brew install gh"
        echo "  Linux: apt install gh"
        echo "  Windows: choco install gh"
        echo ""
        echo "Или настройте секреты вручную в GitHub Settings"
        return 1
    fi
    return 0
}

# Check if user is logged in to GitHub CLI
check_gh_auth() {
    if ! gh auth status &> /dev/null; then
        warning "Вы не авторизованы в GitHub CLI. Выполните:"
        echo "  gh auth login"
        return 1
    fi
    return 0
}

# Validate SSH key
check_ssh_key() {
    log "🔍 Проверка SSH ключа..."

    if [ ! -f "$SSH_KEY_PATH" ]; then
        error "SSH ключ не найден: $SSH_KEY_PATH"
    fi

    # Test SSH connection
    if ssh -i "$SSH_KEY_PATH" -o ConnectTimeout=10 -o BatchMode=yes "$VPS_USER@$VPS_HOST" "echo 'SSH connection test'" 2>/dev/null; then
        success "SSH подключение работает"
    else
        error "SSH подключение не работает. Проверьте ключ и доступ к VPS"
    fi
}

# Display secrets that need to be set
show_secrets() {
    header "🔐 GITHUB SECRETS"

    echo "Следующие секреты должны быть настроены в GitHub:"
    echo ""
    echo "1. VPS_SSH_PRIVATE_KEY"
    echo "   Значение: содержимое файла $SSH_KEY_PATH"
    echo ""
    echo "2. VPS_HOST"
    echo "   Значение: $VPS_HOST"
    echo ""
    echo "3. VPS_USER"
    echo "   Значение: $VPS_USER"
    echo ""
    echo "4. PROJECT_DIR"
    echo "   Значение: $PROJECT_DIR"
    echo ""
}

# Set GitHub secrets automatically
set_secrets_auto() {
    log "🔐 Настройка GitHub секретов автоматически..."

    # Get repository info
    REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)

    if [ -z "$REPO" ]; then
        error "Не удалось определить GitHub репозиторий"
    fi

    log "📦 Настройка секретов для репозитория: $REPO"

    # Set VPS_SSH_PRIVATE_KEY
    if [ -f "$SSH_KEY_PATH" ]; then
        log "🔑 Устанавливаем VPS_SSH_PRIVATE_KEY..."
        gh secret set VPS_SSH_PRIVATE_KEY < "$SSH_KEY_PATH"
        success "VPS_SSH_PRIVATE_KEY установлен"
    else
        error "SSH ключ не найден: $SSH_KEY_PATH"
    fi

    # Set other secrets
    log "🌐 Устанавливаем VPS_HOST..."
    echo "$VPS_HOST" | gh secret set VPS_HOST
    success "VPS_HOST установлен"

    log "👤 Устанавливаем VPS_USER..."
    echo "$VPS_USER" | gh secret set VPS_USER
    success "VPS_USER установлен"

    log "📁 Устанавливаем PROJECT_DIR..."
    echo "$PROJECT_DIR" | gh secret set PROJECT_DIR
    success "PROJECT_DIR установлен"

    success "Все секреты установлены!"
}

# Set secrets manually
set_secrets_manual() {
    header "📝 РУЧНАЯ НАСТРОЙКА СЕКРЕТОВ"

    echo "Скопируйте следующие значения и добавьте их как секреты в GitHub:"
    echo "GitHub → Settings → Secrets and variables → Actions → New repository secret"
    echo ""

    echo "1. VPS_SSH_PRIVATE_KEY:"
    echo "---START---"
    cat "$SSH_KEY_PATH" 2>/dev/null || echo "Ошибка: не удалось прочитать SSH ключ"
    echo "---END---"
    echo ""

    echo "2. VPS_HOST: $VPS_HOST"
    echo "3. VPS_USER: $VPS_USER"
    echo "4. PROJECT_DIR: $PROJECT_DIR"
    echo ""

    warning "После добавления всех секретов нажмите Enter для продолжения..."
    read -r
}

# Validate GitHub Actions workflows
validate_workflows() {
    log "🔍 Проверка GitHub Actions workflows..."

    if [ ! -f ".github/workflows/deploy.yml" ]; then
        error "Workflow deploy.yml не найден"
    fi

    if [ ! -f ".github/workflows/pr-check.yml" ]; then
        error "Workflow pr-check.yml не найден"
    fi

    success "Все workflows найдены"
}

# Test GitHub Actions
test_actions() {
    header "🧪 ТЕСТИРОВАНИЕ GITHUB ACTIONS"

    if check_gh_cli && check_gh_auth; then
        log "🚀 Запуск тестового workflow..."

        # Get current branch
        BRANCH=$(git rev-parse --abbrev-ref HEAD)

        if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
            warning "Вы на main/master ветке. Создадим тестовую ветку..."
            git checkout -b "test-github-actions-$(date +%s)"
        fi

        # Make a small change to trigger workflow
        echo "# GitHub Actions Test - $(date)" >> .github/test-trigger.md
        git add .github/test-trigger.md
        git commit -m "test: trigger GitHub Actions workflow"
        git push origin HEAD

        success "Тестовый коммит создан. Проверьте GitHub Actions в веб-интерфейсе"

        # Open GitHub Actions page
        if command -v open &> /dev/null; then
            gh repo view --web --branch HEAD
        fi
    else
        warning "GitHub CLI недоступен. Протестируйте вручную, создав коммит в main ветку"
    fi
}

# Create environment protection rules
setup_environment() {
    header "🛡️ НАСТРОЙКА ENVIRONMENT"

    if check_gh_cli && check_gh_auth; then
        log "🌍 Настройка production environment..."

        # This requires GitHub CLI extension or manual setup
        warning "Environment настройку нужно выполнить вручную:"
        echo "1. Перейдите в GitHub → Settings → Environments"
        echo "2. Создайте environment 'production'"
        echo "3. Укажите URL: https://dsgrating.ru"
        echo "4. Добавьте protection rules (опционально)"
    else
        warning "Настройте environment вручную в GitHub Settings"
    fi
}

# Display final instructions
show_final_instructions() {
    header "🎉 НАСТРОЙКА ЗАВЕРШЕНА"

    echo "GitHub Actions успешно настроен!"
    echo ""
    echo "🚀 Что дальше:"
    echo "1. Создайте Pull Request для тестирования PR checks"
    echo "2. Merge в main ветку для тестирования деплоя"
    echo "3. Мониторьте логи в GitHub Actions"
    echo ""
    echo "📚 Полезные команды:"
    echo "  gh run list                    # Список запусков"
    echo "  gh run view <run-id>           # Просмотр конкретного запуска"
    echo "  gh workflow list               # Список workflows"
    echo ""
    echo "🔗 Ссылки:"
    echo "  Actions: $(gh repo view --json url -q .url)/actions"
    echo "  Settings: $(gh repo view --json url -q .url)/settings/secrets/actions"
    echo ""
    success "GitHub Actions готов к работе! 🎉"
}

# Main function
main() {
    header "🚀 GITHUB ACTIONS SETUP"

    echo "Этот скрипт поможет настроить GitHub Actions для автоматического деплоя"
    echo ""

    # Validate prerequisites
    validate_workflows
    check_ssh_key

    # Show secrets information
    show_secrets

    # Choose setup method
    if check_gh_cli && check_gh_auth; then
        echo "GitHub CLI обнаружен и настроен."
        echo ""
        echo "Выберите способ настройки:"
        echo "1) Автоматическая настройка через GitHub CLI (рекомендуется)"
        echo "2) Ручная настройка"
        echo ""
        read -p "Ваш выбор (1/2): " choice

        case $choice in
            1)
                set_secrets_auto
                ;;
            2)
                set_secrets_manual
                ;;
            *)
                warning "Неверный выбор. Используется ручная настройка."
                set_secrets_manual
                ;;
        esac
    else
        set_secrets_manual
    fi

    # Setup environment
    setup_environment

    # Test setup
    echo ""
    read -p "Хотите протестировать GitHub Actions? (y/n): " test_choice
    if [[ $test_choice =~ ^[Yy]$ ]]; then
        test_actions
    fi

    # Final instructions
    show_final_instructions
}

# Run main function
main "$@"
