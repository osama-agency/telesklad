# 🔒 Руководство по настройке SSL сертификата

## ✅ **Что было сделано:**

### 1. Установка Certbot
```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Получение SSL сертификата от Let's Encrypt
```bash
# Остановка Docker nginx
docker-compose -f docker-compose.ssl.yml stop nginx

# Создание временной конфигурации nginx
echo 'server { listen 80; server_name dsgrating.ru www.dsgrating.ru; location / { return 200 "SSL setup in progress"; add_header Content-Type text/plain; } }' | sudo tee /etc/nginx/sites-available/dsgrating.ru

# Активация конфигурации
sudo ln -sf /etc/nginx/sites-available/dsgrating.ru /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl start nginx

# Получение сертификата
sudo certbot --nginx -d dsgrating.ru -d www.dsgrating.ru --non-interactive --agree-tos --email eldar.osama@gmail.com
```

### 3. Создание конфигурации с SSL
- **nginx-letsencrypt.conf** - конфигурация nginx с настоящим SSL
- **docker-compose.letsencrypt.yml** - Docker Compose с монтированием сертификатов

### 4. Запуск приложения с SSL
```bash
# Остановка системного nginx
sudo systemctl stop nginx
sudo systemctl disable nginx

# Запуск приложения с SSL
docker-compose -f docker-compose.letsencrypt.yml up -d --build
```

## 🔄 **Автоматическое обновление сертификата:**

Let's Encrypt сертификаты действуют 90 дней. Для автоматического обновления:

```bash
# Добавить в crontab
sudo crontab -e

# Добавить строку (обновление каждые 12 часов)
0 */12 * * * certbot renew --quiet --deploy-hook "docker-compose -f /opt/telesite/docker-compose.letsencrypt.yml restart nginx"
```

## 📋 **Проверка SSL:**

### Проверка сертификата:
```bash
# Проверка срока действия
sudo certbot certificates

# Тест обновления
sudo certbot renew --dry-run
```

### Проверка сайта:
- **HTTPS:** https://dsgrating.ru
- **WebApp:** https://dsgrating.ru/telegram-webapp/edit-order.html
- **API:** https://dsgrating.ru/api/health

## 🚀 **Команды управления:**

```bash
# Запуск с SSL
docker-compose -f docker-compose.letsencrypt.yml up -d

# Перезапуск nginx
docker-compose -f docker-compose.letsencrypt.yml restart nginx

# Просмотр логов
docker-compose -f docker-compose.letsencrypt.yml logs nginx

# Остановка
docker-compose -f docker-compose.letsencrypt.yml down
```

## 🔧 **Файлы конфигурации:**

- `nginx-letsencrypt.conf` - конфигурация nginx с SSL
- `docker-compose.letsencrypt.yml` - Docker Compose с SSL
- `/etc/letsencrypt/live/dsgrating.ru/` - сертификаты Let's Encrypt

## ⚠️ **Важные моменты:**

1. **Сертификаты монтируются** из системы в Docker контейнер
2. **Автоматическое обновление** настроено через cron
3. **Редирект HTTP → HTTPS** настроен автоматически
4. **Поддержка HTTP/2** включена для лучшей производительности

## 🎯 **Результат:**

✅ Настоящий SSL сертификат от Let's Encrypt  
✅ Автоматическое обновление сертификата  
✅ Редирект с HTTP на HTTPS  
✅ Поддержка HTTP/2  
✅ Безопасное соединение для WebApp 
