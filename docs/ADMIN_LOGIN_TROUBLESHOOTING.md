# Решение проблем с входом в админку NEXTADMIN

## Диагностика проблемы

### Проверенные компоненты ✅

1. **База данных** - Пользователь администратор существует:
   - Email: `go@osama.agency`
   - Пароль: `admin123` (хэшированный)
   - Роль: `ADMIN`
   - ID: `1b00b060ccaa75ab65dd84b4`

2. **NextAuth конфигурация** - Исправлена критическая ошибка:
   - Изменено название модели с `telesklad_userss` на `telesklad_users`
   - Файл: `src/libs/auth.ts`, строка 36

3. **Сервер** - Работает корректно:
   - Порт: 3000
   - Страница логина доступна: `http://localhost:3000/login`
   - API работает: `/api/auth/csrf`, `/api/auth/session`

4. **Переменные окружения** - Настроены:
   - `DATABASE_URL` - подключение к PostgreSQL
   - `NEXTAUTH_SECRET` - секретный ключ
   - `NEXTAUTH_URL` - URL приложения

### Возможные причины проблемы

1. **CSRF токен** - NextAuth перенаправляет на `/api/auth/signin?csrf=true`
2. **Конфигурация NextAuth** - возможны проблемы с провайдером credentials
3. **Middleware** - может блокировать запросы аутентификации

## Пошаговое решение

### Шаг 1: Проверка базы данных

```bash
# Запустить скрипт проверки пользователя
node scripts/test-login.js
```

Ожидаемый результат:
```
✅ Пароль правильный! Вход должен работать.
```

### Шаг 2: Проверка API аутентификации

```bash
# Проверить существование пользователя
curl http://localhost:3000/api/test-auth

# Проверить пароль
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"go@osama.agency","password":"admin123"}' \
  http://localhost:3000/api/test-auth
```

### Шаг 3: Проверка NextAuth API

```bash
# CSRF токен
curl http://localhost:3000/api/auth/csrf

# Сессия
curl http://localhost:3000/api/auth/session
```

### Шаг 4: Тестовая страница

Открыть в браузере: `http://localhost:3000/test-auth`

Эта страница позволяет:
- Видеть текущую сессию
- Тестировать вход через NextAuth
- Получать детальные логи в консоли

## Данные для входа

- **Email**: `go@osama.agency`
- **Пароль**: `admin123`
- **Роль**: `ADMIN`

## Возможные решения

### 1. Перезапуск сервера

```bash
# Остановить сервер
pkill -f "next dev"

# Запустить сервер
PORT=3000 npm run dev
```

### 2. Очистка кэша браузера

- Очистить куки для localhost:3000
- Очистить localStorage
- Перезагрузить страницу

### 3. Проверка в браузере

1. Открыть `http://localhost:3000/login`
2. Ввести данные: `go@osama.agency` / `admin123`
3. Открыть DevTools → Console для просмотра ошибок
4. Открыть DevTools → Network для анализа запросов

### 4. Альтернативный вход

Если основная страница не работает, использовать тестовую:
`http://localhost:3000/test-auth`

## Проверка статуса

После входа проверить:

```bash
# Проверка роли администратора
curl http://localhost:3000/api/user/check-admin
```

## Файлы для проверки

- `src/libs/auth.ts` - конфигурация NextAuth
- `src/app/(auth)/login/page.tsx` - страница логина
- `src/middleware.ts` - middleware аутентификации
- `.env.local` - переменные окружения
- `prisma/schema.prisma` - схема базы данных

## Логи для анализа

Проверить логи сервера Next.js на наличие ошибок:
- Ошибки подключения к базе данных
- Ошибки NextAuth
- Ошибки валидации пароля

## Контакты для поддержки

При возникновении проблем обратиться к документации NextAuth:
- https://next-auth.js.org/getting-started/introduction
- https://next-auth.js.org/providers/credentials 