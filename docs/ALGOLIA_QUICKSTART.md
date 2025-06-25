# Algolia Quick Start Guide

Быстрая инструкция по настройке Algolia InstantSearch в проекте NEXTADMIN.

## 🚀 Шаг 1: Настройка аккаунта Algolia

1. Зарегистрируйтесь на [algolia.com](https://www.algolia.com/)
2. Создайте новое приложение
3. Скопируйте API ключи из раздела **API Keys**

## 🔧 Шаг 2: Настройка переменных окружения

Добавьте в `.env.local`:

```bash
NEXT_PUBLIC_ALGOLIA_APP_ID=YourAppID
NEXT_PUBLIC_ALGOLIA_SEARCH_KEY=YourSearchKey
NEXT_PUBLIC_ALGOLIA_INDEX_PRODUCTS=nextadmin_products
ALGOLIA_ADMIN_API_KEY=YourAdminKey
```

## 📊 Шаг 3: Синхронизация данных

Выполните первоначальную синхронизацию товаров:

```bash
# Через API
curl -X POST http://localhost:3000/api/algolia/sync

# Или через браузер
# Перейдите на http://localhost:3000/api/algolia/sync
```

## ✅ Шаг 4: Проверка работы

1. Запустите приложение: `npm run dev`
2. Откройте WebApp: `https://strattera.ngrok.app/webapp`
3. Попробуйте поиск в хедере
4. Перейдите на страницу поиска

## 📱 Готово!

Теперь ваши пользователи могут:
- 🔍 Мгновенно искать товары
- 📝 Использовать автодополнение
- 🏷️ Фильтровать по категориям
- 📊 Видеть релевантные результаты

## 🔧 Дополнительные настройки

### В панели Algolia настройте:

1. **Searchable Attributes**:
   - `name` (ordered)
   - `description` (unordered)
   - `category_name` (unordered)

2. **Facets**:
   - `category_name`
   - `is_in_stock`
   - `price`

3. **Ranking**:
   - Оставьте по умолчанию или настройте под свои нужды

## 🚨 Troubleshooting

**Поиск не работает?**
- Проверьте переменные окружения
- Убедитесь что синхронизация прошла успешно
- Проверьте лимиты в Algolia dashboard

**Нет результатов?**
- Убедитесь что `show_in_webapp = true` для товаров
- Проверьте индекс в Algolia dashboard

---

💡 **Tip**: Если Algolia недоступен, приложение автоматически переключится на стандартный поиск. 