# 🧪 Быстрый чек-лист тестирования @strattera_test_bot

## ✅ Статус системы

### Проверено ✅:
- **Redis Worker**: запущен и работает
- **ngrok**: работает на `strattera.ngrok.app:3000`
- **Webhook**: установлен на `https://strattera.ngrok.app/api/telegram/webapp-webhook`
- **Тестовый бот**: @strattera_test_bot готов к тестированию
- **Продакшн бот**: @strattera_bot освобожден для Rails

## 🎯 Быстрый тест (5 минут)

### 1. Основные функции бота
- [ ] Открыть @strattera_test_bot в Telegram
- [ ] Отправить `/start` 
- [ ] Нажать кнопку меню → открывается WebApp
- [ ] URL правильный: `https://strattera.ngrok.app/webapp`

### 2. WebApp быстрый тест
- [ ] Каталог товаров загружается
- [ ] Поиск работает  
- [ ] Можно добавить товар в корзину
- [ ] Профиль отображается

### 3. КРИТИЧНЫЙ тест заказа
- [ ] Добавить товар в корзину
- [ ] Оформить заказ с данными доставки
- [ ] **Получить сообщение с реквизитами** в @strattera_test_bot
- [ ] **Нажать "Я оплатил"**
- [ ] **Получить "⏳ Идет проверка..."**
- [ ] **Получить админское уведомление** с кнопкой "Оплата пришла"
- [ ] **Нажать "Оплата пришла"**
- [ ] **Получить "❤️ Благодарим за покупку!"**

## 🚨 Быстрая диагностика проблем

### Если не работает:
```bash
# Перезапуск всей системы
pkill -f "next dev" && PORT=3000 npm run dev
curl -X POST http://localhost:3000/api/redis/status -d '{"action": "restart_worker"}' -H "Content-Type: application/json"
```

### Проверка статуса:
```bash
npm run telegram:status
curl -X GET http://localhost:3000/api/redis/status
```

## 🚀 Готовность к продакшну

Когда все тесты пройдены:
- [ ] ✅ Бот работает стабильно
- [ ] ✅ WebApp загружается без ошибок  
- [ ] ✅ Процесс заказа работает полностью
- [ ] ✅ Уведомления приходят корректно
- [ ] ✅ Redis Worker стабилен

**🎯 Готов к переходу на @strattera_bot!**

## ⚡ Быстрые команды

```bash
# Статус всего
npm run telegram:status && curl -X GET http://localhost:3000/api/redis/status

# Перезапуск Redis Worker
curl -X POST http://localhost:3000/api/redis/status -d '{"action": "restart_worker"}' -H "Content-Type: application/json"

# Освободить продакшн бота (если нужно)
npm run telegram:production:release
``` 