import { PrismaClient } from '@prisma/client';

interface MessageParams {
  order?: number;
  price?: number;
  items?: string;
  fio?: string;
  address?: string;
  postal_code?: number | string;
  phone?: string;
  card?: string;
  track?: string;
  num?: string;
  product?: string;
}

export class TelegramMessageTemplatesService {
  private static prisma = new PrismaClient();
  private static templateCache = new Map<string, string>();

  /**
   * Получить шаблон сообщения из базы данных
   */
  static async getTemplate(key: string): Promise<string | null> {
    // Проверяем кэш
    if (this.templateCache.has(key)) {
      return this.templateCache.get(key)!;
    }

    try {
      const setting = await this.prisma.settings.findUnique({
        where: { variable: `tg_msg_${key}` }
      });

      if (setting && setting.value) {
        this.templateCache.set(key, setting.value);
        return setting.value;
      }

      return null;
    } catch (error) {
      console.error(`❌ Failed to get template ${key}:`, error);
      return null;
    }
  }

  /**
   * Создать или обновить шаблон сообщения
   */
  static async setTemplate(key: string, template: string, description?: string): Promise<boolean> {
    try {
      await this.prisma.settings.upsert({
        where: { variable: `tg_msg_${key}` },
        update: { 
          value: template,
          description: description,
          updated_at: new Date()
        },
        create: {
          variable: `tg_msg_${key}`,
          value: template,
          description: description || `Шаблон сообщения: ${key}`,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Обновляем кэш
      this.templateCache.set(key, template);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to set template ${key}:`, error);
      return false;
    }
  }

  /**
   * Интерполировать параметры в шаблон (аналог Rails I18n.t)
   */
  static interpolateTemplate(template: string, params: MessageParams): string {
    let result = template;

    // Заменяем все плейсхолдеры %{param} на значения
    Object.entries(params).forEach(([key, value]) => {
      const placeholder = `%{${key}}`;
      const valueStr = value !== null && value !== undefined ? String(value) : '';
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), valueStr);
    });

    return result;
  }

  /**
   * Получить и интерполировать шаблон
   */
  static async getMessage(key: string, params: MessageParams = {}): Promise<string> {
    const template = await this.getTemplate(key);
    
    if (!template) {
      console.error(`❌ Template not found: ${key}`);
      return `[TEMPLATE_MISSING: ${key}]`;
    }

    return this.interpolateTemplate(template, params);
  }

  /**
   * Инициализировать базовые шаблоны (точно как в Rails ru.yml)
   */
  static async initializeDefaultTemplates(): Promise<void> {
    const defaultTemplates = {
      // UNPAID - создание заказа
      'unpaid_msg': '🎉 Ваш заказ №%{order} принят.',
      'unpaid_main': `📌 Проверьте заказ перед оплатой:

Состав заказа:
%{items}

Данные для доставки:
👤 %{fio}

🏠 %{address}, %{postal_code}

📞 %{phone}

Сумма к оплате: %{price}₽

✅ Дальнейшие действия:
1. Сделайте перевод:
ВНИМАНИЕ, ОПЛАЧИВАЙТЕ ИМЕННО НА
%{card}.

2. Нажмите кнопку «Я оплатил», чтобы мы проверили поступление и отправили ваш заказ.

❗️ Если заметили ошибку — нажмите «Изменить заказ».`,

      // PAID - клиент сообщил об оплате
      'paid_client': `⏳ Идет проверка вашего перевода в нашей системе.

Пожалуйста, ожидайте - как только мы подтвердим оплату, вы получите уведомление здесь.

Примерное время ожидания: от 5 до 30 минут.`,

      'paid_admin': `Надо проверить оплату по заказу №%{order}

Итого отправил клиент: %{price}₽

Банк: %{card}

📄 Состав заказа:
%{items}

📍 Адрес:
%{address}

👤 ФИО:
%{fio}

📱 Телефон:
%{phone}`,

      // PROCESSING - оплата подтверждена (НОВЫЕ ТЕКСТЫ)
      'on_processing_client': `❤️ Благодарим вас за покупку!

🚚 Заказ №%{order} находится у курьера и готовится к отправке.

Как только посылка будет отправлена, мы незамедлительно вышлем вам трек-номер для отслеживания.

Процесс отправки занимает от 5 до 48 часов.

Будем признательны за ваше терпение!`,

      'on_processing_courier': `👀 Нужно отправить заказ №%{order}

📄 Состав заказа:
%{items}

📍 Адрес:
%{address}

📍 Индекс: %{postal_code}

👤 ФИО:
%{fio}

📱 Телефон:
%{phone}`,

      // SHIPPED - заказ отправлен (НОВЫЕ ТЕКСТЫ)
      'on_shipped_client': `📦 Отличные новости!

Ваш заказ №%{order} отправлен.
Вот ваш трек-номер для отслеживания: %{track}

Как только он будет принят транспортной службой, начнёт обновляться статус доставки.

Спасибо за ваш заказ!`,

      'track_num_save': `Клиент получил номер заказа №%{order}

📄 Состав заказа:
%{items}

📍 Адрес:
%{address}

📍 Индекс: %{postal_code}

👤 ФИО:
%{fio}

📱 Телефон:
%{phone}

📦 Трек-номер: %{track}`,

      // Новые шаблоны для работы с трек-номерами
      'courier_track_request': `Введите трек-номер для заказа №%{order}

👤 ФИО:
%{fio}`,

      'courier_track_back': `👀 Нужно отправить заказ №%{order}

📄 Состав заказа:
%{items}

📍 Адрес:
%{address}

📍 Индекс: %{postal_code}

👤 ФИО:
%{fio}

📱 Телефон:
%{phone}`,

      // CANCELLED - заказ отменен
      'cancel': `❌ Ваш заказ №%{order} отменён.

Если вы хотите оформить новый заказ, повторите покупку через каталог.`,

      // Напоминания об оплате
      'unpaid_reminder_one': `⏰ Напоминаем об оплате заказа №%{order}

Ваш заказ всё ещё ждёт подтверждения оплаты.`,

      'unpaid_reminder_two': `⚠️ Ваш заказ №%{order} может быть отменён

Мы всё ещё не получили оплату за ваш заказ. Если оплата не поступит в течение 3 часов, резерв будет снят, и заказ будет отменён.`,

      'unpaid_reminder_overdue': `❌ Ваш заказ №%{order} отменён.

Мы не получили оплату в установленное время, поэтому резерв на товар был снят, и заказ отменён.

Если вы хотите оформить новый заказ - повторите покупку через каталог.`,

      // Запрос отзывов
      'review': `Здравствуйте!

Все ли прошло хорошо с доставкой %{product}?

*Нам очень важно ваше мнение!*

Пожалуйста, оставьте отзыв.`,

      'review_mirena': `Здравствуйте!

*Все ли прошло хорошо с доставкой?*

Было бы здорово, если бы вы поделились своим опытом – это поможет другим покупателям!`,

      // Утилитарные
      'set_track_num': `Введите трек-номер для заказа №%{order}

👤 ФИО:
%{fio}

в чат:`,

      'error_data': 'Не верные данные!',

      'approved_pay': '🎉 Подтвержден платеж для заказа №%{order}(%{fio}).'
    };

    console.log('📝 Initializing Telegram message templates...');

    for (const [key, template] of Object.entries(defaultTemplates)) {
      try {
        await this.setTemplate(key, template);
        console.log(`✅ Template initialized: ${key}`);
      } catch (error) {
        console.error(`❌ Failed to initialize template ${key}:`, error);
      }
    }

    console.log('✅ All Telegram message templates initialized');
  }

  /**
   * Получить все шаблоны для админки
   */
  static async getAllTemplates(): Promise<Array<{ key: string; template: string; description?: string }>> {
    try {
      const settings = await this.prisma.settings.findMany({
        where: {
          variable: {
            startsWith: 'tg_msg_'
          }
        },
        orderBy: { variable: 'asc' }
      });

      return settings.map(setting => ({
        key: setting.variable!.replace('tg_msg_', ''),
        template: setting.value || '',
        description: setting.description || undefined
      }));
    } catch (error) {
      console.error('❌ Failed to get all templates:', error);
      return [];
    }
  }

  /**
   * Очистить кэш шаблонов
   */
  static clearCache(): void {
    this.templateCache.clear();
    console.log('🗑️ Template cache cleared');
  }
} 