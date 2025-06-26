// Безопасная обёртка для работы с Telegram WebApp SDK
export class TelegramSDK {
  private static instance: TelegramSDK;
  
  static getInstance(): TelegramSDK {
    if (!TelegramSDK.instance) {
      TelegramSDK.instance = new TelegramSDK();
    }
    return TelegramSDK.instance;
  }

  // Проверка доступности SDK
  isAvailable(): boolean {
    return typeof window !== 'undefined' && 
           window.Telegram?.WebApp !== undefined;
  }

  // Безопасный haptic feedback
  hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') {
    if (!this.isAvailable()) return;
    
    try {
      const tg = window.Telegram.WebApp;
      if (tg.HapticFeedback) {
        if (type === 'success' || type === 'error') {
          tg.HapticFeedback.notificationOccurred(type as 'success' | 'error');
        } else {
          tg.HapticFeedback.impactOccurred(type as 'light' | 'medium' | 'heavy');
        }
      }
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  // Безопасные всплывающие окна
  showPopup(options: { 
    title?: string; 
    message: string; 
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text: string;
    }>;
  }, callback?: (buttonId: string) => void) {
    if (!this.isAvailable()) {
      // Fallback к обычному alert
      const title = options.title ? `${options.title}\n` : '';
      alert(`${title}${options.message}`);
      return;
    }

    try {
      if (callback) {
        window.Telegram!.WebApp.showPopup(options, callback);
      } else {
        window.Telegram!.WebApp.showPopup(options);
      }
    } catch (error) {
      console.warn('Telegram popup not available:', error);
      const title = options.title ? `${options.title}\n` : '';
      alert(`${title}${options.message}`);
    }
  }

  // Безопасный alert
  showAlert(message: string, callback?: () => void) {
    if (!this.isAvailable()) {
      alert(message);
      callback?.();
      return;
    }

    try {
      window.Telegram!.WebApp.showAlert(message);
      // Вызываем callback сразу, поскольку Telegram showAlert не поддерживает callback
      callback?.();
    } catch (error) {
      console.warn('Telegram alert not available:', error);
      alert(message);
      callback?.();
    }
  }

  // Безопасное управление главной кнопкой
  configureMainButton(config: {
    text: string;
    onClick?: () => void;
    show?: boolean;
    enable?: boolean;
    color?: string;
    textColor?: string;
  }) {
    if (!this.isAvailable()) return null;

    try {
      const tg = window.Telegram.WebApp;
      const button = tg.MainButton;

      button.text = config.text;
      if (config.color) button.color = config.color;
      if (config.textColor) button.textColor = config.textColor;
      
      if (config.enable !== false) {
        button.enable();
      } else {
        button.disable();
      }

      if (config.show !== false) {
        button.show();
      } else {
        button.hide();
      }

      if (config.onClick) {
        button.onClick(config.onClick);
      }

      return () => {
        if (config.onClick) {
          button.offClick(config.onClick);
        }
        button.hide();
      };
    } catch (error) {
      console.warn('Main button not available:', error);
      return null;
    }
  }

  // Получение темы Telegram
  getTheme() {
    if (!this.isAvailable()) {
      return {
        colorScheme: 'light' as const,
        backgroundColor: '#ffffff',
        textColor: '#000000',
        hintColor: '#999999',
        linkColor: '#007AFF',
        buttonColor: '#007AFF',
        buttonTextColor: '#ffffff'
      };
    }

    const tg = window.Telegram.WebApp;
    return {
      colorScheme: tg.colorScheme || 'light',
      backgroundColor: tg.backgroundColor || '#ffffff',
      textColor: tg.textColor || '#000000',
      hintColor: tg.hintColor || '#999999',
      linkColor: tg.linkColor || '#007AFF',
      buttonColor: tg.buttonColor || '#007AFF',
      buttonTextColor: tg.buttonTextColor || '#ffffff'
    };
  }

  // Отправка данных в бот
  sendData(data: any) {
    if (!this.isAvailable()) {
      console.warn('Telegram WebApp not available for sending data');
      return;
    }

    try {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      window.Telegram.WebApp.sendData(dataString);
    } catch (error) {
      console.warn('Error sending data to Telegram:', error);
    }
  }

  // Закрытие WebApp
  close() {
    if (!this.isAvailable()) return;

    try {
      window.Telegram.WebApp.close();
    } catch (error) {
      console.warn('Error closing Telegram WebApp:', error);
    }
  }

  // Установка светлой темы
  setLightTheme() {
    if (!this.isAvailable()) return;

    try {
      const tg = window.Telegram.WebApp;
      
      // Устанавливаем светлые цвета для заголовка и фона
      tg.setHeaderColor('#FFFFFF');
      tg.setBackgroundColor('#FFFFFF');
      
      // КРИТИЧЕСКИ ВАЖНО: Устанавливаем цвет нижней панели (Bot API 7.10+)
      // Это контролирует фон области под MainButton
      if (tg.setBottomBarColor) {
        tg.setBottomBarColor('#FFFFFF');
        console.log('✅ Цвет нижней панели установлен на белый');
      } else {
        console.warn('⚠️ setBottomBarColor не поддерживается в этой версии Telegram');
      }
      
      // Переопределяем параметры темы для полной совместимости
      if (tg.themeParams) {
        tg.themeParams.bg_color = '#FFFFFF';
        tg.themeParams.secondary_bg_color = '#F7F7F7';
        tg.themeParams.text_color = '#000000';
        tg.themeParams.hint_color = '#999999';
        tg.themeParams.link_color = '#48C928';
        tg.themeParams.button_color = '#48C928';
        tg.themeParams.button_text_color = '#FFFFFF';
        tg.themeParams.bottom_bar_bg_color = '#FFFFFF';
      }
      
      // Если MainButton уже показана, обновляем её цвета
      if (tg.MainButton?.isVisible) {
        tg.MainButton.color = '#48C928';
        tg.MainButton.textColor = '#FFFFFF';
        console.log('🎨 Цвета MainButton обновлены для светлой темы');
      }
      
      console.log('✅ Светлая тема установлена для Telegram WebApp');
    } catch (error) {
      console.warn('Ошибка установки светлой темы:', error);
    }
  }
}

export const telegramSDK = TelegramSDK.getInstance(); 