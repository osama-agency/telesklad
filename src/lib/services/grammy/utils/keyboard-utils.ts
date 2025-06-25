import { InlineKeyboard } from 'grammy';
import { KeyboardOptions } from '../types/grammy-types';

/**
 * Утилиты для создания inline клавиатур grammY
 * Упрощенная и типобезопасная замена старых keyboard helpers
 */
export class KeyboardUtils {
  
  /**
   * Создает приветственную клавиатуру для WebApp
   */
  static createWelcomeKeyboard(webappUrl?: string): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    
    // Основная кнопка для WebApp
    const appUrl = webappUrl || process.env.WEBAPP_URL || 'https://strattera.ngrok.app/webapp';
    keyboard.webApp('👉 Открыть каталог', appUrl);
    
    // Вторая строка с дополнительными кнопками
    keyboard.row();
    keyboard.url('❓ Задать вопрос', 'https://t.me/strattera_help');
    keyboard.url('👥 Наша группа', 'https://t.me/+2rTVT8IxtFozNDY0');
    
    return keyboard;
  }

  /**
   * Создает клавиатуру для неоплаченного заказа
   */
  static createUnpaidOrderKeyboard(orderId: string): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    
    keyboard.text('💳 Я оплатил', `i_paid_${orderId}`);
    
    return keyboard;
  }

  /**
   * Создает админскую клавиатуру для подтверждения оплаты
   */
  static createAdminOrderKeyboard(orderId: string): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    
    keyboard.text('✅ Оплата пришла', `approve_payment_${orderId}`);
    keyboard.text('❌ Отклонить', `reject_payment_${orderId}`);
    
    return keyboard;
  }

  /**
   * Создает клавиатуру для курьера (привязка трек-номера)
   */
  static createCourierKeyboard(orderId: string): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    
    keyboard.text('📦 Привязать трек-номер', `submit_tracking_${orderId}`);
    keyboard.text('✅ Отправлено без трекинга', `shipped_no_tracking_${orderId}`);
    
    return keyboard;
  }

  /**
   * Создает клавиатуру для трекинга посылки
   */
  static createTrackingKeyboard(orderId: string, trackingNumber?: string): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    
    if (trackingNumber) {
      keyboard.text('📍 Отследить посылку', `track_package_${orderId}_${trackingNumber}`);
      keyboard.row();
      keyboard.text('🔄 Обновить трек-номер', `submit_tracking_${orderId}`);
    } else {
      keyboard.text('📦 Добавить трек-номер', `submit_tracking_${orderId}`);
    }
    
    keyboard.row();
    keyboard.text('⬅️ Назад', 'track_back');
    
    return keyboard;
  }

  /**
   * Создает клавиатуру для поддержки
   */
  static createSupportKeyboard(): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    
    keyboard.url('💬 Написать в поддержку', 'https://t.me/strattera_help');
    keyboard.row();
    keyboard.url('❓ FAQ', 'https://t.me/+2rTVT8IxtFozNDY0');
    keyboard.url('📞 Обратный звонок', 'https://strattera.ngrok.app/support');
    
    return keyboard;
  }

  /**
   * Создает админскую клавиатуру с опциями управления
   */
  static createAdminKeyboard(): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    
    keyboard.text('📊 Статистика', 'admin_stats');
    keyboard.text('⚙️ Настройки', 'admin_settings');
    keyboard.row();
    keyboard.text('📋 Заказы', 'admin_orders');
    keyboard.text('👥 Пользователи', 'admin_users');
    keyboard.row();
    keyboard.text('🧪 Тест уведомлений', 'test_notifications');
    keyboard.text('🔄 Перезагрузить', 'admin_reload');
    
    return keyboard;
  }

  /**
   * Создает клавиатуру для выбора статуса заказа (админ)
   */
  static createOrderStatusKeyboard(orderId: string): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    
    keyboard.text('⏳ Неоплачен', `set_status_${orderId}_unpaid`);
    keyboard.text('✅ Оплачен', `set_status_${orderId}_paid`);
    keyboard.row();
    keyboard.text('🔄 В обработке', `set_status_${orderId}_processing`);
    keyboard.text('📦 Отправлен', `set_status_${orderId}_shipped`);
    keyboard.row();
    keyboard.text('🏁 Доставлен', `set_status_${orderId}_delivered`);
    keyboard.text('❌ Отменен', `set_status_${orderId}_cancelled`);
    
    return keyboard;
  }

  /**
   * Создает клавиатуру с кнопкой возврата
   */
  static createBackKeyboard(callbackData: string = 'back'): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    keyboard.text('⬅️ Назад', callbackData);
    return keyboard;
  }

  /**
   * Создает клавиатуру для подтверждения действия
   */
  static createConfirmationKeyboard(
    confirmData: string, 
    cancelData: string = 'cancel',
    confirmText: string = '✅ Да',
    cancelText: string = '❌ Нет'
  ): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    
    keyboard.text(confirmText, confirmData);
    keyboard.text(cancelText, cancelData);
    
    return keyboard;
  }

  /**
   * Создает клавиатуру для тестирования
   */
  static createTestKeyboard(): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    
    keyboard.text('🧪 Test Callback', 'test_callback');
    keyboard.text('📊 Test Metrics', 'test_metrics');
    keyboard.row();
    keyboard.text('🔔 Test Notification', 'test_notification');
    keyboard.text('📱 Test WebApp', 'test_webapp');
    keyboard.row();
    keyboard.webApp('🌐 Open WebApp', process.env.WEBAPP_URL || 'https://strattera.ngrok.app/webapp');
    
    return keyboard;
  }

  /**
   * Создает клавиатуру с пагинацией
   */
  static createPaginationKeyboard(
    currentPage: number,
    totalPages: number,
    baseCallback: string
  ): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    
    const buttons = [];
    
    // Кнопка "Предыдущая"
    if (currentPage > 1) {
      buttons.push({ text: '⬅️', callback_data: `${baseCallback}_page_${currentPage - 1}` });
    }
    
    // Номер страницы
    buttons.push({ text: `${currentPage}/${totalPages}`, callback_data: 'noop' });
    
    // Кнопка "Следующая"
    if (currentPage < totalPages) {
      buttons.push({ text: '➡️', callback_data: `${baseCallback}_page_${currentPage + 1}` });
    }
    
    if (buttons.length > 0) {
      keyboard.add(...buttons);
    }
    
    return keyboard;
  }

  /**
   * Создает клавиатуру для выбора количества
   */
  static createQuantityKeyboard(
    productId: string,
    currentQuantity: number = 1,
    maxQuantity: number = 10
  ): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    
    // Кнопки для изменения количества
    const buttons = [];
    
    if (currentQuantity > 1) {
      buttons.push({ text: '➖', callback_data: `qty_${productId}_${currentQuantity - 1}` });
    }
    
    buttons.push({ text: currentQuantity.toString(), callback_data: 'noop' });
    
    if (currentQuantity < maxQuantity) {
      buttons.push({ text: '➕', callback_data: `qty_${productId}_${currentQuantity + 1}` });
    }
    
    keyboard.add(...buttons);
    
    // Кнопка добавления в корзину
    keyboard.row();
    keyboard.text('🛒 Добавить в корзину', `add_to_cart_${productId}_${currentQuantity}`);
    
    return keyboard;
  }

  /**
   * Создает динамическую клавиатуру на основе опций
   */
  static createDynamicKeyboard(options: KeyboardOptions): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    
    // WebApp кнопка
    if (options.webappUrl) {
      keyboard.webApp('🛒 Открыть каталог', options.webappUrl);
      keyboard.row();
    }
    
    // Кнопки для заказа
    if (options.orderId) {
      keyboard.text('💳 Я оплатил', `i_paid_${options.orderId}`);
      
      if (options.trackingNumber) {
        keyboard.row();
        keyboard.text('📍 Отследить', `track_package_${options.orderId}_${options.trackingNumber}`);
      }
    }
    
    // Админские кнопки
    if (options.includeAdminButtons) {
      if (options.orderId) {
        keyboard.row();
        keyboard.text('✅ Подтвердить оплату', `approve_payment_${options.orderId}`);
        keyboard.text('📦 Трек-номер', `submit_tracking_${options.orderId}`);
      }
    }
    
    // Кнопка назад
    if (options.includeBackButton) {
      keyboard.row();
      keyboard.text('⬅️ Назад', 'back');
    }
    
    return keyboard;
  }

  /**
   * Создает клавиатуру из массива кнопок
   */
  static createFromArray(
    buttons: Array<{
      text: string;
      callback_data?: string;
      url?: string;
      web_app?: { url: string };
    }>,
    buttonsPerRow: number = 2
  ): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    
    for (let i = 0; i < buttons.length; i += buttonsPerRow) {
      const rowButtons = buttons.slice(i, i + buttonsPerRow);
      
      for (const button of rowButtons) {
        if (button.callback_data) {
          keyboard.text(button.text, button.callback_data);
        } else if (button.url) {
          keyboard.url(button.text, button.url);
        } else if (button.web_app) {
          keyboard.webApp(button.text, button.web_app.url);
        }
      }
      
      if (i + buttonsPerRow < buttons.length) {
        keyboard.row();
      }
    }
    
    return keyboard;
  }

  /**
   * Проверяет валидность callback data
   */
  static isValidCallbackData(data: string): boolean {
    // Telegram ограничивает callback_data до 64 байт
    return data && data.length <= 64;
  }

  /**
   * Создает безопасную callback data с проверкой длины
   */
  static createSafeCallbackData(prefix: string, ...params: (string | number)[]): string {
    const data = [prefix, ...params].join('_');
    
    if (!this.isValidCallbackData(data)) {
      // Если данные слишком длинные, создаем хэш
      const hash = require('crypto').createHash('md5').update(data).digest('hex').substring(0, 8);
      return `${prefix}_${hash}`;
    }
    
    return data;
  }

  /**
   * Парсит callback data и возвращает объект
   */
  static parseCallbackData(data: string): { type: string; params: string[] } {
    const parts = data.split('_');
    return {
      type: parts[0] || '',
      params: parts.slice(1)
    };
  }
}

// Экспорт для обратной совместимости
export const {
  createWelcomeKeyboard,
  createUnpaidOrderKeyboard,
  createAdminOrderKeyboard,
  createCourierKeyboard,
  createTrackingKeyboard,
  createSupportKeyboard,
  createAdminKeyboard,
  createTestKeyboard,
  createBackKeyboard,
  createConfirmationKeyboard
} = KeyboardUtils;