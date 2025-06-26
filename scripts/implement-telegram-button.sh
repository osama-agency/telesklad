#!/bin/bash

# 🚀 Скрипт автоматизации внедрения Telegram MainButton
# Автор: NEXTADMIN Team
# Дата: $(date)

set -e  # Остановка при ошибке

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 ВНЕДРЕНИЕ TELEGRAM MAINBUTTON"
echo "================================"

# Функция для вывода статуса
status() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. ПРОВЕРКА ГОТОВНОСТИ
echo -e "\n📋 ЭТАП 1: Проверка готовности"
echo "------------------------------"

# Проверяем наличие компонента
if [ -f "src/app/webapp/_components/TelegramCheckoutButton.tsx" ]; then
    status "Компонент TelegramCheckoutButton найден"
else
    error "Компонент TelegramCheckoutButton не найден!"
fi

# Проверяем резервную копию
if [ -f "src/app/webapp/cart/page.backup.tsx" ]; then
    status "Резервная копия найдена"
else
    warning "Создаем резервную копию..."
    cp src/app/webapp/cart/page.tsx src/app/webapp/cart/page.backup.tsx
    status "Резервная копия создана"
fi

# 2. СОЗДАНИЕ ДОПОЛНИТЕЛЬНОЙ РЕЗЕРВНОЙ КОПИИ
echo -e "\n📋 ЭТАП 2: Создание timestamped backup"
echo "-------------------------------------"

BACKUP_FILE="src/app/webapp/cart/page.$(date +%Y%m%d_%H%M%S).backup.tsx"
cp src/app/webapp/cart/page.tsx "$BACKUP_FILE"
status "Создан backup: $BACKUP_FILE"

# 3. ПРОВЕРКА ТЕКУЩЕГО СОСТОЯНИЯ
echo -e "\n📋 ЭТАП 3: Анализ текущего состояния"
echo "-----------------------------------"

# Проверяем импорт
if grep -q "import TelegramCheckoutButton" src/app/webapp/cart/page.tsx; then
    status "Импорт TelegramCheckoutButton уже добавлен"
else
    warning "Импорт TelegramCheckoutButton отсутствует"
    echo "Добавляем импорт..."
    # Здесь можно добавить автоматическое добавление импорта
fi

# Проверяем старую кнопку
if grep -q "checkout-button-custom" src/app/webapp/cart/page.tsx; then
    warning "Старая кнопка все еще используется"
    NEEDS_REPLACEMENT=true
else
    status "Старая кнопка уже заменена"
    NEEDS_REPLACEMENT=false
fi

# 4. ЗАМЕНА КНОПКИ (если нужно)
if [ "$NEEDS_REPLACEMENT" = true ]; then
    echo -e "\n📋 ЭТАП 4: Замена кнопки"
    echo "----------------------"
    
    echo "⚠️  ВНИМАНИЕ: Необходимо вручную заменить блок кода!"
    echo ""
    echo "1. Откройте файл: src/app/webapp/cart/page.tsx"
    echo "2. Найдите блок со старой кнопкой (строки ~469-485)"
    echo "3. Замените его на:"
    echo ""
    echo "----------------------------------------"
    cat << 'REPLACEMENT'
      {/* 🚀 Telegram MainButton для оформления заказа */}
      {cartItems.length > 0 && isDeliveryFormValid && (
        <TelegramCheckoutButton
          total={finalTotal}
          isLoading={isOrderLoading}
          isDisabled={!isDeliveryFormValid}
          onCheckout={handleTelegramCheckout}
        />
      )}
REPLACEMENT
    echo "----------------------------------------"
    echo ""
    read -p "Нажмите Enter после замены кода..."
fi

# 5. ПРОВЕРКА ИЗМЕНЕНИЙ
echo -e "\n📋 ЭТАП 5: Проверка изменений"
echo "----------------------------"

# Проверяем что компонент используется
COMPONENT_COUNT=$(grep -c "TelegramCheckoutButton" src/app/webapp/cart/page.tsx || true)
if [ "$COMPONENT_COUNT" -ge 2 ]; then
    status "TelegramCheckoutButton используется ($COMPONENT_COUNT раз)"
else
    error "TelegramCheckoutButton не найден в коде!"
fi

# Проверяем что старая кнопка удалена
OLD_BUTTON_COUNT=$(grep -c "checkout-button-custom" src/app/webapp/cart/page.tsx || true)
if [ "$OLD_BUTTON_COUNT" -eq 0 ]; then
    status "Старая кнопка успешно удалена"
else
    error "Старая кнопка все еще присутствует!"
fi

# 6. ТЕСТИРОВАНИЕ
echo -e "\n📋 ЭТАП 6: Инструкции по тестированию"
echo "------------------------------------"

echo "🧪 Локальное тестирование:"
echo "1. Перезапустите приложение:"
echo "   pkill -f 'next dev' && PORT=3000 npm run dev"
echo ""
echo "2. Откройте в браузере:"
echo "   http://localhost:3000/webapp/cart"
echo ""
echo "3. Проверьте:"
echo "   - Кнопка зеленая (#48C928)"
echo "   - Фиксирована внизу экрана"
echo "   - Hover эффекты работают"
echo "   - Заказ оформляется"
echo ""
echo "🔷 Telegram тестирование:"
echo "1. Откройте в Telegram:"
echo "   https://strattera.ngrok.app/webapp"
echo ""
echo "2. Проверьте:"
echo "   - MainButton отображается"
echo "   - Цвет зеленый"
echo "   - Есть haptic feedback"
echo "   - WebApp закрывается после заказа"

echo -e "\n✅ ГОТОВО!"
echo "=========="
echo ""
echo "📝 Следующие шаги:"
echo "1. Выполните тестирование согласно инструкциям"
echo "2. При успехе - закоммитьте изменения:"
echo "   git add -A && git commit -m 'feat: Add Telegram MainButton for checkout'"
echo "3. При проблемах - используйте откат:"
echo "   cp $BACKUP_FILE src/app/webapp/cart/page.tsx"
echo ""
echo "📚 Документация: docs/TELEGRAM_BUTTON_IMPLEMENTATION_PLAN.md"
