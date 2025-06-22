# 🐛 Отладка модального окна редактирования товара

## Проблема
Данные товара не загружаются в модальное окно редактирования.

## Исправления
1. ✅ **Добавлена сериализация BigInt** в API endpoints
2. ✅ **Добавлено логирование** для отладки потока данных
3. ✅ **Исправлены типы данных** между компонентами
4. ✅ **Добавлен индикатор загрузки** данных

## Как проверить работу

### 1. Откройте консоль браузера (F12 → Console)

### 2. Нажмите кнопку "Редактировать" у любого товара

### 3. Проверьте логи в консоли:
```javascript
// Должны появиться следующие логи:
handleEditProduct: Starting with product: {...}
handleEditProduct: API response status: 200
handleEditProduct: Full product from API: {...}
handleEditProduct: Product for edit: {...}
EditProductModal: Received product data: {...}
EditProductModal: FormData set to: {...}
```

### 4. Если логи не появляются:
- **Проблема с кнопкой**: Проверьте, что кнопка редактирования подключена к функции
- **Проблема с API**: Проверьте Network tab в DevTools на ошибки 500

### 5. Если логи есть, но поля пустые:
- **Проблема с formData**: Данные не связываются с полями ввода
- **Проблема с типами**: Неправильное преобразование типов данных

## API Endpoints
- `GET /api/products/[id]` - получение товара
- `PUT /api/products/[id]` - обновление товара
- `POST /api/products/[id]/upload-image` - загрузка изображения

## Структура данных
```typescript
interface Product {
  id: number;
  name: string | null;
  description: string | null;
  price: number | null;
  stock_quantity: number;
  brand: string | null;
  // ... другие поля
}
```

## Типичные ошибки
1. **BigInt serialization error** - исправлено добавлением Number() в API
2. **Cannot read properties of null** - исправлено проверками на null
3. **Form fields not updating** - исправлено правильной связкой formData 