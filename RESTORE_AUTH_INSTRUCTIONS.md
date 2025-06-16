# Инструкция по восстановлению авторизации

## Обзор
Авторизация была временно отключена для тестирования и отладки приложения. Данная инструкция поможет восстановить полную функциональность авторизации.

## Что было отключено

### 1. Middleware (`src/middleware.ts`)
- Закомментирован `withAuth` из next-auth
- Заменен на простую функцию, пропускающую все запросы

### 2. API Routes - проверки сессии отключены в:
- `src/app/api/orders/route.ts` - GET метод
- `src/app/api/orders/profit/route.ts` - GET метод  
- `src/app/api/products/route.ts` - GET и POST методы
- `src/app/api/orders/sync/route.ts` - GET метод
- И других API файлах (см. комментарии "ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ")

## Как восстановить авторизацию

### Шаг 1: Восстановить middleware
В файле `src/middleware.ts`:

```typescript
// Раскомментировать:
import { withAuth } from "next-auth/middleware";

// Удалить временную функцию и раскомментировать:
export default withAuth(
  function middleware(req) {
    if (req.nextUrl.pathname === "/login" && req.nextauth.token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname === "/login") {
          return true;
        }
        return !!token;
      },
    },
  }
);
```

### Шаг 2: Восстановить проверки в API
Найти все комментарии "ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ" и раскомментировать код:

```typescript
// Раскомментировать в каждом API файле:
const session = await getServerSession();
if (!session?.user?.email) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Шаг 3: Проверить конфигурацию NextAuth
Убедиться, что в `.env` настроены:
```
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Шаг 4: Проверить базу данных
Убедиться, что созданы таблицы NextAuth:
- `telesklad_users`
- `accounts` 
- `sessions`

И создан администратор:
- Email: `go@osama.agency`
- Password: `IOHuohqfhew`

## Быстрое восстановление

Выполнить поиск и замену в проекте:
1. Найти: `// ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ`
2. Раскомментировать все строки после этого комментария
3. Восстановить middleware как показано выше

## Проверка работы
После восстановления:
1. Перезапустить сервер разработки
2. Перейти на `http://localhost:3000`
3. Должно произойти перенаправление на `/login`
4. Войти с учетными данными администратора
5. Проверить доступ к API endpoints

## Контакты для поддержки
При возникновении проблем обратиться к разработчику, который выполнял отключение авторизации. 