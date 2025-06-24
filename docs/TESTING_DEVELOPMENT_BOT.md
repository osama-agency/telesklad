# Тестирование @strattera_test_bot и подготовка к продакшну

## 🎯 Текущая задача

Тестируем все функции с **@strattera_test_bot** для разработки, чтобы затем готовый проект перенести на продакшн бот **@strattera_bot**.

## 🔧 Настройка тестовой среды

### 1. Проверка состояния системы

```bash
# Проверить статус ботов
npm run telegram:status

# Проверить Redis Worker
curl -X GET http://localhost:3000/api/redis/status

# Запустить Redis Worker если остановлен
curl -X POST http://localhost:3000/api/redis/status -d '{"action": "restart_worker"}' -H "Content-Type: application/json"
```

### 2. Запуск Next.js приложения

```bash
# Остановить другие процессы на порту 3000
pkill -f "next dev" 

# Запустить на правильном порту
PORT=3000 npm run dev
```

### 3. Настройка ngrok (для webhook)

```bash
# Запустить ngrok с доменом
ngrok http --domain=strattera.ngrok.app 3000

# В другом терминале установить webhook
npm run telegram:webhook:setup
```

## 🧪 План тестирования

### ✅ Тест 1: Основные функции бота

1. **Открыть @strattera_test_bot в Telegram**
2. **Отправить /start** - должно появиться приветствие с кнопкой
3. **Нажать кнопку меню** - должно открыться WebApp
4. **Проверить URL**: `https://strattera.ngrok.app/webapp`

### ✅ Тест 2: WebApp функциональность

1. **Каталог товаров** - должны загружаться товары
2. **Поиск** - должен работать поиск по товарам  
3. **Избранное** - добавление/удаление из избранного
4. **Корзина** - добавление товаров в корзину
5. **Профиль** - отображение данных пользователя

### ✅ Тест 3: Процесс заказа (КРИТИЧНЫЙ)

1. **Добавить товар в корзину**
2. **Перейти к оформлению заказа**
3. **Заполнить данные доставки**
4. **Создать заказ** - статус "unpaid"
5. **Получить сообщение с реквизитами** в @strattera_test_bot
6. **Нажать "Я оплатил"** 
7. **Проверить получение уведомления "⏳ Идет проверка..."**
8. **Проверить уведомление админу** с кнопкой "Оплата пришла"
9. **Нажать "Оплата пришла"** (от админа)
10. **Проверить сообщение клиенту** "❤️ Благодарим за покупку!"

### ✅ Тест 4: Админские функции

1. **Уведомления админу** - приходят ли в @strattera_test_bot
2. **Callback кнопки** - работают ли кнопки админа
3. **Статусы заказов** - меняются ли корректно

## 🔍 Проверка логов

### Логи Next.js (терминал)
Смотрите на сообщения:
- `✅ Redis Queue Worker running`
- `📨 [WEBAPP BOT] Webhook received`
- `📋 Processing order status change`

### Логи Telegram
В чате @strattera_test_bot должны приходить:
- Сообщения с реквизитами
- Уведомления о проверке оплаты
- Благодарности за покупку

### Проверка Redis
```bash
curl -X GET http://localhost:3000/api/redis/status | jq
```

## 🚨 Типичные проблемы и решения

### Проблема: Redis Worker остановлен
```bash
curl -X POST http://localhost:3000/api/redis/status -d '{"action": "restart_worker"}' -H "Content-Type: application/json"
```

### Проблема: Webhook не работает
```bash
# Проверить ngrok
ps aux | grep ngrok

# Переустановить webhook  
npm run telegram:webhook:setup
```

### Проблема: Порт 3000 занят
```bash
pkill -f "next dev"
PORT=3000 npm run dev
```

### Проблема: Не приходят уведомления
1. Проверить Redis Worker
2. Проверить webhook
3. Проверить логи в терминале

## 📋 Чек-лист готовности к продакшну

Перед переходом на @strattera_bot убедитесь:

- [ ] ✅ Все тесты пройдены успешно
- [ ] ✅ WebApp работает стабильно  
- [ ] ✅ Процесс заказа работает от начала до конца
- [ ] ✅ Уведомления приходят корректно
- [ ] ✅ Админские функции работают
- [ ] ✅ Redis и очереди функционируют
- [ ] ✅ Нет критических ошибок в логах

## 🚀 Переход на продакшн

Когда всё протестировано, выполните:

### 1. Подготовка продакшн окружения
```bash
# Установить NODE_ENV=production в настройках сервера
# Настроить домен продакшн сервера
# Убедиться что Rails освободил @strattera_bot
```

### 2. Переключение токенов
```bash
# Система автоматически переключится на tg_token в production
npm run telegram:switch:prod
```

### 3. Настройка webhook продакшн бота
```bash
# Установить webhook на продакшн домен
npm run telegram:webhook:setup -- --prod
```

### 4. Проверка продакшн бота
```bash
npm run telegram:status
```

## 📞 Быстрые команды

```bash
# Перезапуск всей системы для тестирования
pkill -f "next dev" && PORT=3000 npm run dev
curl -X POST http://localhost:3000/api/redis/status -d '{"action": "restart_worker"}' -H "Content-Type: application/json"

# Проверка статуса
npm run telegram:status
curl -X GET http://localhost:3000/api/redis/status

# Настройка webhook
npm run telegram:webhook:setup
```

## 🎯 Результат

После успешного тестирования у вас будет:
- ✅ Полностью протестированная система с @strattera_test_bot
- ✅ Готовность к переходу на @strattera_bot  
- ✅ Документированные процедуры тестирования
- ✅ План перехода на продакшн 