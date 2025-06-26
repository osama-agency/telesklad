'use client';

import { useEffect } from 'react';

export function TelegramOutlineRemover() {
  useEffect(() => {
    // Принудительно удаляем outline со всех элементов
    const removeOutlineFromElement = (element: Element) => {
      if (element instanceof HTMLElement) {
        element.style.outline = 'none';
        element.style.border = 'none';
        element.style.boxShadow = 'none';
        (element.style as any).webkitTapHighlightColor = 'transparent';
        (element.style as any).webkitFocusRingColor = 'transparent';
        (element.style as any).webkitAppearance = 'none';
        (element.style as any).mozAppearance = 'none';
        element.style.appearance = 'none';
      }
    };
    
    // Специальная обработка для Telegram WebApp элементов
    const processTelegramElements = () => {
      // Обрабатываем все возможные Telegram элементы
      const telegramSelectors = [
        '.tg-main-button',
        '[class*="telegram"]',
        '[class*="tg-"]',
        '.telegram-cart-button',
        '.telegram-checkout-button',
        '.webapp-header *',
        '.header-action-button',
        '.header-action-icon',
        'button',
        'input',
        'a'
      ];
      
      telegramSelectors.forEach(selector => {
        try {
          document.querySelectorAll(selector).forEach(element => {
            removeOutlineFromElement(element);
            // Дополнительно убираем outline через setAttribute
            if (element instanceof HTMLElement) {
              element.setAttribute('style', 
                (element.getAttribute('style') || '') + 
                '; outline: none !important; border: none !important; box-shadow: none !important;'
              );
            }
          });
        } catch (e) {
          // Игнорируем ошибки селекторов
        }
      });
    };
    
    // Функция для удаления всех outline стилей
    const removeAllOutlines = () => {
      // Создаем CSS правила для принудительного отключения outline
      const style = document.createElement('style');
      style.textContent = `
        /* СУПЕР АГРЕССИВНОЕ УДАЛЕНИЕ OUTLINE */
        *, *::before, *::after {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-focus-ring-color: transparent !important;
        }
        
        /* Специально для Telegram элементов */
        button, input, a, svg, img, div, span {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        
        /* Header элементы */
        .webapp-header *, 
        .header-action-button,
        .header-action-button *,
        .header-action-icon,
        .header-action-icon * {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        
        /* Telegram Main Button - супер агрессивно */
        .tg-main-button,
        .tg-main-button:focus,
        .tg-main-button:focus-visible,
        .tg-main-button:active,
        .tg-main-button:hover,
        [class*="telegram"],
        [class*="telegram"]:focus,
        [class*="telegram"]:focus-visible,
        [class*="telegram"]:active,
        [class*="telegram"]:hover,
        [class*="tg-"],
        [class*="tg-"]:focus,
        [class*="tg-"]:focus-visible,
        [class*="tg-"]:active,
        [class*="tg-"]:hover,
        .telegram-cart-button,
        .telegram-checkout-button {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-focus-ring-color: transparent !important;
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
        }
        
        /* Поиск */
        .search-input,
        .algolia-search-box,
        .algolia-search-box * {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }
      `;
      
      // Добавляем стиль в head с высоким приоритетом
      style.setAttribute('data-telegram-outline-remover', 'true');
      document.head.appendChild(style);
      
      // Удаляем outline со всех существующих элементов
      document.querySelectorAll('*').forEach(removeOutlineFromElement);
      
      // Специальная обработка Telegram элементов
      processTelegramElements();
      
              // Наблюдаем за новыми элементами
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                removeOutlineFromElement(element);
                // Обрабатываем дочерние элементы
                element.querySelectorAll('*').forEach(removeOutlineFromElement);
              }
            });
          });
          
          // Дополнительно обрабатываем Telegram элементы после изменений
          setTimeout(processTelegramElements, 100);
        });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      return observer;
    };
    
    // Удаляем outline сразу
    const observer = removeAllOutlines();
    
    // Повторяем через небольшие интервалы для перехвата Telegram стилей
    const intervals = [100, 500, 1000, 2000].map(delay => 
      setTimeout(() => {
        removeAllOutlines();
        processTelegramElements();
      }, delay)
    );
    
    // Также перехватываем события focus
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target) {
        target.style.outline = 'none';
        target.style.border = 'none';
        target.style.boxShadow = 'none';
      }
    };
    
    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('focusin', handleFocus, true);
    
    // Cleanup
    return () => {
      observer.disconnect();
      intervals.forEach(clearTimeout);
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('focusin', handleFocus, true);
      
      // Удаляем наш style элемент
      const styleElement = document.querySelector('[data-telegram-outline-remover]');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  return null; // Этот компонент не рендерит UI
} 