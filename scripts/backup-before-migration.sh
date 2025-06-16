#!/bin/bash

# Скрипт для создания резервной копии удаленной базы данных перед миграцией

echo "🔒 Создание резервной копии базы данных перед миграцией..."

# Параметры подключения
REMOTE_HOST="89.169.38.127"
REMOTE_PORT="5433"
REMOTE_DB="webapp_production"
REMOTE_USER="admin"
REMOTE_PASSWORD="admin"

# Создаем папку для бэкапов
BACKUP_DIR="./backups/remote-db"
mkdir -p "$BACKUP_DIR"

# Имя файла бэкапа с датой и временем
BACKUP_FILE="$BACKUP_DIR/webapp_production_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "📦 Создание дампа базы данных..."
echo "   Хост: $REMOTE_HOST:$REMOTE_PORT"
echo "   База: $REMOTE_DB"
echo "   Файл: $BACKUP_FILE"

# Создаем дамп базы данных
PGPASSWORD="$REMOTE_PASSWORD" pg_dump \
  -h "$REMOTE_HOST" \
  -p "$REMOTE_PORT" \
  -U "$REMOTE_USER" \
  -d "$REMOTE_DB" \
  --no-owner \
  --no-privileges \
  --verbose \
  > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Резервная копия успешно создана!"
  echo "   Размер: $(du -h "$BACKUP_FILE" | cut -f1)"
  echo ""
  echo "📌 Для восстановления используйте:"
  echo "   PGPASSWORD='$REMOTE_PASSWORD' psql -h $REMOTE_HOST -p $REMOTE_PORT -U $REMOTE_USER -d $REMOTE_DB < $BACKUP_FILE"
else
  echo "❌ Ошибка при создании резервной копии!"
  exit 1
fi 