# Загрузка аватаров в S3

## Обзор
Реализована загрузка аватаров пользователей в S3-совместимое хранилище Beget Cloud Storage вместо локальной файловой системы.

## Конфигурация

### Переменные окружения
```env
S3_ENDPOINT=https://s3.ru1.storage.beget.cloud
S3_BUCKET=2c11548b454d-eldar-agency
S3_REGION=ru-1
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
```

## Реализация

### 1. API Endpoint для загрузки аватара
**Файл**: `src/app/api/user/upload-avatar/route.ts`

```typescript
// Основные функции:
- Проверка прав доступа (только для админов)
- Валидация файла (тип, размер)
- Удаление старого аватара из S3
- Загрузка нового аватара в папку 'avatars'
- Обновление URL в базе данных
- Логирование действия в audit log
```

### 2. Использование S3 клиента
```typescript
import { uploadToS3, deleteFromS3 } from '@/lib/s3';

// Загрузка файла
const avatarUrl = await uploadToS3(
  buffer,
  file.name,
  file.type,
  'avatars' // Папка для аватаров
);

// Удаление старого аватара
await deleteFromS3(currentUser.image);
```

### 3. Структура URL аватаров
```
https://s3.ru1.storage.beget.cloud/2c11548b454d-eldar-agency/avatars/{timestamp}-{filename}
```

## Безопасность

### Проверки доступа
1. **Аутентификация**: Проверка сессии NextAuth
2. **Авторизация**: Проверка прав `Permission.USER_UPDATE`
3. **Ограничение доступа**: Только для администраторов

### Валидация файлов
- **Типы файлов**: Только изображения (jpeg, png, gif)
- **Размер**: Максимум 5MB
- **Проверка MIME-типа**: На уровне API

## Интеграция с UI

### Компонент настроек пользователя
**Файл**: `src/app/(site)/pages/settings/page.tsx`

```typescript
// Функции:
- handleAvatarChange: Выбор файла и предпросмотр
- handleAvatarUpload: Отправка на сервер
- loadCurrentAvatar: Загрузка текущего аватара
```

### Отображение аватара
```typescript
<img 
  src={avatarPreview} 
  alt="Аватар" 
  className="w-full h-full object-cover"
/>
```

## Миграция с локального хранилища

### Старый формат (локальные файлы)
```
/uploads/avatars/admin-avatar-{timestamp}.{ext}
```

### Новый формат (S3)
```
https://s3.ru1.storage.beget.cloud/{bucket}/avatars/{timestamp}-{filename}
```

## Преимущества использования S3

1. **Масштабируемость**: Неограниченное хранилище
2. **Надежность**: Резервное копирование на уровне S3
3. **Производительность**: CDN и кеширование
4. **Безопасность**: ACL и подписанные URL
5. **Централизация**: Единое хранилище для всех медиа-файлов

## Логирование

Все операции с аватарами логируются через `AuditLogService`:
```typescript
await AuditLogService.log({
  userId: session.user.email,
  action: 'AVATAR_UPLOAD',
  resource: 'user',
  resourceId: currentUser?.id,
  details: { 
    fileName: file.name,
    fileSize: file.size,
    avatarUrl 
  }
});
```

## Обработка ошибок

1. **Неудачное удаление старого аватара**: Продолжаем загрузку нового
2. **Ошибка загрузки в S3**: Возвращаем 500 ошибку
3. **Превышение размера файла**: Возвращаем 400 ошибку
4. **Неверный тип файла**: Возвращаем 400 ошибку

## Тестирование

### Проверка загрузки
1. Войти как администратор (go@osama.agency)
2. Перейти в Настройки → Пользователь
3. Выбрать изображение для аватара
4. Нажать "Загрузить аватар"
5. Проверить отображение нового аватара

### Проверка S3
```bash
# Проверить наличие файла в S3
aws s3 ls s3://2c11548b454d-eldar-agency/avatars/ --endpoint-url=https://s3.ru1.storage.beget.cloud
```

## Дальнейшие улучшения

1. **Оптимизация изображений**: Ресайз и сжатие перед загрузкой
2. **Множественные размеры**: Генерация thumbnail версий
3. **Прогресс загрузки**: Отображение процента загрузки
4. **Drag & Drop**: Поддержка перетаскивания файлов
5. **Crop функционал**: Обрезка изображения перед загрузкой 