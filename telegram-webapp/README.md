# Telegram WebApp - Status Selector

Веб-приложение для изменения статуса закупок в Telegram через WebApp.

## 🚀 Деплой на Railway

### Шаг 1: Подготовка репозитория

1. Создайте новый репозиторий на GitHub
2. Загрузите эту папку `telegram-webapp` в корень репозитория

### Шаг 2: Деплой на Railway

1. Перейдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. Нажмите "New Project" → "Deploy from GitHub repo"
4. Выберите ваш репозиторий с WebApp
5. Railway автоматически определит Node.js проект и задеплоит его

### Шаг 3: Получение HTTPS URL

После деплоя Railway предоставит вам HTTPS URL, например:
```
https://your-project-name.up.railway.app
```

### Шаг 4: Настройка Backend

Добавьте переменные окружения в ваш backend:

```env
WEBAPP_URL=https://your-project-name.up.railway.app
BACKEND_URL=https://your-backend-url.com
```

## 📱 Использование

WebApp поддерживает следующие параметры URL:

- `orderId` - ID заказа
- `currentStatus` - текущий статус заказа
- `sequenceId` - номер заказа
- `backendUrl` - URL вашего backend сервера

Пример:
```
https://your-project-name.up.railway.app?orderId=123&currentStatus=pending&sequenceId=5&backendUrl=https://your-backend.com
```

## 🔧 Разработка

Для локальной разработки:

```bash
npm install
npm start
```

Сервер запустится на `http://localhost:3000`

## 📋 Поддерживаемые статусы

- `pending` - Ожидает подтверждения
- `confirmed` - Подтверждено  
- `ready_for_payment` - Готов к оплате
- `paid` - Оплачено
- `in_transit` - В пути
- `delivering` - Доставляется
- `received` - Получено
- `cancelled` - Отменено

## 🛠 Технологии

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express
- **Deploy**: Railway
- **Integration**: Telegram WebApp API 
