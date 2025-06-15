#!/bin/bash

# Скрипт резервного копирования базы данных nextadmin
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"

# Создаем папку для бэкапов если её нет
mkdir -p $BACKUP_DIR

# Создаем бэкап
echo "🔄 Создание резервной копии базы данных..."
pg_dump nextadmin > $BACKUP_DIR/nextadmin_$DATE.sql

echo "✅ Резервная копия создана: $BACKUP_DIR/nextadmin_$DATE.sql"
echo "📁 Размер файла: $(du -h $BACKUP_DIR/nextadmin_$DATE.sql | cut -f1)"

# Удаляем старые бэкапы (оставляем только последние 10)
echo "🧹 Очистка старых бэкапов..."
ls -t $BACKUP_DIR/nextadmin_*.sql | tail -n +11 | xargs rm -f

echo "✅ Резервное копирование завершено!" 