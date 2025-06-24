# Руководство по миграции фотографий отзывов

## Обзор

В старом Rails проекте фотографии к отзывам хранились через **Active Storage** локально на сервере. В новом Next.js проекте мы используем **S3-совместимое хранилище Beget Cloud Storage** и храним URL фотографий прямо в поле `photos` таблицы `reviews`.

## Архитектура

### Старая система (Rails + Active Storage)
```
reviews (таблица)
├── id, user_id, product_id, content, rating
│
active_storage_attachments (таблица)
├── record_type = 'Review'
├── record_id → reviews.id
├── blob_id → active_storage_blobs.id
│
active_storage_blobs (таблица)
├── key (уникальный ключ файла)
├── filename (оригинальное имя файла)
├── service_name = 'local' (локальное хранилище)
└── byte_size, content_type
```

### Новая система (Next.js + S3)
```
reviews (таблица)
├── id, user_id, product_id, content, rating
└── photos: String[] (массив URL фотографий в S3)
```

## Статистика

Текущее состояние базы данных:
- **6 фотографий** в Active Storage (service_name = 'local')
- Фотографии принадлежат отзывам с ID: 48, 61, 65, 97, 111, 121

## Команды для работы с миграцией

### 1. Проверка статуса миграции
```bash
npm run photos:check
```

### 2. Проверка через API
```bash
# GET запрос для статуса
curl http://localhost:3000/api/webapp/reviews/migrate-photos
```

### 3. Запуск миграции
```bash
# POST запрос для миграции
curl -X POST http://localhost:3000/api/webapp/reviews/migrate-photos
```

## Процесс миграции

API `/api/webapp/reviews/migrate-photos` выполняет следующие шаги:

1. **Поиск фотографий** в Active Storage с `record_type = 'Review'`
2. **Загрузка файлов** со старого сервера по URL: `https://strattera.ru/rails/active_storage/blobs/{key}/{filename}`
3. **Загрузка в S3** с новым ключом: `reviews/{review_id}/{timestamp}_{filename}`
4. **Обновление отзыва** - добавление URL S3 в поле `photos`

## Структура URL

### Старые URL (Active Storage)
```
https://strattera.ru/rails/active_storage/blobs/tehvuzxewqld5qhbvbt8lhlbfmjd/IMG_3473.jpeg
```

### Новые URL (S3)
```
https://s3.ru1.storage.beget.cloud/2c11548b454d-eldar-agency/reviews/61/1704123456789_IMG_3473.jpeg
```

## Безопасность

- ✅ **Проверка существования отзыва** перед миграцией
- ✅ **Валидация файлов** по content_type
- ✅ **Обработка ошибок** для каждого файла отдельно
- ✅ **Логирование** всех операций
- ✅ **Сохранение оригинальных имен** файлов

## Совместимость

После миграции:
- **Старые фотографии** остаются в Active Storage (для backup)
- **Новые фотографии** добавляются через новую систему загрузки
- **API отзывов** возвращает фотографии из поля `photos`

## Мониторинг

### Проверка успешности миграции
```sql
-- Количество отзывов с фотографиями в новой системе
SELECT COUNT(*) FROM reviews WHERE array_length(photos, 1) > 0;

-- Детали отзывов с фотографиями
SELECT id, user_id, product_id, array_length(photos, 1) as photo_count, photos 
FROM reviews 
WHERE array_length(photos, 1) > 0;
```

### Проверка Active Storage
```sql
-- Количество фотографий в Active Storage
SELECT COUNT(*) FROM active_storage_attachments WHERE record_type = 'Review';

-- Детали фотографий
SELECT asa.record_id, asb.filename, asb.byte_size, asb.service_name
FROM active_storage_attachments asa
JOIN active_storage_blobs asb ON asa.blob_id = asb.id
WHERE asa.record_type = 'Review';
```

## Откат (если необходимо)

Для отката миграции можно очистить поле `photos`:
```sql
UPDATE reviews SET photos = '{}' WHERE array_length(photos, 1) > 0;
```

## Файлы проекта

### API
- `src/app/api/webapp/reviews/migrate-photos/route.ts` - API миграции
- `src/app/api/webapp/reviews/upload/route.ts` - API загрузки новых фото

### Скрипты
- `scripts/check-photo-migration.ts` - проверка статуса миграции

### Компоненты
- `src/app/webapp/_components/PhotoUploader.tsx` - загрузка фото
- `src/app/webapp/_components/ReviewPhotos.tsx` - отображение фото
- `src/app/webapp/_components/ReviewForm.tsx` - форма отзыва
- `src/app/webapp/_components/ReviewsList.tsx` - список отзывов

## Следующие шаги

1. ✅ Создана система миграции
2. ⏳ Запустить миграцию фотографий
3. ⏳ Проверить корректность отображения
4. ⏳ Протестировать загрузку новых фото
5. ⏳ Обновить документацию для пользователей 