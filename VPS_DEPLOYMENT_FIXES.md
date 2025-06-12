# VPS Deployment Fixes and Best Practices

## 🔧 Критические исправления

### 1. Проблема с маршрутами Express (Order not found)

**Проблема**: Маршруты с параметрами перехватывали другие маршруты
- `/api/orders/:id` перехватывал `/api/products`
- `/api/:id` из orderRoutes перехватывал все `/api/*`

**Решение**:
```javascript
// backend/src/app.ts - ПРАВИЛЬНЫЙ порядок
app.use('/api/products', productRoutes)    // Специфичные маршруты ПЕРВЫМИ
app.use('/api/expenses', expenseRoutes)
app.use('/api/purchases', purchaseRoutes)
app.use('/api/orders', orderRoutes)        // Общие маршруты ПОСЛЕДНИМИ
app.use('/api', syncRoutes)

// В файлах маршрутов убрать дублирование путей:
// Было: router.get('/products', ...) 
// Стало: router.get('/', ...)
```

### 2. Проблема с Prisma и именами колонок

**Проблема**: Несоответствие имен колонок в БД и Prisma схеме
- В БД: `createdAt` (camelCase)
- Prisma ожидает: `created_at` (snake_case)

**Решение**:
```sql
-- Переименование колонок в таблице purchases
ALTER TABLE purchases RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE purchases RENAME COLUMN "totalCost" TO total_cost;
ALTER TABLE purchases RENAME COLUMN "isUrgent" TO is_urgent;
```

### 3. Проблема с памятью при сборке (SIGILL)

**Проблема**: Next.js build падает с SIGILL на VPS с 2GB RAM

**Решение**:
1. Создан swap файл 2GB
2. Используется Dockerfile.simple с предварительной сборкой
3. Деплой готового архива вместо сборки на VPS

## 📋 Правильный процесс деплоя

### 1. Локальная сборка и деплой
```bash
# Сборка локально
npm run build:next

# Деплой готовой сборки
npm run vps:deploy:build
```

### 2. Структура файлов для деплоя
```
docker-compose.ssl.yml    # Production конфигурация с SSL
Dockerfile.simple         # Оптимизированный Dockerfile
start-simple.js          # Запуск без сборки
nginx-ssl.conf          # Nginx конфигурация с SSL
```

### 3. Переменные окружения
```env
# .env на VPS
DATABASE_URL=postgresql://user:pass@postgres:5432/telesite
NEXT_PUBLIC_API_URL=http://localhost:3011
NODE_ENV=production
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=-xxx
```

## 🚀 Команды управления

```bash
# Статус
npm run vps:status

# Логи
npm run vps:logs

# SSH доступ
npm run vps:shell

# Перезапуск
ssh deploy@82.202.131.251 "cd /opt/telesite && docker-compose -f docker-compose.ssl.yml restart"
```

## ⚠️ Важные моменты

1. **Всегда проверяйте порядок маршрутов** - специфичные первыми
2. **Генерируйте Prisma клиент после изменений схемы**:
   ```bash
   docker-compose exec app sh -c 'cd backend && npx prisma generate'
   ```
3. **Применяйте миграции**:
   ```bash
   docker-compose exec app sh -c 'cd backend && npx prisma migrate deploy'
   ```
4. **Используйте локальную сборку** для VPS с ограниченной памятью

## 🔍 Диагностика

### Проверка API endpoints
```bash
curl https://dsgrating.ru/api/products
curl https://dsgrating.ru/api/orders
curl https://dsgrating.ru/api/expenses
curl https://dsgrating.ru/api/purchases
```

### Проверка логов
```bash
# Backend логи
docker-compose logs app | grep -E "error|Error|ERROR"

# Проверка маршрутов
docker-compose logs app | grep "📍"
```

## 📝 Чек-лист перед деплоем

- [ ] Проверить порядок маршрутов в backend/src/app.ts
- [ ] Убедиться что нет дублирования путей в route файлах
- [ ] Проверить соответствие Prisma схемы и БД
- [ ] Собрать проект локально перед деплоем
- [ ] Проверить наличие всех переменных окружения
- [ ] Убедиться что есть достаточно памяти (swap)

## 🛠 Восстановление при проблемах

1. **Откат к предыдущей версии**:
   ```bash
   git checkout <previous-commit>
   npm run vps:deploy:build
   ```

2. **Пересоздание БД из бэкапа**:
   ```bash
   docker-compose exec postgres pg_restore -U telesite_user -d telesite < backup.sql
   ```

3. **Очистка и пересборка**:
   ```bash
   docker-compose down
   docker system prune -a
   docker-compose up -d --build
   ``` 
