# Исправление логики предзаполнения формы доставки

## Проблема

Ранее форма доставки всегда предзаполнялась данными, даже пустыми, что не соответствовало логике старого Rails проекта. Нужно было изменить поведение:

- **Новые пользователи** - пустая форма
- **Существующие пользователи с данными в профиле** - предзаполненная форма

## Что было исправлено

### 1. Обновлена логика загрузки профиля

**Файл:** `src/app/webapp/cart/page.tsx`

**До:**
```typescript
// Всегда предзаполняем данные, даже пустые
setDeliveryData({
  address: data.user.address || '',
  street: data.user.street || '',
  // ... всегда создавался объект
});
```

**После:**
```typescript
// Предзаполняем данные ТОЛЬКО если у пользователя есть данные в профиле
const hasDeliveryData = data.user.address || data.user.street || data.user.home || 
                       data.user.first_name || data.user.phone_number;

if (hasDeliveryData) {
  setDeliveryData({
    address: data.user.address || '',
    street: data.user.street || '',
    // ... создаём объект только если есть данные
  });
}
// Если данных нет - оставляем deliveryData как null (пустая форма)
```

### 2. Изменена очередность загрузки данных

**До:**
```typescript
useEffect(() => {
  loadCart();
  loadUserProfile();
  
  // Загружались данные из localStorage, которые могли перезаписать профиль
  const savedDeliveryData = localStorage.getItem('webapp_delivery_data');
  if (savedDeliveryData) {
    setDeliveryData(JSON.parse(savedDeliveryData));
  }
}, []);
```

**После:**
```typescript
useEffect(() => {
  const initializePage = async () => {
    loadCart();
    await loadUserProfile(); // Сначала загружаем профиль
    
    // Загружаем сохранённые данные ТОЛЬКО если профиль не содержит данных
    const savedDeliveryData = localStorage.getItem('webapp_delivery_data');
    if (savedDeliveryData && !deliveryData) {
      const parsed = JSON.parse(savedDeliveryData);
      // Проверяем, что сохранённые данные не пустые
      const hasData = parsed.address || parsed.street || parsed.home || 
                     parsed.first_name || parsed.phone_number;
      if (hasData) {
        setDeliveryData(parsed);
      }
    }
  };
  
  initializePage();
}, []);
```

### 3. Обновлен компонент DeliveryForm

**Файл:** `src/app/webapp/_components/DeliveryForm.tsx`

**Добавлено:**
- Правильная инициализация полей только из переданных данных
- useEffect для обновления формы при изменении initialData
- Реактивность на изменения данных профиля

```typescript
// Обновляем форму при изменении initialData (когда загружается профиль)
useEffect(() => {
  if (initialData) {
    setFormData({
      address: initialData.address || '',
      // ... обновляем только при наличии данных
    });
  }
}, [initialData]);
```

## Результат

### Для новых пользователей:
1. ✅ **Пустая форма** - все поля пустые
2. ✅ **Нет предзаполнения** из пустого профиля
3. ✅ **Чистый старт** для ввода данных

### Для существующих пользователей:
1. ✅ **Автозаполнение** из базы данных (профиля)
2. ✅ **Сохранение изменений** в localStorage
3. ✅ **Приоритет профиля** над localStorage при первой загрузке

### Логика работы:

1. **Загружается страница корзины**
2. **Запрашивается профиль пользователя** из API
3. **Проверяется наличие данных доставки** в профиле
4. **Если данные есть** - предзаполняется форма
5. **Если данных нет** - форма остается пустой
6. **При изменениях** - данные сохраняются в localStorage

## Приоритет источников данных:

1. **База данных (профиль)** - высший приоритет при первой загрузке
2. **localStorage** - только если в профиле нет данных
3. **Пустая форма** - если нигде нет данных

## Тестирование

### Сценарий 1: Новый пользователь
1. Открыть корзину в инкогнито режиме
2. Проверить что форма пустая
3. ✅ Все поля должны быть пустыми

### Сценарий 2: Существующий пользователь
1. Открыть корзину с тестовым пользователем
2. Проверить предзаполнение из профиля
3. ✅ Поля должны быть заполнены данными из базы

### Сценарий 3: Пользователь с сохранёнными данными
1. Ввести данные в форму
2. Перезагрузить страницу
3. ✅ Данные должны сохраниться из localStorage

## Файлы изменены

- ✅ `src/app/webapp/cart/page.tsx` - логика загрузки и приоритетов
- ✅ `src/app/webapp/_components/DeliveryForm.tsx` - реактивность формы 