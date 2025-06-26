# Удаление аватара пользователя из хедера WebApp

## ✅ Изменение выполнено

В хедере webapp теперь всегда отображается иконка профиля вместо аватара пользователя.

### 📁 Измененный файл:

**`src/app/webapp/_components/TelegramHeader.tsx`**

### 🔄 Что было изменено:

**До:**
```tsx
<div className="header-action-icon">
  {user?.photo_url ? (
    <img 
      src={user.photo_url} 
      alt="Профиль" 
      className="header-profile-avatar"
    />
  ) : (
    <IconComponent 
      name="profile" 
      size={24}
      aria-hidden="true"
    />
  )}
</div>
```

**После:**
```tsx
<div className="header-action-icon">
  <IconComponent 
    name="profile" 
    size={24}
    aria-hidden="true"
  />
</div>
```

### 🎯 Результат:

- ✅ Всегда отображается иконка **UserRound** из lucide-react
- ✅ Удалена загрузка изображения аватара
- ✅ Единообразный дизайн с другими иконками в хедере
- ✅ Упрощенная логика компонента

### 🔍 Детали реализации:

Компонент `IconComponent` использует иконку `UserRound` из библиотеки lucide-react:

```tsx
// src/components/webapp/IconComponent.tsx
profile: <UserRound size={size} className={className} />,
```

### 📊 Преимущества:

1. **Производительность** - нет загрузки внешних изображений
2. **Консистентность** - все иконки в хедере одинакового стиля
3. **Надежность** - нет зависимости от наличия фото у пользователя
4. **Простота** - меньше условной логики в компоненте

---

**Статус**: ✅ Изменение успешно применено и протестировано 