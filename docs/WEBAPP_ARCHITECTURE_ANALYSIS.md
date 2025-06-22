# 📊 Анализ старого Ruby on Rails webapp и архитектура нового Next.js webapp

## 🔍 Анализ существующего Ruby on Rails webapp

### **Основная функциональность:**
1. **Каталог товаров** - отображение товаров с фильтрацией по категориям
2. **Корзина покупок** - добавление/удаление товаров, изменение количества
3. **Система заказов** - оформление заказов с доставкой и бонусами
4. **Отзывы** - система отзывов с рейтингами и фотографиями
5. **Избранное** - сохранение понравившихся товаров
6. **Профиль пользователя** - управление данными и заказами
7. **Telegram Web App** интеграция - полная интеграция с Telegram ботом

### **Архитектура Rails webapp:**
```
app/
├── controllers/          # API и веб контроллеры
│   ├── products_controller.rb
│   ├── cart_items_controller.rb
│   ├── orders_controller.rb
│   ├── auth_controller.rb
│   └── api/v1/
├── models/              # ActiveRecord модели
│   ├── product.rb
│   ├── cart.rb
│   ├── cart_item.rb
│   ├── order.rb
│   └── user.rb
├── views/               # ERB/Slim шаблоны
│   ├── products/
│   ├── carts/
│   └── layouts/
└── frontend/            # React компоненты
    ├── components/
    │   ├── Cart.tsx
    │   ├── CartItem.tsx
    │   └── CartSummary.tsx
    └── entrypoints/
```

### **Ключевые особенности:**
- **Turbo/Stimulus** для интерактивности
- **React компоненты** для корзины
- **Telegram Web App API** интеграция
- **Responsive дизайн** с Tailwind CSS
- **Real-time обновления** через Turbo Streams
- **Поддержка двух брендов** (основной и Mirena)

## 🚀 Архитектура нового Next.js webapp

### **Структура проекта:**
```
webapp/
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── (auth)/            # Группа маршрутов авторизации
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (shop)/            # Группа маршрутов магазина
│   │   │   ├── products/
│   │   │   │   ├── page.tsx           # Каталог товаров
│   │   │   │   ├── [id]/page.tsx      # Страница товара
│   │   │   │   └── loading.tsx
│   │   │   ├── cart/
│   │   │   │   └── page.tsx           # Корзина
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx           # Список заказов
│   │   │   │   └── [id]/page.tsx      # Детали заказа
│   │   │   ├── favorites/
│   │   │   │   └── page.tsx           # Избранное
│   │   │   └── profile/
│   │   │       └── page.tsx           # Профиль
│   │   ├── api/                # API Routes
│   │   │   ├── auth/
│   │   │   │   └── telegram/route.ts
│   │   │   ├── products/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── cart/
│   │   │   │   ├── route.ts
│   │   │   │   └── items/route.ts
│   │   │   ├── orders/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   └── reviews/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Главная страница
│   ├── components/                # React компоненты
│   │   ├── ui/                   # Базовые UI компоненты
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Card.tsx
│   │   ├── shop/                 # Компоненты магазина
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── CategoryFilter.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── ProductDetails.tsx
│   │   ├── cart/                 # Компоненты корзины
│   │   │   ├── CartButton.tsx
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   └── CartDrawer.tsx
│   │   ├── orders/               # Компоненты заказов
│   │   │   ├── OrderCard.tsx
│   │   │   ├── OrderForm.tsx
│   │   │   └── OrderStatus.tsx
│   │   ├── reviews/              # Компоненты отзывов
│   │   │   ├── ReviewCard.tsx
│   │   │   ├── ReviewForm.tsx
│   │   │   └── StarRating.tsx
│   │   ├── layout/               # Компоненты лейаута
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── MobileMenu.tsx
│   │   └── telegram/             # Telegram специфичные компоненты
│   │       ├── WebAppProvider.tsx
│   │       ├── MainButton.tsx
│   │       └── BackButton.tsx
│   ├── lib/                      # Утилиты и конфигурация
│   │   ├── auth.ts              # Аутентификация
│   │   ├── api.ts               # API клиент
│   │   ├── telegram.ts          # Telegram Web App утилиты
│   │   ├── prisma.ts            # Prisma клиент
│   │   ├── utils.ts             # Общие утилиты
│   │   └── validations.ts       # Схемы валидации
│   ├── hooks/                    # Custom React hooks
│   │   ├── useCart.ts
│   │   ├── useTelegram.ts
│   │   ├── useProducts.ts
│   │   └── useAuth.ts
│   ├── store/                    # State management (Zustand)
│   │   ├── cartStore.ts
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── types/                    # TypeScript типы
│   │   ├── product.ts
│   │   ├── cart.ts
│   │   ├── order.ts
│   │   └── telegram.ts
│   └── styles/                   # Стили
│       ├── globals.css
│       └── components.css
├── public/                       # Статические файлы
│   ├── icons/
│   ├── images/
│   └── manifest.json
├── package.json
├── tailwind.config.js
├── next.config.js
└── tsconfig.json
```

## 🛠 Технологический стек

### **Frontend:**
- **Next.js 15** (App Router)
- **React 18** с Server Components
- **TypeScript** для типобезопасности
- **Tailwind CSS** для стилизации
- **Framer Motion** для анимаций
- **React Hook Form** для форм
- **Zod** для валидации
- **Zustand** для state management

### **Backend/API:**
- **Next.js API Routes** для серверной логики
- **Prisma ORM** (уже настроен)
- **NextAuth.js** для аутентификации
- **React Query/TanStack Query** для кеширования

### **Telegram Integration:**
- **@telegram-apps/sdk-react** для Telegram Web App
- **Telegram Bot API** для уведомлений
- **WebApp API** для нативных функций

## 📱 Ключевые страницы и функции

### **1. Каталог товаров (`/products`)**
```typescript
// src/app/(shop)/products/page.tsx
export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-main">
      <Header />
      <CategoryFilter />
      <SearchBar />
      <ProductGrid />
      <CartDrawer />
    </div>
  );
}
```

### **2. Страница товара (`/products/[id]`)**
```typescript
// src/app/(shop)/products/[id]/page.tsx
export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-main">
      <ProductDetails productId={params.id} />
      <ReviewsSection productId={params.id} />
      <RelatedProducts />
    </div>
  );
}
```

### **3. Корзина (`/cart`)**
```typescript
// src/app/(shop)/cart/page.tsx
export default function CartPage() {
  return (
    <div className="min-h-screen bg-main">
      <CartHeader />
      <CartItems />
      <CartSummary />
      <CheckoutForm />
    </div>
  );
}
```

## 🔄 State Management

### **Корзина (Zustand Store):**
```typescript
// src/store/cartStore.ts
interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}
```

### **Telegram интеграция:**
```typescript
// src/hooks/useTelegram.ts
export function useTelegram() {
  const [webApp, setWebApp] = useState<WebApp | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      setWebApp(tg);
    }
  }, []);

  return {
    webApp,
    user: webApp?.initDataUnsafe?.user,
    sendData: (data: any) => webApp?.sendData(JSON.stringify(data)),
    close: () => webApp?.close(),
    expand: () => webApp?.expand(),
  };
}
```

## 🎨 UI/UX Особенности

### **Адаптивный дизайн:**
- **Mobile-first** подход
- **Telegram Web App** оптимизация
- **Dark/Light** тема поддержка
- **Touch-friendly** интерфейс

### **Анимации:**
- **Smooth transitions** между страницами
- **Loading states** для всех операций
- **Micro-interactions** для кнопок и форм
- **Pull-to-refresh** функциональность

### **Telegram нативные функции:**
- **HapticFeedback** для тактильных ощущений
- **MainButton/BackButton** интеграция
- **Theme colors** синхронизация
- **CloudStorage** для настроек

## 🔐 Аутентификация и безопасность

### **Telegram Auth:**
```typescript
// src/lib/auth.ts
export async function validateTelegramAuth(initData: string) {
  // Валидация Telegram Web App данных
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  // Проверка подписи через bot token
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
    
  return verifySignature(dataCheckString, hash);
}
```

## 📊 API интеграция

### **Использование существующих API:**
```typescript
// src/lib/api.ts
class ApiClient {
  async getProducts(filters?: ProductFilters) {
    return fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }
  
  async addToCart(productId: number, quantity: number) {
    return fetch('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }
  
  async createOrder(orderData: CreateOrderData) {
    return fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
}
```

## 🚀 План реализации

### **Фаза 1: Базовая структура (1-2 недели)**
1. Настройка Next.js проекта
2. Конфигурация Tailwind CSS
3. Создание базовых компонентов UI
4. Настройка Telegram Web App интеграции

### **Фаза 2: Каталог товаров (1 неделя)**
1. Страница каталога с фильтрацией
2. Карточки товаров
3. Поиск и категории
4. Страница товара с отзывами

### **Фаза 3: Корзина и заказы (1 неделя)**
1. Функциональность корзины
2. Оформление заказов
3. История заказов
4. Статусы заказов

### **Фаза 4: Дополнительные функции (1 неделя)**
1. Избранное
2. Профиль пользователя
3. Система отзывов
4. Уведомления

### **Фаза 5: Оптимизация и тестирование (1 неделя)**
1. Performance оптимизация
2. SEO настройки
3. Тестирование на разных устройствах
4. Telegram bot интеграция

## 🔧 Конфигурация и деплой

### **Environment Variables:**
```env
# Database
DATABASE_URL="postgresql://..."

# Telegram
TELEGRAM_BOT_TOKEN="your_bot_token"
TELEGRAM_WEBHOOK_SECRET="your_webhook_secret"

# NextAuth
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="https://your-domain.com"

# API
API_BASE_URL="https://your-api.com"
```

### **Деплой:**
- **Vercel** для фронтенда
- **Railway/PlanetScale** для базы данных
- **Cloudflare R2** для файлов
- **Telegram Bot API** для уведомлений

## 📈 Преимущества нового webapp

1. **Лучшая производительность** - Server Components и оптимизация
2. **Современный стек** - TypeScript, React 18, Next.js 15
3. **Лучший DX** - Hot reload, TypeScript, ESLint
4. **SEO дружелюбность** - Server-side rendering
5. **Масштабируемость** - Модульная архитектура
6. **Telegram нативность** - Полная интеграция с Web App API

Этот webapp станет современной заменой Rails версии с сохранением всей функциональности и улучшенным пользовательским опытом. 