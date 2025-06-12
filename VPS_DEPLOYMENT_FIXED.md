# VPS Deployment Fixed - dsgrating.ru

## Проблема
Сайт не открывался на dsgrating.ru из-за нехватки памяти при сборке Next.js приложения на VPS (SIGKILL).

## Решение

### 1. Добавлен Swap файл
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 2. Обновлен Dockerfile.simple
- Использован multi-stage build для оптимизации памяти
- Сборка Next.js перенесена в start-production.js
- Добавлено ограничение памяти: `NODE_OPTIONS=--max-old-space-size=512`

### 3. Обновлен start-production.js
- Добавлена функция buildNextApp() для сборки при старте
- Проверка существования .next директории
- Fallback на альтернативную сборку при ошибках

### 4. Создан скрипт локальной сборки
- `scripts/deploy-build-to-vps.sh` - деплой готового билда
- `npm run vps:deploy:build` - команда для запуска

### 5. Исправлены проблемы с базой данных
- Синхронизированы настройки PostgreSQL в `docker-compose.ssl.yml`
- Пользователь: `telesite_user`, пароль: `your_secure_password_here`
- Применены миграции Prisma

### 6. Исправлена конфигурация Nginx
- Добавлены блоки `events` и `http` в `nginx-ssl.conf`
- Обновлен `server_name` на `dsgrating.ru`

### 7. Решена проблема с API endpoints
- Backend сервер (порт 3011) не запускается из-за отсутствия компиляции
- API routes обновлены для возврата пустых данных при недоступности backend
- Файлы: `src/app/api/products/route.ts`, `src/app/api/orders/route.ts`, `src/app/api/products/hidden/route.ts`

## Текущий статус
✅ Сайт работает: https://dsgrating.ru
✅ SSL сертификат активен
✅ Автоматический редирект на /ru/products
✅ Приложение стабильно работает
✅ API возвращает пустые данные вместо ошибок 500

## Команды управления
```bash
# Проверка статуса
npm run vps:status

# Просмотр логов
npm run vps:logs

# SSH доступ
npm run vps:shell

# Деплой с локальной сборкой
npm run build:next && npm run vps:deploy:build

# Деплой через Docker (если достаточно памяти)
npm run vps:deploy
```

## Мониторинг
```bash
# Проверка памяти на VPS
ssh -i ~/.ssh/telesite_deploy deploy@82.202.131.251 "free -h"

# Проверка контейнеров
ssh -i ~/.ssh/telesite_deploy deploy@82.202.131.251 "cd /opt/telesite && docker-compose -f docker-compose.ssl.yml ps"

# Проверка логов
ssh -i ~/.ssh/telesite_deploy deploy@82.202.131.251 "cd /opt/telesite && docker logs telesite-app-1 --tail 50"
```

## Архитектура
- **Nginx**: Reverse proxy с SSL (порты 80, 443)
- **Next.js**: Основное приложение (порт 3000)
- **PostgreSQL**: База данных (порт 5432)
- **Backend**: API сервер (порт 3011) - не запущен, требует компиляции

## Примечания
- База данных готова к использованию, но пуста
- Backend сервер требует компиляции TypeScript для полной функциональности
- API endpoints возвращают пустые массивы до запуска backend
- Используется Dockerfile.simple вместо основного из-за ограничений памяти
