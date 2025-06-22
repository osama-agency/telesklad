# 🚀 Конфигурация Beget Cloud Storage (S3-совместимое)

## 📋 Переменные окружения для .env

Добавьте эти переменные в ваш `.env` файл:

```env
# Beget S3 Configuration
AWS_ACCESS_KEY_ID="ESAPKF1C43H8KGOXTXME"
AWS_SECRET_ACCESS_KEY="tYBqZ8CyNvC1B6jxJ7rlGa1lCJJG..."
AWS_REGION="ru-1"
S3_BUCKET_NAME="2c11548b454d-eldar-agency"
S3_ENDPOINT="https://s3.ru1.storage.beget.cloud"
```

## 🔧 Особенности Beget Cloud Storage

### Отличия от Amazon S3:
1. **Другой endpoint**: `https://s3.ru1.storage.beget.cloud`
2. **Регион**: `ru-1` (вместо стандартных AWS регионов)
3. **forcePathStyle**: должен быть `true`
4. **URL структура**: `endpoint/bucket/key` (вместо `bucket.endpoint/key`)

### Настройки CORS в Beget
Если нужна загрузка с фронтенда, настройте CORS в панели управления Beget:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

## 🧪 Тестирование подключения

Теперь можно протестировать загрузку:

```bash
curl -X POST "http://localhost:3001/api/upload/image" \
  -F "file=@path/to/your/image.jpg"
```

## 📁 Структура файлов

Файлы будут сохраняться по адресу:
```
https://s3.ru1.storage.beget.cloud/2c11548b454d-eldar-agency/products/timestamp-filename.jpg
```

## ✅ Готово к использованию!

После добавления переменных окружения и перезапуска сервера, система загрузки изображений будет работать с Beget Cloud Storage. 