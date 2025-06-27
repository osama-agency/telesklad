# Telegram UI Integration - Зелёная тема

## 🟢 Переход на официальную Telegram UI

Проект NEXTADMIN теперь использует официальную библиотеку компонентов `@telegram-apps/telegram-ui` вместо самодельной дизайн-системы. Это обеспечивает:

- ✅ **Нативный Telegram дизайн** - компоненты выглядят как в самом Telegram
- ✅ **Автоматическое переключение тем** - поддержка iOS/Material стилей
- ✅ **Кросс-платформенность** - работает на Web, iOS, Android
- ✅ **Официальная поддержка** - регулярные обновления от команды Telegram
- ✅ **Зелёная кастомизация** - настроена под фирменный зелёный цвет (#22c55e)

## 📦 Установка

```bash
npm install @telegram-apps/telegram-ui --legacy-peer-deps
```

> Используем `--legacy-peer-deps` из-за конфликта версий React 19 и требований библиотеки React 18.

## 🎨 Настройка зелёной темы

### Файл стилей: `src/app/tgapp/styles/telegram-ui-theme.css`

```css
/* Telegram UI - Custom Green Theme */
@import '@telegram-apps/telegram-ui/dist/styles.css';

/* Custom Green Theme Variables */
:root {
  /* Primary Green Colors */
  --tgui-color-primary: #22c55e;
  --tgui-color-primary-hover: #16a34a;
  --tgui-color-primary-active: #15803d;
  
  /* Button Colors */
  --tgui-color-button: #22c55e;
  --tgui-color-button-hover: #16a34a;
  --tgui-color-button-active: #15803d;
  
  /* Link Colors */
  --tgui-color-link: #22c55e;
  --tgui-color-link-hover: #16a34a;
}

/* Dark Theme Overrides */
.tgui-dark {
  --tgui-color-primary: #22c55e;
  --tgui-color-primary-hover: #34d399;
  --tgui-color-button: #22c55e;
  --tgui-color-link: #22c55e;
}
```

### Интеграция в layout

```tsx
// src/app/tgapp/layout.tsx
import "./styles/telegram-ui-theme.css";

// Добавляем классы темы
className={`... ${isDark ? 'tg-dark dark tgui-dark' : 'tg-light tgui-light'}`}
```

## 🧩 Основные компоненты

### AppRoot - Корневой компонент

```tsx
import { AppRoot } from '@telegram-apps/telegram-ui';

<AppRoot 
  appearance={isDark ? 'dark' : 'light'}
  platform="base"
  className="min-h-screen"
>
  {/* Ваше приложение */}
</AppRoot>
```

### Кнопки

```tsx
import { Button } from '@telegram-apps/telegram-ui';

<Button mode="filled" size="m">Primary Button</Button>
<Button mode="outline" size="m">Outlined Button</Button>
<Button mode="plain" size="m">Plain Button</Button>
<Button mode="filled" size="m" disabled>Disabled</Button>
<Button mode="filled" size="m" loading>Loading</Button>
```

**Режимы:**
- `filled` - основная кнопка (зелёная)
- `outline` - обводка
- `plain` - без фона
- `bezeled` - с рамкой
- `gray` - серая
- `white` - белая

**Размеры:** `s`, `m`, `l`

### Карточки

```tsx
import { Card } from '@telegram-apps/telegram-ui';

<Card className="p-4">
  <Title level="3">Заголовок карточки</Title>
  <Text>Содержимое карточки</Text>
</Card>
```

### Аватары

```tsx
import { Avatar } from '@telegram-apps/telegram-ui';

<Avatar size={40} acronym="ЭГ" />
<Avatar size={48} src="https://example.com/photo.jpg" />
```

**Размеры:** `20`, `24`, `28`, `40`, `48`, `96`

### Типографика

```tsx
import { Title, Text, Subheadline, Caption } from '@telegram-apps/telegram-ui';

<Title level="1">Заголовок H1</Title>
<Title level="2">Заголовок H2</Title>
<Title level="3">Заголовок H3</Title>
<Subheadline>Подзаголовок</Subheadline>
<Text>Основной текст</Text>
<Caption>Подпись</Caption>
```

### Интерактивные элементы

```tsx
import { Switch, Progress, Badge } from '@telegram-apps/telegram-ui';

{/* Переключатель */}
<Switch 
  checked={value} 
  onChange={(e) => setValue(e.target.checked)}
/>

{/* Прогресс */}
<Progress value={65} />

{/* Значки */}
<Badge type="number" className="bg-green-500">5</Badge>
<Badge type="dot" className="bg-green-500" />
```

### Списки

```tsx
import { List, Cell, Section } from '@telegram-apps/telegram-ui';

<Section>
  <Cell>
    <Title level="2">Заголовок секции</Title>
  </Cell>
  <List>
    <Cell 
      before={<Avatar size={40} acronym="AB" />}
      subtitle="Дополнительная информация"
      after={<Badge type="number">NEW</Badge>}
    >
      Основной текст
    </Cell>
  </List>
</Section>
```

### Состояния загрузки

```tsx
import { Skeleton, Placeholder } from '@telegram-apps/telegram-ui';

{/* Скелетон */}
<Skeleton visible className="h-4 w-full" />

{/* Пустое состояние */}
<Placeholder
  header="Пустое состояние"
  description="Здесь пока ничего нет"
>
  <Button mode="filled" size="m">
    Добавить контент
  </Button>
</Placeholder>
```

## 🎯 Демо-страница

Интерактивная демонстрация всех компонентов доступна по адресу:
```
/tgapp/telegram-ui-demo
```

Включает:
- Все варианты кнопок в зелёном стиле
- Карточки товаров и пользователей
- Аватары разных размеров
- Интерактивные элементы (Switch, Progress)
- Состояния загрузки
- Типографику
- Списки с различными элементами

## 🔄 Автоматическое переключение тем

Telegram UI автоматически адаптируется к теме Telegram WebApp:

```tsx
import { useTelegramTheme } from '../_components/useTelegramTheme';

const { isDark } = useTelegramTheme();

<AppRoot 
  appearance={isDark ? 'dark' : 'light'}
  platform="base"
>
  {/* Компоненты автоматически меняют тему */}
</AppRoot>
```

## 🎨 Кастомизация

### CSS переменные

Все компоненты можно кастомизировать через CSS переменные:

```css
:root {
  --tgui-color-primary: #ваш-цвет;
  --tgui-color-button: #ваш-цвет;
  --tgui-color-link: #ваш-цвет;
}
```

### Дополнительные стили

```css
/* Кастомные стили для конкретных компонентов */
.tgui-button--filled {
  border-radius: 12px; /* Скругление углов */
}

.tgui-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* Тень */
}
```

## 📱 Интеграция с существующими страницами

### Пример обновления страницы профиля

```tsx
// Было (наша дизайн-система)
import { Button, Card } from './design-system/components';

// Стало (Telegram UI)
import { Button, Card, Title, Text } from '@telegram-apps/telegram-ui';

<Card className="p-4">
  <Title level="2">Профиль пользователя</Title>
  <Text>Информация о пользователе</Text>
  <Button mode="filled" size="m">
    Редактировать
  </Button>
</Card>
```

## 🚀 Преимущества

### До (самодельная дизайн-система)
- ❌ Требовала постоянной поддержки
- ❌ Могла не соответствовать Telegram стандартам
- ❌ Ручное переключение тем
- ❌ Ограниченный набор компонентов

### После (Telegram UI)
- ✅ Официальная поддержка Telegram
- ✅ Автоматическое соответствие стандартам
- ✅ Автоматическое переключение тем
- ✅ Полный набор компонентов
- ✅ Регулярные обновления
- ✅ Кросс-платформенность
- ✅ Зелёная кастомизация сохранена

## 🔧 Миграция

1. ✅ Установлена `@telegram-apps/telegram-ui`
2. ✅ Создана зелёная тема в `telegram-ui-theme.css`
3. ✅ Обновлён layout с поддержкой Telegram UI
4. ✅ Создана демо-страница с примерами
5. ✅ Удалена старая дизайн-система
6. ✅ Обновлена документация

## 📚 Дополнительные ресурсы

- [Официальная документация](https://github.com/Telegram-Web-Apps/telegram-ui)
- [Storybook с примерами](https://telegram-web-apps.github.io/telegram-ui/)
- [Figma ресурсы](https://www.figma.com/community/file/1321532857297620158)

---

*Telegram UI обеспечивает профессиональный внешний вид, соответствующий стандартам Telegram, с сохранением фирменного зелёного стиля NEXTADMIN.* 