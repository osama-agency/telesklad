#!/bin/bash

echo "📦 Перенос данных из локальной базы в удаленную..."

# Параметры подключения
LOCAL_DB="nextadmin"
LOCAL_USER="eldar"
LOCAL_HOST="localhost"

REMOTE_HOST="89.169.38.127"
REMOTE_PORT="5433"
REMOTE_DB="webapp_production"
REMOTE_USER="admin"
REMOTE_PASSWORD="admin"

# Таблицы для переноса данных
TABLES_TO_MIGRATE=(
    "purchases"
    "purchase_items"
    "expenses"
    "exchange_rates"
    "supplier_stats"
)

echo "🔍 Проверяем наличие данных в локальной базе..."

for table in "${TABLES_TO_MIGRATE[@]}"; do
    echo ""
    echo "📋 Таблица: $table"
    
    # Подсчитываем количество записей в локальной базе
    LOCAL_COUNT=$(psql -h $LOCAL_HOST -U $LOCAL_USER -d $LOCAL_DB -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ')
    
    if [ -z "$LOCAL_COUNT" ] || [ "$LOCAL_COUNT" = "0" ]; then
        echo "   ⚠️  Нет данных для переноса"
        continue
    fi
    
    echo "   📊 Найдено записей: $LOCAL_COUNT"
    
    # Проверяем количество записей в удаленной базе
    REMOTE_COUNT=$(PGPASSWORD="$REMOTE_PASSWORD" psql -h $REMOTE_HOST -p $REMOTE_PORT -U $REMOTE_USER -d $REMOTE_DB -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ')
    
    if [ ! -z "$REMOTE_COUNT" ] && [ "$REMOTE_COUNT" != "0" ]; then
        echo "   ⚠️  В удаленной базе уже есть $REMOTE_COUNT записей"
        echo "   🔄 Пропускаем, чтобы избежать дублирования"
        continue
    fi
    
    # Создаем временный файл для данных
    TEMP_FILE="/tmp/${table}_data.sql"
    
    echo "   💾 Экспортируем данные..."
    pg_dump -h $LOCAL_HOST -U $LOCAL_USER -d $LOCAL_DB \
        --data-only \
        --no-owner \
        --no-privileges \
        --table=$table \
        --column-inserts \
        > "$TEMP_FILE"
    
    if [ $? -eq 0 ]; then
        echo "   📤 Импортируем в удаленную базу..."
        PGPASSWORD="$REMOTE_PASSWORD" psql -h $REMOTE_HOST -p $REMOTE_PORT -U $REMOTE_USER -d $REMOTE_DB < "$TEMP_FILE"
        
        if [ $? -eq 0 ]; then
            # Проверяем количество после импорта
            NEW_REMOTE_COUNT=$(PGPASSWORD="$REMOTE_PASSWORD" psql -h $REMOTE_HOST -p $REMOTE_PORT -U $REMOTE_USER -d $REMOTE_DB -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ')
            echo "   ✅ Успешно перенесено $NEW_REMOTE_COUNT записей"
        else
            echo "   ❌ Ошибка при импорте данных"
        fi
        
        # Удаляем временный файл
        rm -f "$TEMP_FILE"
    else
        echo "   ❌ Ошибка при экспорте данных"
    fi
done

echo ""
echo "🔧 Обновляем последовательности (sequences)..."

# Обновляем sequences для правильной работы автоинкремента
for table in "${TABLES_TO_MIGRATE[@]}"; do
    PGPASSWORD="$REMOTE_PASSWORD" psql -h $REMOTE_HOST -p $REMOTE_PORT -U $REMOTE_USER -d $REMOTE_DB -c "
        SELECT setval(pg_get_serial_sequence('$table', 'id'), COALESCE(MAX(id), 1)) FROM $table;
    " 2>/dev/null
done

echo ""
echo "✅ Перенос данных завершен!"
echo ""
echo "📊 Итоговая статистика:"
for table in "${TABLES_TO_MIGRATE[@]}"; do
    COUNT=$(PGPASSWORD="$REMOTE_PASSWORD" psql -h $REMOTE_HOST -p $REMOTE_PORT -U $REMOTE_USER -d $REMOTE_DB -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ')
    echo "   $table: $COUNT записей"
done 