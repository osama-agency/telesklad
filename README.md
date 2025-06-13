# 🚀 Sneat Admin Dashboard - Aviasales 2025 Edition

[![Next.js](https://img.shields.io/badge/Next.js-15.1.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/MUI-6.0+-blue?style=flat-square&logo=mui)](https://mui.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0+-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

Современный admin dashboard с премиум таблицей заказов в стиле **Aviasales 2025**, построенный на базе Sneat UI Kit.

## ✨ Особенности

### 🎯 **Aviasales 2025 Orders Table**
- **Premium дизайн** с профессиональной типографикой и цветовой схемой
- **Sticky фильтр-бар** с цветными индикаторами статусов
- **Правильный порядок колонок**: № → Дата → Клиент → Товары → Статус → Сумма → Действие
- **Зебра-полосы** для улучшения читаемости
- **Визуальный ритм**: min-height 56px, line-height 1.5
- **Skeleton loading** состояние
- **Responsive дизайн** mobile-first

### 📱 **Bottom Sheet - Order Details**
- **SwipeableDrawer** с высотой 70vh
- **Swipe handle** для удобного управления
- **Детальная информация** о заказе с skeleton loading
- **Раскрывающийся список товаров**
- **Премиум кнопки** с микроанимациями
- **Полная информация о клиенте**

### ⚙️ **Column Settings Popover**
- **Настройки видимости колонок** с сохранением в localStorage
- **Премиум Popover** с checkboxes
- **Обязательные колонки** нельзя скрыть
- **Мгновенное применение** изменений

### 🎨 **Цветовая система статусов**
- **Семантические цвета**: зеленый/красный/оранжевый/синий/желтый
- **Цветные индикаторы** в фильтрах
- **Hover/selected состояния** с полным цветным фоном
- **Accessibility** с правильными контрастами

## 🛠 Технический стек

- **Frontend**: Next.js 15.1.2 с App Router
- **Language**: TypeScript
- **UI Framework**: Material-UI v6
- **Styling**: TailwindCSS + Emotion
- **State Management**: Zustand
- **Authentication**: NextAuth.js
- **Development**: Turbopack

## 🚀 Быстрый старт

1. **Установка зависимостей**
```bash
npm install
```

2. **Запуск в development режиме**
```bash
npm run dev
```

3. **Открыть браузер**
```
http://localhost:3000
```

4. **Логин (demo)**
```
Email: admin@admin.com
Password: admin
```

## 📁 Структура проекта

```
src/
├── app/                          # Next.js App Router
│   ├── [lang]/
│   │   └── (dashboard)/
│   │       └── (private)/
│   │           └── orders/       # 📋 Страница заказов
├── components/
│   └── orders/                   # 🔧 Order компоненты
│       ├── OrderDetailsDrawer.tsx
│       └── ColumnSettingsPopover.tsx
├── views/
│   └── orders/
│       └── OrdersTableNew.tsx    # 🏆 Aviasales 2025 Table
├── store/
│   └── ordersFilterStore.ts      # 📊 Zustand store для фильтров
└── styles/
    └── globals.css               # 🎨 Global styles
```

## 🎯 Ключевые компоненты

### `OrdersTableNew.tsx`
Главный компонент таблицы заказов с полной реализацией стандартов Aviasales 2025:
- Sticky header с сортировкой
- Фильтр-бар с цветными статусами
- Премиум пагинация
- Skeleton loading states

### `OrderDetailsDrawer.tsx`
Bottom sheet с деталями заказа:
- SwipeableDrawer Material-UI
- Информация о заказе, клиенте, товарах
- Skeleton loading с имитацией API
- Кнопки редактирования и закрытия

### `ColumnSettingsPopover.tsx`
Popover для настройки видимости колонок:
- Checkboxes для всех колонок
- localStorage для сохранения настроек
- Обязательные колонки защищены от скрытия

## 🎨 Design System

### Цвета статусов
```css
/* Отправлен */
.status-shipped { @apply bg-success/15 border-success/50 text-success; }

/* Отменен */
.status-cancelled { @apply bg-error/15 border-error/50 text-error; }

/* Просрочен */
.status-overdue { @apply bg-warning/15 border-warning/50 text-warning; }

/* Обрабатывается */
.status-processing { @apply bg-info/15 border-info/50 text-info; }

/* Не оплачен */
.status-unpaid { @apply bg-yellow-400/15 border-yellow-400/50 text-yellow-400; }
```

### Responsive Breakpoints
```css
/* Mobile-first подход */
xs: 0px      /* Mobile */
sm: 600px    /* Tablet */
md: 900px    /* Small Desktop */
lg: 1200px   /* Desktop */
xl: 1536px   /* Large Desktop */
```

## 📱 Mobile Support

- **Mobile-first** дизайн
- **SwipeableDrawer** для деталей заказов
- **Compact фильтр-бар** на мобильных экранах
- **Touch-friendly** кнопки и элементы управления

## 🔧 Конфигурация

### Environment Variables
```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### TailwindCSS
Настроен с:
- Sneat цветовой палитрой
- Custom компонентами
- Responsive утилитами
- Dark theme поддержкой

## 📈 Performance

- **Next.js 15** с Turbopack для быстрой разработки
- **Code splitting** автоматически
- **Optimized images** с next/image
- **Lazy loading** компонентов

## 🎯 Roadmap

- [ ] **API интеграция** вместо mock данных
- [ ] **Real-time updates** с WebSocket
- [ ] **Export функциональность** (PDF, Excel)
- [ ] **Advanced фильтры** (диапазон дат, сумм)
- [ ] **Drag & Drop** для изменения порядка колонок
- [ ] **Bulk actions** для множественных операций

## 🤝 Contributing

1. Fork проект
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 License

Проект лицензирован под MIT License.

## 👨‍💻 Author

Создано с ❤️ для демонстрации современных подходов к разработке admin dashboard в стиле премиум продуктов.

---

**⭐ Поставьте звезду, если проект был полезен!**
# Test auto-deploy Fri Jun 13 23:12:48 +03 2025
