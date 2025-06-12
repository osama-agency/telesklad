# 🚀 Руководство по настройке VPS для Telesite

## 🔐 Безопасная настройка SSH

### 1. Первоначальное подключение

```bash
# Подключитесь к серверу
ssh root@82.202.131.251
# Пароль: I%8HdBzGlGpx
```

### 2. Создание безопасного пользователя

```bash
# Создаем пользователя для deployment
adduser deploy
usermod -aG sudo deploy

# Создаем SSH ключи для безопасного доступа
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
```

### 3. Настройка SSH ключей (на локальной машине)

```bash
# Генерируем SSH ключ (если его нет)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Копируем публичный ключ на сервер
ssh-copy-id deploy@82.202.131.251

# Или вручную:
cat ~/.ssh/id_ed25519.pub | ssh deploy@82.202.131.251 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### 4. Настройка безопасности SSH

```bash
# Редактируем конфигурацию SSH
sudo nano /etc/ssh/sshd_config

# Добавляем/изменяем следующие настройки:
Port 22
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers deploy

# Перезапускаем SSH
sudo systemctl restart sshd
```

## 🐳 Установка Docker

### 1. Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Установка Docker

```bash
# Устанавливаем зависимости
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Добавляем GPG ключ Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавляем репозиторий Docker
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Устанавливаем Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Добавляем пользователя в группу docker
sudo usermod -aG docker deploy

# Устанавливаем Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Настройка брандмауэра

```bash
# Устанавливаем UFW
sudo apt install -y ufw

# Настраиваем правила
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS

# Включаем брандмауэр
sudo ufw enable
```

## 📁 Подготовка к деплою

### 1. Создание рабочей директории

```bash
# Создаем директорию для проекта
sudo mkdir -p /opt/telesite
sudo chown deploy:deploy /opt/telesite
cd /opt/telesite

# Клонируем репозиторий (замените на ваш)
git clone https://github.com/your-username/telesite.git .
```

### 2. Настройка переменных окружения

```bash
# Копируем файл переменных окружения
cp docker.env .env

# Редактируем .env файл
nano .env
```

**Важные переменные для изменения:**

```env
# Смените пароль базы данных
POSTGRES_PASSWORD=your_very_secure_password_here

# Установите секретный ключ для NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Укажите ваш домен
NEXTAUTH_URL=https://yourdomain.com

# Обновите DATABASE_URL с новым паролем
DATABASE_URL=postgresql://telesite_user:your_very_secure_password_here@postgres:5432/telesite?schema=public
```

## 🚀 Деплой приложения

### 1. Запуск деплоя

```bash
# Делаем скрипт исполняемым
chmod +x scripts/deploy-vps.sh scripts/generate-ssl.sh

# Запускаем деплой
./scripts/deploy-vps.sh
```

### 2. Проверка статуса

```bash
# Проверяем статус контейнеров
docker-compose ps

# Проверяем логи
docker-compose logs -f

# Тестируем приложение
curl http://localhost:3000/api/health
```

## 🌐 Настройка домена (опционально)

### 1. DNS записи

Настройте A-запись в вашем DNS провайдере:
```
yourdomain.com -> 82.202.131.251
```

### 2. SSL сертификаты Let's Encrypt

```bash
# Устанавливаем Certbot
sudo apt install -y certbot

# Останавливаем nginx
docker-compose stop nginx

# Получаем сертификат
sudo certbot certonly --standalone -d yourdomain.com

# Копируем сертификаты
sudo mkdir -p /opt/telesite/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/telesite/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/telesite/ssl/key.pem
sudo chown deploy:deploy /opt/telesite/ssl/*

# Обновляем nginx.conf для использования реальных сертификатов
nano nginx.conf
# Раскомментируйте строки с cert.pem и key.pem

# Перезапускаем nginx
docker-compose up -d nginx
```

## 🔧 Управление приложением

### Основные команды

```bash
# Остановить все сервисы
docker-compose down

# Запустить все сервисы
docker-compose up -d

# Перезапустить определенный сервис
docker-compose restart app

# Посмотреть логи
docker-compose logs -f app

# Обновить приложение
git pull origin main
docker-compose build --no-cache
docker-compose up -d

# Резервное копирование базы данных
docker-compose exec postgres pg_dump -U telesite_user telesite > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🔒 Безопасность

### 1. Автоматические обновления

```bash
# Настраиваем автоматические обновления безопасности
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 2. Мониторинг

```bash
# Устанавливаем htop для мониторинга
sudo apt install -y htop

# Проверяем использование ресурсов
htop
docker stats
```

### 3. Регулярные задачи

```bash
# Добавляем в crontab очистку логов Docker
crontab -e

# Добавляем строку:
0 2 * * * docker system prune -f
```

## 📞 Поддержка

- **Логи приложения**: `docker-compose logs -f app`
- **Логи базы данных**: `docker-compose logs -f postgres`
- **Статус системы**: `docker-compose ps`
- **Использование ресурсов**: `docker stats`

## 🔧 Troubleshooting

### Если приложение не запускается:
```bash
# Проверяем логи
docker-compose logs app

# Проверяем конфигурацию
docker-compose config

# Пересобираем образы
docker-compose build --no-cache
```

### Если база данных недоступна:
```bash
# Проверяем статус PostgreSQL
docker-compose logs postgres

# Подключаемся к базе для диагностики
docker-compose exec postgres psql -U telesite_user -d telesite
``` 
