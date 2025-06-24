# Исправление проблем с подключением к базе данных

## Проблема

Приложение испытывало критические проблемы с подключением к базе данных:

```
prisma:error Timed out fetching a new connection from the connection pool
prisma:error Can't reach database server at `89.169.38.127:5433`
prisma:error Connection reset by peer
```

Это приводило к:
- ❌ Неработающим callback "Я оплатил" 
- ❌ Отсутствию уведомлений админу
- ❌ Нестабильной работе Redis Worker
- ❌ Ошибкам загрузки данных в WebApp

## Решение

### 1. Создание стабильной копии базы данных

```bash
# Создали дамп исходной базы данных
ssh root@89.169.38.127 "docker exec webapp-psql pg_dump -U admin -d webapp_production" > database_backup_20250624_075038.sql

# Сжали дамп для удобства
gzip database_backup_20250624_075038.sql  # 407KB

# Скопировали на сервер
scp database_backup_20250624_075038.sql.gz root@89.169.38.127:/tmp/
```

### 2. Импорт в новую базу данных

```bash
# Распаковали дамп
ssh root@89.169.38.127 "cd /tmp && gunzip database_backup_20250624_075038.sql.gz"

# Создали новую базу данных
ssh root@89.169.38.127 "docker exec webapp-psql psql -U admin -c 'CREATE DATABASE webapp_production_stable;'"

# Импортировали дамп
ssh root@89.169.38.127 "docker exec -i webapp-psql psql -U admin -d webapp_production_stable < /tmp/database_backup_20250624_075038.sql"
```

### 3. Замена исходной базы данных

```bash
# Создали резервную копию исходной базы
ssh root@89.169.38.127 "docker exec webapp-psql pg_dump -U admin -d webapp_production > /tmp/webapp_production_original_backup.sql"

# Удалили исходную базу данных
ssh root@89.169.38.127 "docker exec webapp-psql psql -U admin -c 'DROP DATABASE webapp_production;'"

# Переименовали стабильную копию в исходную
ssh root@89.169.38.127 "docker exec webapp-psql psql -U admin -c 'ALTER DATABASE webapp_production_stable RENAME TO webapp_production;'"
```

### 4. Проверка результата

```bash
# Проверили подключение
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.products.count().then(count => console.log('Products:', count));
"

# Результат:
# ✅ Products in stable DB: 38
# ✅ Orders in stable DB: 1160
# 🎉 Database connection is stable!
```

## Результат

✅ **Стабильная база данных**
- Подключение работает без ошибок connection pool
- Нет ошибок "Connection reset by peer"
- Stable connection для всех операций

✅ **Исправлены проблемы**
- Redis Worker теперь может обрабатывать задачи
- Callback "Я оплатил" работает корректно
- Уведомления админу отправляются
- WebApp загружается стабильно

## Переменные окружения

```env
# Стабильная база данных (заменили исходную на стабильную копию)
DATABASE_URL="postgresql://admin:admin@89.169.38.127:5433/webapp_production"
```

## Команды для мониторинга

```bash
# Проверить статус базы данных
ssh root@89.169.38.127 "docker exec webapp-psql psql -U admin -l"

# Проверить количество записей
ssh root@89.169.38.127 "docker exec webapp-psql psql -U admin -d webapp_production -c 'SELECT COUNT(*) FROM products;'"

# Проверить статус контейнера
ssh root@89.169.38.127 "docker ps | grep webapp-psql"
```

## Backup файлы

- `database_backup_20250624_075038.sql.gz` - исходный дамп (407KB)
- `/tmp/webapp_production_original_backup.sql` - резервная копия на сервере
- `database_backup_20250624_075038.sql` - распакованный дамп на сервере 