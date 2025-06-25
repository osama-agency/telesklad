# Исправление анимации перехода на страницу заказов

## Проблема
При нажатии на кнопку "История заказов" в профиле наблюдались глюки анимации из-за конфликта между preloader'ом в ActionCards и анимацией PageTransition.

## Причина глюков
1. **Двойная анимация**: При клике на "История заказов" срабатывали два эффекта:
   - ActionCards показывал полноэкранный SkeletonLoading (preloader)
   - PageTransition запускал анимацию появления страницы
2. **Конфликт переходов**: Preloader появлялся на 100ms, затем исчезал и начиналась анимация PageTransition
3. **Визуальный глюк**: Пользователь видел "мерцание" - сначала loader, потом анимацию

## Решение

### 1. Упрощение логики навигации в ActionCards
Убрал preloader для карточки заказов, оставив простую навигацию:

```typescript
// Старая версия (с preloader'ом)
const handleNavigation = async (href: string, id: string) => {
  if (id === 'orders') {
    setIsNavigating(true);
    setNavigatingTo(id);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push(href);
    } finally {
      setIsNavigating(false);
      setNavigatingTo('');
    }
  }
};

// Новая версия (без preloader'а)
const handleNavigation = (href: string, id: string) => {
  if (id === 'subscriptions') {
    setIsSubscriptionsModalOpen(true);
    return;
  }
  
  // Для всех остальных карточек делаем простую навигацию
  router.push(href);
};
```

### 2. Улучшение анимации PageTransition
Увеличил смещение для более выраженного эффекта "снизу вверх":

```typescript
// Было
element.style.transform = 'translateY(20px)';

// Стало
element.style.transform = 'translateY(50px)';
```

### 3. Использование кривой анимации как в Sheet
Применил ту же кривую безье, что используется в компоненте Sheet:

```css
transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
            transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

## Результат
- ✅ Убраны глюки при переходе на страницу заказов
- ✅ Плавная анимация "снизу вверх" как в "Товары в ожидании"
- ✅ Единообразный UX без мерцания
- ✅ Сохранен preloader только для подписок (модальное окно)

## Файлы изменены
- `src/app/webapp/_components/ActionCards.tsx` - убран preloader для заказов
- `src/app/webapp/_components/PageTransition.tsx` - улучшена анимация

## Техническое решение
Проблема решена путем устранения конфликта между двумя анимационными системами:
1. **ActionCards**: отвечает только за навигацию
2. **PageTransition**: отвечает только за анимацию появления страницы

Теперь анимация работает точно так же, как в компоненте "Товары в ожидании" - плавно и без глюков.
