#!/bin/bash

# 🚀 Modern Deployment Notification System 2025
# Sends rich Telegram notifications for deployment events
# Best practices: structured logging, error handling, retry logic

set -euo pipefail
IFS=$'\n\t'

# ============================================================================
# CONFIGURATION
# ============================================================================

# Telegram Configuration
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-8159006212:AAEjYn-bU-Nh89crlue9GUJKuv6pV4Z986M}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-125861752}"
TELEGRAM_API="https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}"

# Deployment Configuration
PROJECT_NAME="${PROJECT_NAME:-Telesklad}"
ENVIRONMENT="${ENVIRONMENT:-production}"
SERVER_NAME="${SERVER_NAME:-dsgrating.ru}"
DEPLOYMENT_ID="${DEPLOYMENT_ID:-$(date +%Y%m%d_%H%M%S)}"

# Get emoji for status (compatible with bash 3.2+)
get_status_emoji() {
    local status="$1"
    case "$status" in
        "start") echo "🚀" ;;
        "progress") echo "⚡" ;;
        "success") echo "✅" ;;
        "warning") echo "⚠️" ;;
        "error") echo "❌" ;;
        "info") echo "ℹ️" ;;
        "deploy") echo "🔄" ;;
        "build") echo "🏗️" ;;
        "test") echo "🧪" ;;
        "backup") echo "💾" ;;
        "restart") echo "♻️" ;;
        "health") echo "🏥" ;;
        "complete") echo "🎉" ;;
        *) echo "🔄" ;;
    esac
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

# Get current timestamp
get_timestamp() {
    date '+%Y-%m-%d %H:%M:%S UTC'
}

# Get deployment duration
get_duration() {
    local start_time="$1"
    local end_time="$(date +%s)"
    local duration=$((end_time - start_time))

    if [ $duration -lt 60 ]; then
        echo "${duration}s"
    elif [ $duration -lt 3600 ]; then
        echo "$((duration / 60))m $((duration % 60))s"
    else
        echo "$((duration / 3600))h $(((duration % 3600) / 60))m"
    fi
}

# Get Git commit info
get_git_info() {
    local branch="${GITHUB_REF_NAME:-$(git branch --show-current 2>/dev/null || echo 'неизвестно')}"
    local commit="${GITHUB_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo 'неизвестно')}"
    local author="${GITHUB_ACTOR:-$(git log -1 --pretty=format:'%an' 2>/dev/null || echo 'неизвестно')}"

    echo "🌿 **Ветка:** \`${branch}\`
🔗 **Коммит:** \`${commit}\`
👤 **Автор:** ${author}"
}

# Get system info (compatible with macOS and Linux)
get_system_info() {
    local cpu_usage="н/д"
    local memory_usage="н/д"
    local disk_usage="н/д"

    # Try to get CPU usage (different commands for different systems)
    if command -v top >/dev/null 2>&1; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            cpu_usage=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | cut -d'%' -f1 2>/dev/null || echo "н/д")
        else
            # Linux
            cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 2>/dev/null || echo "н/д")
        fi
    fi

    # Try to get memory usage
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v vm_stat >/dev/null 2>&1; then
            memory_usage=$(vm_stat | awk '/Pages free:/{free=$3} /Pages active:/{active=$3} /Pages inactive:/{inactive=$3} /Pages speculative:/{spec=$3} /Pages wired down:/{wired=$4} END{total=(free+active+inactive+spec+wired)*4096/1024/1024/1024; used=(active+inactive+wired)*4096/1024/1024/1024; printf "%.1f", used/total*100}' 2>/dev/null || echo "н/д")
        fi
    else
        # Linux
        if command -v free >/dev/null 2>&1; then
            memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}' 2>/dev/null || echo "н/д")
        fi
    fi

    # Get disk usage (should work on both systems)
    if command -v df >/dev/null 2>&1; then
        disk_usage=$(df -h / | awk 'NR==2{printf "%s", $5}' 2>/dev/null || echo "н/д")
    fi

    echo "💻 **ЦП:** ${cpu_usage}%
🧠 **Память:** ${memory_usage}%
💽 **Диск:** ${disk_usage}"
}

# ============================================================================
# TELEGRAM API FUNCTIONS
# ============================================================================

# Send message with retry logic
send_telegram_message() {
    local message="$1"
    local parse_mode="${2:-Markdown}"
    local disable_preview="${3:-true}"
    local max_retries=3
    local retry_count=0

    while [ $retry_count -lt $max_retries ]; do
        local response
        response=$(curl -s -X POST "${TELEGRAM_API}/sendMessage" \
            -H "Content-Type: application/json" \
            -d "{
                \"chat_id\": \"${TELEGRAM_CHAT_ID}\",
                \"text\": \"${message}\",
                \"parse_mode\": \"${parse_mode}\",
                \"disable_web_page_preview\": ${disable_preview}
            }" \
            --connect-timeout 10 \
            --max-time 30) || true

        if echo "$response" | jq -e '.ok' >/dev/null 2>&1; then
            echo "Message sent successfully"
            return 0
        fi

        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $max_retries ]; then
            echo "Retry $retry_count/$max_retries in 2 seconds..."
            sleep 2
        fi
    done

    echo "Failed to send message after $max_retries attempts"
    return 1
}

# ============================================================================
# NOTIFICATION FUNCTIONS
# ============================================================================

# Send deployment start notification
notify_deployment_start() {
    local trigger="${1:-ручной}"
    local trigger_text
    case "$trigger" in
        "github_actions") trigger_text="GitHub Actions" ;;
        "VPS_Manual") trigger_text="Ручной деплой VPS" ;;
        "manual") trigger_text="Ручной запуск" ;;
        "scheduled") trigger_text="По расписанию" ;;
        *) trigger_text="$trigger" ;;
    esac

    local message="
🚀 **НАЧАЛО ДЕПЛОЯ**

🏷️ **Проект:** ${PROJECT_NAME}
🌍 **Среда:** \`${ENVIRONMENT}\`
🖥️ **Сервер:** \`${SERVER_NAME}\`
🆔 **ID:** \`${DEPLOYMENT_ID}\`
🔄 **Способ:** ${trigger_text}

$(get_git_info)

⏰ **Начато:** $(get_timestamp)

🔗 **Сайт:** https://${SERVER_NAME}
📊 **Статус:** https://${SERVER_NAME}/api/health"

    send_telegram_message "$message"
}

# Send deployment progress notification
notify_deployment_progress() {
    local stage="$1"
    local status="${2:-progress}"
    local details="${3:-}"
    local emoji="$(get_status_emoji "$status")"

    # Переводим статусы на русский
    local status_text
    case "$status" in
        "progress") status_text="В процессе" ;;
        "success") status_text="Успешно" ;;
        "warning") status_text="С предупреждениями" ;;
        "error") status_text="Ошибка" ;;
        "info") status_text="Информация" ;;
        *) status_text="$status" ;;
    esac

    local message="
${emoji} **ПРОГРЕСС ДЕПЛОЯ**

🏷️ **Проект:** ${PROJECT_NAME}
🆔 **ID:** \`${DEPLOYMENT_ID}\`
📋 **Этап:** ${stage}
📊 **Статус:** ${status_text}

⏰ **Время:** $(get_timestamp)"

    if [ -n "$details" ]; then
        message="$message

📝 **Детали:**
\`\`\`
$details
\`\`\`"
    fi

    send_telegram_message "$message"
}

# Send deployment completion notification
notify_deployment_complete() {
    local status="$1"  # success, warning, error
    local duration="$2"
    local details="${3:-}"
    local emoji="$(get_status_emoji "$status")"

    local status_text
    case "$status" in
        "success") status_text="✅ **ЗАВЕРШЕН УСПЕШНО**" ;;
        "warning") status_text="⚠️ **ЗАВЕРШЕН С ПРЕДУПРЕЖДЕНИЯМИ**" ;;
        "error") status_text="❌ **ЗАВЕРШЕН С ОШИБКОЙ**" ;;
        *) status_text="**ЗАВЕРШЕН**" ;;
    esac

    local message="
🎉 **ДЕПЛОЙ ${status_text}**

🏷️ **Проект:** ${PROJECT_NAME}
🌍 **Среда:** \`${ENVIRONMENT}\`
🖥️ **Сервер:** \`${SERVER_NAME}\`
🆔 **ID:** \`${DEPLOYMENT_ID}\`

$(get_git_info)

⏱️ **Длительность:** ${duration}
⏰ **Завершен:** $(get_timestamp)

$(get_system_info)

🔗 **Сайт:** https://${SERVER_NAME}
📊 **Здоровье:** https://${SERVER_NAME}/api/health"

    if [ -n "$details" ]; then
        message="$message

📝 **Детали:**
\`\`\`
$details
\`\`\`"
    fi

    send_telegram_message "$message"
}

# Send health check notification
notify_health_check() {
    local status="$1"  # healthy, degraded, unhealthy
    local checks="$2"
    local emoji
    local status_text

    case "$status" in
        "healthy")
            emoji="🟢"
            status_text="ЗДОРОВ"
            ;;
        "degraded")
            emoji="🟡"
            status_text="ДЕГРАДИРОВАН"
            ;;
        "unhealthy")
            emoji="🔴"
            status_text="НЕЗДОРОВ"
            ;;
        *)
            emoji="⚪"
            status_text="${status^^}"
            ;;
    esac

    local message="
${emoji} **ПРОВЕРКА ЗДОРОВЬЯ: ${status_text}**

🏷️ **Проект:** ${PROJECT_NAME}
🖥️ **Сервер:** \`${SERVER_NAME}\`
⏰ **Время:** $(get_timestamp)

📊 **Проверки:**
\`\`\`
$checks
\`\`\`

🔗 **Сайт:** https://${SERVER_NAME}"

    send_telegram_message "$message"
}

# ============================================================================
# MAIN FUNCTIONS
# ============================================================================

# Main notification handler
main() {
    local action="${1:-help}"

    case "$action" in
        "start")
            local trigger="${2:-manual}"
            notify_deployment_start "$trigger"
            ;;
        "progress")
            local stage="${2:-unknown}"
            local status="${3:-progress}"
            local details="${4:-}"
            notify_deployment_progress "$stage" "$status" "$details"
            ;;
        "complete")
            local status="${2:-success}"
            local duration="${3:-unknown}"
            local details="${4:-}"
            notify_deployment_complete "$status" "$duration" "$details"
            ;;
        "health")
            local status="${2:-unknown}"
            local checks="${3:-No checks provided}"
            notify_health_check "$status" "$checks"
            ;;
        "test")
            echo "Отправка тестового уведомления..."
            send_telegram_message "🧪 **ТЕСТОВОЕ УВЕДОМЛЕНИЕ**

Это тестовое сообщение от системы уведомлений деплоя.

⏰ **Время:** $(get_timestamp)
🖥️ **Сервер:** \`$(hostname)\`"
            ;;
        "help"|*)
            echo "Использование: $0 <действие> [параметры]"
            echo ""
            echo "Действия:"
            echo "  start [способ]               - Отправить уведомление о начале деплоя"
            echo "  progress <этап> [статус]     - Отправить уведомление о прогрессе"
            echo "  complete <статус> <время>    - Отправить уведомление о завершении"
            echo "  health <статус> <проверки>   - Отправить уведомление о здоровье"
            echo "  test                         - Отправить тестовое уведомление"
            echo ""
            echo "Примеры:"
            echo "  $0 start github_actions"
            echo "  $0 progress 'Сборка' success"
            echo "  $0 progress 'Тестирование' error 'Тесты не прошли'"
            echo "  $0 complete success '2м 30с'"
            echo "  $0 health healthy 'Все сервисы работают'"
            echo "  $0 test"
            ;;
    esac
}

# Export functions for sourcing
export -f notify_deployment_start
export -f notify_deployment_progress
export -f notify_deployment_complete
export -f notify_health_check
export -f send_telegram_message

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
