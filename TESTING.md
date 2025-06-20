# Тестовая система WebApp

Этот проект настроен для тестирования **без привязки к Telegram** и авторизации. Все операции выполняются с фиксированным тестовым пользователем.

## Как это работает

### Тестовый пользователь
- **ID**: `9999`
- **Имя**: Тест Тестович Пользователь
- **Email**: test@webapp.local
- **Телефон**: +7 (999) 999-99-99
- **Бонусы**: 1000₽
- **Заказов**: 5

### Тестовые заказы
При создании пользователя автоматически создаются 3 тестовых заказа:

1. **Заказ "Доставлен"** (месяц назад)
   - Статус: Доставлен ✅
   - Трек-номер: TRK001
   - Товары: 2x Atominex 10mg + 1x Abilify 15mg
   - Сумма: ~13,600₽

2. **Заказ "Отправлен"** (2 недели назад)
   - Статус: Отправлен 🚚
   - Трек-номер: TRK002
   - Товары: 1x Attex 100mg + 3x Atominex 25mg
   - Сумма: ~23,000₽

3. **Заказ "Оплачен"** (неделю назад)
   - Статус: Оплачен 💳
   - Товары: 1x Atominex 60mg + 2x Atominex 40mg
   - Сумма: ~15,500₽

### Автоматическое создание пользователя
При первом обращении к любому API `/api/webapp/*` тестовый пользователь создается автоматически со всеми данными.

## API Endpoints

Все API работают без авторизации с фиксированным пользователем:

### Profile API
```bash
# Получить профиль (создает пользователя если его нет)
GET /api/webapp/profile

# Обновить профиль
PUT /api/webapp/profile
```

### Orders API (История заказов)
```bash
# Получить историю заказов
GET /api/webapp/orders
```

### Subscriptions API (Уведомления о поступлении)
```bash
# Получить подписки
GET /api/webapp/subscriptions

# Создать подписку
POST /api/webapp/subscriptions
Content-Type: application/json
{"product_id": 11}

# Удалить подписку
DELETE /api/webapp/subscriptions?product_id=11
```

### Favorites API (Избранное)
```bash
# Получить избранное
GET /api/webapp/favorites

# Добавить в избранное
POST /api/webapp/favorites
Content-Type: application/json
{"product_id": 7}

# Удалить из избранного
DELETE /api/webapp/favorites?product_id=7
```

### Products API
```bash
# Получить товары
GET /api/webapp/products

# Получить категории
GET /api/webapp/categories
```

## Тестирование

### Быстрый тест всех функций:
```bash
# 1. Создать тестового пользователя с заказами
curl -X GET http://localhost:3000/api/webapp/profile

# 2. Получить историю заказов
curl -X GET http://localhost:3000/api/webapp/orders

# 3. Получить товары
curl -X GET http://localhost:3000/api/webapp/products

# 4. Создать подписку на товар ID 11
curl -X POST http://localhost:3000/api/webapp/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"product_id": 11}'

# 5. Добавить товар ID 7 в избранное
curl -X POST http://localhost:3000/api/webapp/favorites \
  -H "Content-Type: application/json" \
  -d '{"product_id": 7}'

# 6. Проверить подписки
curl -X GET http://localhost:3000/api/webapp/subscriptions

# 7. Проверить избранное
curl -X GET http://localhost:3000/api/webapp/favorites
```

## Очистка данных

Если нужно сбросить тестового пользователя:

```bash
node scripts/reset-test-user.js
```

Это удалит:
- Тестового пользователя
- Все его подписки
- Все избранное
- Корзины и заказы
- Товары заказов (order_items)

При следующем обращении к API пользователь будет создан заново с новыми тестовыми заказами.

## Структура webapp

### Страницы:
- `/webapp` - Каталог товаров
- `/webapp/cart` - Корзина
- `/webapp/favorites` - Избранное
- `/webapp/profile` - Профиль пользователя
- `/webapp/subscriptions` - Подписки на товары
- `/webapp/orders` - История заказов ⭐ **С тестовыми данными**
- `/webapp/support` - Поддержка

### Компоненты:
- `ProductGrid` - Сетка товаров с кнопками подписки/избранного
- `ProductCatalog` - Каталог с навигацией
- `CartSummary` - Плавающая корзина
- `BottomNavigation` - Нижнее меню
- `ProfileForm` - Форма редактирования профиля
- `ActionCards` - Карточки в профиле

## База данных

Система использует те же таблицы что и Rails проект:
- `users` - Пользователи  
- `products` - Товары
- `orders` - Заказы ⭐ **С тестовыми данными**
- `order_items` - Товары в заказах ⭐ **С тестовыми данными**
- `product_subscriptions` - Подписки на товары
- `favorites` - Избранное
- `account_tiers` - Уровни лояльности

## Переменные среды

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Запуск

```bash
npm run dev
# или
yarn dev
```

Webapp будет доступно по адресу: http://localhost:3000/webapp

## Статистика тестовых данных

После создания тестового пользователя в системе будет:
- **3 заказа** на общую сумму ~52,100₽
- **10 товаров** в заказах
- **155₽** заработанных бонусов
- **Разные статусы**: доставлен, отправлен, оплачен
- **Трек-номера** для отслеживания 