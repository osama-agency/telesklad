# 🚀 Настройка Amazon S3 для загрузки изображений

## 📋 Необходимые переменные окружения

Добавьте следующие переменные в ваш `.env` файл:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_REGION="us-east-1"
S3_BUCKET_NAME="nextadmin-products"
```

## 🔧 Настройка AWS S3

### 1. Создание S3 Bucket

1. Войдите в [AWS Console](https://console.aws.amazon.com/)
2. Перейдите в S3
3. Нажмите "Create bucket"
4. Укажите имя bucket (например: `nextadmin-products`)
5. Выберите регион (например: `us-east-1`)
6. **Важно**: Отключите "Block all public access" для публичного доступа к изображениям
7. Создайте bucket

### 2. Настройка CORS

В настройках bucket добавьте CORS конфигурацию:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### 3. Создание IAM пользователя

1. Перейдите в IAM
2. Создайте нового пользователя
3. Прикрепите политику:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::nextadmin-products/*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket"
            ],
            "Resource": "arn:aws:s3:::nextadmin-products"
        }
    ]
}
```

4. Получите Access Key ID и Secret Access Key

## 🔄 Два способа загрузки

### 1. Серверная загрузка (через API)
- **Endpoint**: `/api/upload/image`
- **Метод**: POST
- **Тип**: multipart/form-data
- **Поле**: `file`

**Преимущества**:
- ✅ Автоматическая оптимизация изображений
- ✅ Валидация размера и типа файла
- ✅ Конвертация в JPEG
- ✅ Изменение размера до 800x800px

### 2. Клиентская загрузка (Presigned URL)
- **Endpoint**: `/api/upload/presigned-url`
- **Метод**: POST
- **Параметры**: `fileName`, `contentType`

**Преимущества**:
- ✅ Прямая загрузка в S3
- ✅ Быстрее для больших файлов
- ✅ Меньше нагрузки на сервер

## 📁 Структура файлов в S3

```
nextadmin-products/
├── products/
│   ├── 1703123456789-abc123.jpg
│   ├── 1703123456790-def456.jpg
│   └── ...
└── other-folders/
```

## 🔧 Использование в коде

### Загрузка изображения
```typescript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/upload/image', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log('Image URL:', result.imageUrl);
```

### Получение Presigned URL
```typescript
const response = await fetch('/api/upload/presigned-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileName: 'image.jpg',
    contentType: 'image/jpeg'
  }),
});

const { uploadUrl, fileUrl } = await response.json();
```

## 🛡️ Безопасность

- ✅ Валидация типов файлов (только изображения)
- ✅ Ограничение размера файла (5MB)
- ✅ Автоматическая оптимизация
- ✅ Уникальные имена файлов
- ✅ Публичный доступ только к изображениям

## 🚨 Важные моменты

1. **Bucket должен быть публичным** для доступа к изображениям
2. **CORS должен быть настроен** для загрузки с фронтенда
3. **IAM пользователь должен иметь права** на операции с S3
4. **Переменные окружения должны быть установлены** на сервере

## 🔍 Отладка

Если загрузка не работает, проверьте:

1. Переменные окружения установлены
2. AWS credentials корректны
3. Bucket существует и доступен
4. CORS настроен правильно
5. IAM права установлены

## 📊 Мониторинг

В AWS CloudWatch можно отслеживать:
- Количество запросов к S3
- Размер хранилища
- Ошибки загрузки
- Стоимость использования 