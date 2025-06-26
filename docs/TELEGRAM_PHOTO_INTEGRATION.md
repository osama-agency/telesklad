# Интеграция фото профиля из Telegram

## Дата реализации
22 января 2025

## Описание
Реализована функциональность загрузки и отображения аватара пользователя из Telegram на странице профиля в WebApp.

## Что было сделано

### 1. Обновление схемы базы данных
Поле `photo_url` уже существовало в таблице `users` в Prisma схеме:
```prisma
model users {
  photo_url String? @db.VarChar
  // ...другие поля
}
```

### 2. Обновление UserService
Добавлены два улучшения в `src/lib/services/UserService.ts`:

#### Сохранение photo_url при создании/обновлении пользователя
```typescript
// При создании нового пользователя
photo_url: tgUser.photo_url || null,

// При обновлении существующего
photo_url: tgUser.photo_url || user.photo_url,
```

#### Новый метод для получения фото через Telegram Bot API
```typescript
static async updateUserPhotoFromTelegram(tgId: string | bigint) {
  // Получает фотографии профиля через getUserProfilePhotos
  // Скачивает самую большую версию последнего фото
  // Сохраняет URL в базу данных
}
```

### 3. Автоматическое обновление фото
При аутентификации пользователя фото автоматически обновляется если:
- У пользователя нет фото
- Прошло больше 24 часов с последнего обновления

```typescript
// Асинхронно обновляем фото профиля из Telegram (не блокируем основной процесс)
if (!user.photo_url || (Date.now() - new Date(user.updated_at).getTime() > 24 * 60 * 60 * 1000)) {
  this.updateUserPhotoFromTelegram(tgId).catch(error => {
    console.error('Failed to update user photo:', error)
  })
}
```

### 4. Обновление API эндпоинтов

#### /api/webapp/profile
Теперь возвращает `photo_url` в ответе:
```typescript
photo_url: user.photo_url,
```

#### /api/webapp/update-photo (новый)
Эндпоинт для ручного обновления фото:
```bash
POST /api/webapp/update-photo
{
  "tg_id": "17603"
}
```

### 5. Обновление стилей
Добавлены стили для корректного отображения аватара:
```scss
.profile-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
```

### 6. Скрипт для обновления фото
Создан скрипт `scripts/update-user-photo.ts` для ручного обновления:
```bash
npm run update-photo 17603
```

## Как это работает

1. При входе пользователя через Telegram WebApp проверяется наличие фото
2. Если фото нет или оно устарело, запускается асинхронное обновление
3. Через Telegram Bot API запрашиваются фотографии профиля пользователя
4. Скачивается самая большая версия последнего фото
5. URL сохраняется в базу данных
6. На странице профиля отображается фото или стандартная иконка

## Ограничения

- Требуется, чтобы бот мог видеть фото профиля пользователя
- Фото хранится как прямая ссылка на серверы Telegram
- Обновление происходит асинхронно, может быть небольшая задержка

## Безопасность

- Используется токен бота из переменных окружения
- Валидация существования пользователя перед обновлением
- Обработка ошибок на всех этапах

## Тестирование

1. Автоматическое обновление при входе
2. Ручное обновление через API: `POST /api/webapp/update-photo`
3. Ручное обновление через скрипт: `npm run update-photo <tg_id>`

## Файлы

- `src/lib/services/UserService.ts` - логика работы с фото
- `src/app/api/webapp/profile/route.ts` - API профиля
- `src/app/api/webapp/update-photo/route.ts` - API обновления фото
- `src/app/webapp/profile/page.tsx` - отображение на странице
- `src/styles/webapp.scss` - стили аватара
- `scripts/update-user-photo.ts` - скрипт для обновления 