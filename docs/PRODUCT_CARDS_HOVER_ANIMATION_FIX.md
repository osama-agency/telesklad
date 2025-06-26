# Исправление hover анимации карточек товаров

## Проблема
При наведении на карточки товаров в каталоге происходило слишком сильное увеличение и поднятие карточек, что создавало чрезмерно драматичный эффект.

## Анализ
Было обнаружено два типа hover эффектов для карточек товаров:

1. **Основные карточки (.product-wrapper)** - с glassmorphism эффектами
2. **3D карточки (.product-card-3d)** - с 3D трансформациями

## Исправления

### 1. Основные карточки (.product-wrapper)

**До:**
```scss
&:hover {
  transform: translateY(-8px) scale(1.02);
}

&.out-of-stock:hover {
  transform: translateY(-3px) scale(1.01);
}
```

**После:**
```scss
&:hover {
  transform: translateY(-2px) scale(1.005);
}

&.out-of-stock:hover {
  transform: translateY(-1px) scale(1.002);
}
```

### 2. 3D карточки (.product-card-3d)

**До:**
```scss
&:hover {
  transform: 
    translateY(-12px) 
    rotateX(8deg) 
    rotateY(4deg) 
    scale(1.02);
}

&:active {
  transform: 
    translateY(-8px) 
    rotateX(4deg) 
    rotateY(2deg) 
    scale(0.98);
}
```

**После:**
```scss
&:hover {
  transform: 
    translateY(-2px) 
    rotateX(1deg) 
    rotateY(0.5deg) 
    scale(1.005);
}

&:active {
  transform: 
    translateY(-1px) 
    rotateX(0.5deg) 
    rotateY(0.2deg) 
    scale(0.995);
}
```

### 3. Внутренние элементы 3D карточек

**До:**
```scss
&:hover .product-img {
  transform: translateZ(20px) scale(1.05);
  img {
    transform: scale(1.1) rotateZ(1deg);
    filter: saturate(1.2) brightness(1.1);
  }
}

&:hover .product-title {
  transform: translateZ(10px);
}

&:hover .price-block {
  transform: translateZ(15px);
}

&:hover .webapp-btn {
  transform: translateZ(25px) scale(1.05);
}
```

**После:**
```scss
&:hover .product-img {
  transform: translateZ(5px) scale(1.01);
  img {
    transform: scale(1.02) rotateZ(0.2deg);
    filter: saturate(1.05) brightness(1.02);
  }
}

&:hover .product-title {
  transform: translateZ(2px);
}

&:hover .price-block {
  transform: translateZ(3px);
}

&:hover .webapp-btn {
  transform: translateZ(4px) scale(1.01);
}
```

### 4. Мобильная версия

**До:**
```scss
@media (max-width: 768px) {
  .product-card-3d {
    &:hover {
      transform: translateY(-6px) scale(1.02);
    }
    &:active {
      transform: translateY(-2px) scale(0.98);
    }
  }
}
```

**После:**
```scss
@media (max-width: 768px) {
  .product-card-3d {
    &:hover {
      transform: translateY(-1px) scale(1.005);
    }
    &:active {
      transform: translateY(-0.5px) scale(0.995);
    }
  }
}
```

## Результат

### ✅ Достигнутые улучшения:
- **Тонкий hover эффект**: Карточки теперь слегка приподнимаются вместо драматичного "взлета"
- **Минимальное масштабирование**: Увеличение с 2-5% до 0.5-1%
- **Сглаженные 3D эффекты**: Углы поворота уменьшены с 8° до 1°
- **Сохранена интерактивность**: Эффект все еще заметен, но не отвлекает
- **Мобильная оптимизация**: Еще более тонкие эффекты на мобильных устройствах

### 🎯 Принципы изменений:
1. **Сохранение UX**: Hover эффект остался, но стал более элегантным
2. **Градация интенсивности**: Обычные карточки < товары не в наличии < 3D карточки
3. **Мобильная адаптация**: Минимальные эффекты для touch устройств
4. **Производительность**: Уменьшенные значения требуют меньше GPU ресурсов

## Файлы изменены
- `src/styles/webapp.scss` - основные стили карточек товаров

## Совместимость
- ✅ Все браузеры поддерживают CSS transforms
- ✅ Сохранена поддержка prefers-reduced-motion
- ✅ Оптимизировано для touch устройств
- ✅ Обратная совместимость с существующими компонентами

---

*Теперь hover эффекты карточек товаров стали более изящными и менее навязчивыми, сохраняя при этом современный интерактивный дизайн.* 