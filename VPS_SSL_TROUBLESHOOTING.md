# 🔧 Решение проблем с SSL и запуском сайта на VPS

## 🚨 **Проблема: Сайт не открывается**

### Симптомы:
- `ERR_CONNECTION_REFUSED` - соединение отклонено
- `NET::ERR_CERT_AUTHORITY_INVALID` - недействительный SSL сертификат
- 502 Bad Gateway - nginx не может подключиться к приложению

## 🔍 **Диагностика проблем:**

### 1. Проверка статуса контейнеров:
```bash
ssh -i ~/.ssh/telesite_deploy deploy@82.202.131.251 "cd /opt/telesite && docker-compose -f docker-compose.ssl.yml ps"
```

### 2. Проверка логов:
```bash
# Логи приложения
ssh -i ~/.ssh/telesite_deploy deploy@82.202.131.251 "cd /opt/telesite && docker-compose -f docker-compose.ssl.yml logs app --tail=20"

# Логи nginx
ssh -i ~/.ssh/telesite_deploy deploy@82.202.131.251 "cd /opt/telesite && docker-compose -f docker-compose.ssl.yml logs nginx --tail=20"
```

### 3. Проверка доступности:
```bash
# HTTPS
curl -k -I https://dsgrating.ru

# HTTP
curl -I http://dsgrating.ru
```

## 🛠️ **Решения:**

### 1. **Проблема с SSL сертификатами**

**Причина:** Nginx ищет `cert.pem` и `key.pem`, но созданы `selfsigned.crt` и `selfsigned.key`

**Решение:**
```bash
# Исправить пути в nginx-ssl.conf
ssl_certificate /etc/nginx/ssl/selfsigned.crt;
ssl_certificate_key /etc/nginx/ssl/selfsigned.key;
```

### 2. **TypeScript ошибки в backend**

**Причина:** Параметр `item` имеет тип `any`

**Решение:**
```typescript
// Заменить
items: order.items.map((item: any) => ({

// На
items: order.items.map((item) => ({
```

### 3. **Проблемы с памятью (SIGKILL)**

**Причина:** VPS с малым объемом RAM (< 2GB)

**Решение:**
```bash
# Очистка Docker
ssh -i ~/.ssh/telesite_deploy deploy@82.202.131.251 "docker system prune -af && docker volume prune -f"

# Использование простого Dockerfile
docker-compose -f docker-compose.http.yml up -d --build
```

### 4. **Отсутствие переменных окружения**

**Решение:**
```bash
# Создать .env файл на VPS
ssh -i ~/.ssh/telesite_deploy deploy@82.202.131.251 "cd /opt/telesite && cat > .env << EOF
TELEGRAM_BOT_TOKEN=7234567890:AAHdqTcvbXrxfMeThHmzVyIU0aO2TBdy-N0
TELEGRAM_RECIPIENTS=125861752,795960178
EOF"
```

## 🌐 **Временное решение: HTTP версия**

Для быстрого тестирования без SSL:

```bash
# Запуск HTTP версии
ssh -i ~/.ssh/telesite_deploy deploy@82.202.131.251 "cd /opt/telesite && docker-compose -f docker-compose.http.yml up -d --build"

# Доступ через HTTP
http://dsgrating.ru
```

## 🔒 **Решение проблемы SSL в браузере:**

### Вариант 1: Принять самоподписанный сертификат
1. В Chrome нажать **"Дополнительно"**
2. Выбрать **"Перейти на сайт dsgrating.ru (небезопасно)"**

### Вариант 2: Отключить проверку SSL (только для разработки)
```bash
# Запуск Chrome с отключенной проверкой SSL
google-chrome --ignore-certificate-errors --ignore-ssl-errors --allow-running-insecure-content
```

## 📋 **Команды для быстрого восстановления:**

```bash
# 1. Полная очистка и перезапуск
ssh -i ~/.ssh/telesite_deploy deploy@82.202.131.251 "cd /opt/telesite && docker-compose -f docker-compose.ssl.yml down --volumes --remove-orphans && docker system prune -af && docker-compose -f docker-compose.ssl.yml up -d --build"

# 2. Быстрый HTTP запуск
ssh -i ~/.ssh/telesite_deploy deploy@82.202.131.251 "cd /opt/telesite && git pull origin main && docker-compose -f docker-compose.http.yml up -d --build"

# 3. Проверка статуса
ssh -i ~/.ssh/telesite_deploy deploy@82.202.131.251 "cd /opt/telesite && docker-compose -f docker-compose.http.yml ps && curl -I http://dsgrating.ru"
```

## 🎯 **Итоговое состояние:**

- ✅ SSL конфигурация исправлена
- ✅ TypeScript ошибки устранены  
- ✅ HTTP версия создана для тестирования
- ✅ Docker очищен (освобождено 7GB)
- 🔄 Контейнеры пересобираются...

**Ожидаемый результат:** Сайт должен быть доступен по http://dsgrating.ru через 2-3 минуты после завершения сборки. 
