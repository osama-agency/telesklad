# TgApp Scrollbar Debug Guide

## 🔍 Отладочный скрипт для поиска элементов со скроллбарами

Если скроллбар все еще виден, выполните этот скрипт в консоли браузера Telegram WebApp:

```javascript
// Найти все элементы с overflow
const findScrollableElements = () => {
  const elements = document.querySelectorAll('*');
  const scrollable = [];
  
  elements.forEach(el => {
    const style = window.getComputedStyle(el);
    const hasVerticalScroll = el.scrollHeight > el.clientHeight;
    const hasHorizontalScroll = el.scrollWidth > el.clientWidth;
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;
    
    if ((hasVerticalScroll || hasHorizontalScroll) && 
        (overflowY === 'auto' || overflowY === 'scroll' || 
         overflowX === 'auto' || overflowX === 'scroll')) {
      scrollable.push({
        element: el,
        tag: el.tagName,
        class: el.className,
        id: el.id,
        overflowY,
        overflowX,
        hasVerticalScroll,
        hasHorizontalScroll
      });
    }
  });
  
  return scrollable;
};

// Запустить поиск
const scrollableElements = findScrollableElements();
console.log('Найдено элементов со скроллом:', scrollableElements.length);
scrollableElements.forEach((item, index) => {
  console.log(`${index + 1}.`, item);
  // Подсветить элемент красной рамкой
  item.element.style.border = '3px solid red';
});

// Принудительно скрыть скроллбары для всех элементов
const hideAllScrollbars = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    * {
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }
    *::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
  `;
  document.head.appendChild(style);
  console.log('✅ Скроллбары принудительно скрыты');
};

// Выполнить скрытие
hideAllScrollbars();
```

## 🛠 Дополнительные проверки

### 1. Проверить Telegram WebApp контейнер
```javascript
// Проверить специфические Telegram элементы
const tgElements = document.querySelectorAll('[class*="telegram"], [id*="telegram"], .tg-theme-container');
tgElements.forEach(el => {
  console.log('Telegram элемент:', el);
  const style = window.getComputedStyle(el);
  console.log('Overflow Y:', style.overflowY);
  console.log('Scrollbar width:', style.scrollbarWidth);
});
```

### 2. Проверить iframe (если есть)
```javascript
// Telegram WebApp может использовать iframe
const iframes = document.querySelectorAll('iframe');
iframes.forEach((iframe, i) => {
  console.log(`iframe ${i}:`, iframe);
  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const iframeScrollable = iframeDoc.querySelectorAll('*');
    console.log(`Элементов в iframe ${i}:`, iframeScrollable.length);
  } catch (e) {
    console.log(`Нет доступа к iframe ${i}`);
  }
});
```

### 3. Найти родительские контейнеры
```javascript
// Найти все родительские элементы от body до нашего приложения
let element = document.querySelector('.tg-theme-container');
const parents = [];
while (element && element !== document.body) {
  element = element.parentElement;
  if (element) {
    const style = window.getComputedStyle(element);
    parents.push({
      tag: element.tagName,
      class: element.className,
      id: element.id,
      overflow: style.overflow,
      overflowY: style.overflowY
    });
  }
}
console.log('Родительские элементы:', parents);
```

## 🎯 Решения для конкретных случаев

### Если скроллбар от Telegram WebView контейнера:
```css
/* Добавить в globals.css */
html, body, #__next {
  position: fixed !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
}

.tg-theme-container {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.tg-theme-container::-webkit-scrollbar {
  display: none !important;
}
```

### Если проблема в конкретном браузере:
```javascript
// Определить браузер и платформу
const detectBrowser = () => {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  console.log('User Agent:', ua);
  console.log('Platform:', platform);
  
  if (ua.includes('TelegramWebview')) {
    console.log('Это Telegram WebView');
  }
  if (ua.includes('iPhone') || ua.includes('iPad')) {
    console.log('iOS устройство');
  }
  if (ua.includes('Android')) {
    console.log('Android устройство');
  }
};
detectBrowser();
```

## 📱 Специфика для Telegram WebApp

Telegram WebApp может добавлять свои стили и контейнеры. Проверьте:

1. **Viewport meta tag**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

2. **Telegram CSS переменные**
```javascript
// Проверить Telegram тему
console.log('Telegram theme params:', window.Telegram?.WebApp?.themeParams);
console.log('Viewport height:', window.Telegram?.WebApp?.viewportHeight);
console.log('Viewport stable height:', window.Telegram?.WebApp?.viewportStableHeight);
```

3. **Использовать Telegram методы**
```javascript
// Попробовать методы Telegram для управления viewport
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.expand();
  window.Telegram.WebApp.disableVerticalSwipes();
}
```

---

Выполните эти скрипты в консоли разработчика в Telegram WebApp и отправьте результаты для дальнейшей диагностики. 