import { prisma } from '@/libs/prismaDb';
import { TelegramTokenService } from './telegram-token.service';

export class NotificationExecutorService {

  // Выполнение напоминания о неоплаченном заказе
  static async executePaymentReminder(jobId: number, jobData: any) {
    try {
      console.log(`🔔 Executing payment reminder job ${jobId}:`, jobData);
      
      const { order_id, reminder_type } = jobData;
      
      // Получаем заказ и пользователя
      const order = await prisma.orders.findUnique({
        where: { id: BigInt(order_id) },
        include: { users: true }
      });

      if (!order) {
        console.log(`❌ Order ${order_id} not found, skipping reminder`);
        return;
      }

      // Проверяем статус заказа - если уже оплачен, пропускаем
      if (order.status !== 0) { // 0 = UNPAID
        console.log(`ℹ️ Order ${order_id} already paid (status: ${order.status}), skipping reminder`);
        return;
      }

      const user = order.users;
      if (!user.tg_id) {
        console.log(`❌ User ${user.id} has no telegram ID, skipping reminder`);
        return;
      }

      let message = '';
      
      switch (reminder_type) {
        case 'first':
          message = `🕐 Напоминание об оплате заказа №${order_id}
          
Ваш заказ на сумму ${order.total_amount}₽ ожидает оплаты уже 48 часов.

Пожалуйста, завершите оплату в ближайшее время, иначе заказ будет автоматически отменен.`;
          break;
          
        case 'final':
          message = `⚠️ ПОСЛЕДНЕЕ ПРЕДУПРЕЖДЕНИЕ - Заказ №${order_id}
          
Ваш заказ на сумму ${order.total_amount}₽ будет автоматически ОТМЕНЕН через 21 час, если не будет оплачен.

🚨 Это последняя возможность сохранить ваш заказ!`;
          break;
          
        case 'cancel':
          // Отменяем заказ
          await prisma.orders.update({
            where: { id: BigInt(order_id) },
            data: { status: 4 } // 4 = CANCELLED
          });
          
          message = `❌ Заказ №${order_id} отменен
          
К сожалению, ваш заказ на сумму ${order.total_amount}₽ был автоматически отменен из-за неоплаты в течение 72 часов.

Товары снова доступны для заказа в нашем каталоге.`;
          break;
      }

      // Интерактивные кнопки для уведомлений об оплате
      let inlineKeyboard;
      
      if (reminder_type === 'first' || reminder_type === 'final') {
        inlineKeyboard = {
          inline_keyboard: [
            [
              {
                text: "💳 Оплатить заказ",
                url: `${process.env.WEBAPP_URL || 'https://strattera.ngrok.app/webapp'}/orders/${order_id}`
              }
            ],
            [
              {
                text: "📋 Мои заказы", 
                url: `${process.env.WEBAPP_URL || 'https://strattera.ngrok.app/webapp'}/orders`
              },
              {
                text: "🛒 Продолжить покупки",
                url: `${process.env.WEBAPP_URL || 'https://strattera.ngrok.app/webapp'}`
              }
            ]
          ]
        };
      } else if (reminder_type === 'cancel') {
        inlineKeyboard = {
          inline_keyboard: [
            [
              {
                text: "🛒 Перейти к покупкам",
                url: `${process.env.WEBAPP_URL || 'https://telesklad.ru'}/webapp`
              }
            ]
          ]
        };
      }

      // Отправляем уведомление через Telegram бота
      await this.sendTelegramNotification(user.tg_id.toString(), message, inlineKeyboard);
      
      console.log(`✅ Payment reminder sent to user ${user.id} (${reminder_type})`);
      
    } catch (error) {
      console.error('❌ Error executing payment reminder:', error);
      throw error;
    }
  }

  // Выполнение уведомления о бонусах
  static async executeBonusNotification(jobId: number, jobData: any) {
    try {
      console.log(`🎁 Executing bonus notification job ${jobId}:`, jobData);
      
      const { bonus_amount, order_id } = jobData;
      
      // Получаем заказ и пользователя
      const order = await prisma.orders.findUnique({
        where: { id: BigInt(order_id) },
        include: { 
          users: {
            include: { account_tiers: true }
          }
        }
      });

      if (!order || !order.users.tg_id) {
        console.log(`❌ Order ${order_id} or user telegram not found`);
        return;
      }

      const user = order.users;
      const tierName = user.account_tiers?.title || 'Старт';
      
      const message = `🎁 Бонусы начислены!

За заказ №${order_id} на сумму ${order.total_amount}₽ вам начислено ${bonus_amount} бонусов!

💎 Ваш уровень: ${tierName}
💰 Баланс бонусов: ${user.bonus_balance} бонусов

Бонусы можно использовать при следующих покупках!`;

      // Интерактивные кнопки для уведомления о бонусах
      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: "🛒 Продолжить покупки",
              url: `${process.env.WEBAPP_URL || 'https://telesklad.ru'}/webapp`
            }
          ],
          [
            {
              text: "👤 Профиль с бонусами",
              url: `${process.env.WEBAPP_URL || 'https://telesklad.ru'}/webapp/profile`
            }
          ]
        ]
      };

      await this.sendTelegramNotification(user.tg_id.toString(), message, inlineKeyboard);
      
      console.log(`✅ Bonus notification sent to user ${user.id}`);
      
    } catch (error) {
      console.error('❌ Error executing bonus notification:', error);
      throw error;
    }
  }

  // Выполнение уведомления о поступлении товара
  static async executeRestockNotification(jobId: number, jobData: any) {
    try {
      console.log(`📦 Executing restock notification job ${jobId}:`, jobData);
      
      const { product_id } = jobData;
      
      // Получаем продукт
      const product = await prisma.products.findUnique({
        where: { id: BigInt(product_id) }
      });

      if (!product) {
        console.log(`❌ Product ${product_id} not found`);
        return;
      }

      // Получаем задачу и пользователя
      const job = await (prisma as any).notification_jobs.findUnique({
        where: { id: BigInt(jobId) }
      });

      if (!job) {
        console.log(`❌ Job ${jobId} not found`);
        return;
      }

      // Получаем пользователя по user_id из задачи
      const user = await prisma.users.findUnique({
        where: { id: job.user_id }
      });

      if (!user || !user.tg_id) {
        console.log(`❌ User ${job.user_id} or telegram ID not found`);
        return;
      }
      
      const message = `📦 Товар поступил на склад!

"${product.name}" снова доступен для заказа!

💰 Цена: ${product.price}₽

Не упустите возможность - количество ограничено!`;

      // Интерактивные кнопки для уведомления о поступлении товара
      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: "🛒 Заказать сейчас",
              url: `${process.env.WEBAPP_URL || 'https://telesklad.ru'}/webapp/products/${product.id}`
            }
          ],
          [
            {
              text: "📋 Просмотреть каталог",
              url: `${process.env.WEBAPP_URL || 'https://telesklad.ru'}/webapp`
            }
          ]
        ]
      };

      await this.sendTelegramNotification(user.tg_id.toString(), message, inlineKeyboard);
      
      // Удаляем подписку пользователя (одноразовое уведомление)
      await (prisma as any).product_subscriptions.deleteMany({
        where: {
          user_id: user.id,
          product_id: BigInt(product_id)
        }
      });
      
      console.log(`✅ Restock notification sent to user ${user.id}`);
      
    } catch (error) {
      console.error('❌ Error executing restock notification:', error);
      throw error;
    }
  }

  // Выполнение уведомления о повышении уровня аккаунта
  static async executeAccountTierNotification(jobId: number, jobData: any) {
    try {
      console.log(`🎖️ Executing account tier notification job ${jobId}:`, jobData);
      
      const { tier_name, bonus_percentage } = jobData;
      
      // Получаем задачу и пользователя
      const job = await (prisma as any).notification_jobs.findUnique({
        where: { id: BigInt(jobId) }
      });

      if (!job) {
        console.log(`❌ Job ${jobId} not found`);
        return;
      }

      // Получаем пользователя по user_id из задачи
      const user = await prisma.users.findUnique({
        where: { id: job.user_id }
      });

      if (!user || !user.tg_id) {
        console.log(`❌ User ${job.user_id} or telegram ID not found`);
        return;
      }
      
      const message = `🎖️ Поздравляем с повышением уровня!

Ваш новый уровень: ${tier_name}
🎁 Кэшбек: ${bonus_percentage}%

Теперь вы получаете больше бонусов с каждой покупки!

💰 Текущий баланс: ${user.bonus_balance} бонусов`;

      // Интерактивные кнопки для уведомления о повышении уровня
      const inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: "🛒 Совершить покупку",
              url: `${process.env.WEBAPP_URL || 'https://telesklad.ru'}/webapp`
            }
          ],
          [
            {
              text: "👤 Мой профиль",
              url: `${process.env.WEBAPP_URL || 'https://telesklad.ru'}/webapp/profile`
            },
            {
              text: "ℹ️ О программе лояльности",
              url: `${process.env.WEBAPP_URL || 'https://telesklad.ru'}/webapp/support`
            }
          ]
        ]
      };

      await this.sendTelegramNotification(user.tg_id.toString(), message, inlineKeyboard);
      
      console.log(`✅ Account tier notification sent to user ${user.id}`);
      
    } catch (error) {
      console.error('❌ Error executing account tier notification:', error);
      throw error;
    }
  }

  // Получение токена webapp бота из централизованного сервиса
  private static async getWebappBotToken(): Promise<string | null> {
    return await TelegramTokenService.getWebappBotToken();
  }

  // Отправка уведомления через Telegram
  private static async sendTelegramNotification(telegramId: string, message: string, replyMarkup?: any) {
    try {
      // Получаем токен webapp бота из базы данных
      const webappBotToken = await this.getWebappBotToken();
      
      if (!webappBotToken) {
        console.error('❌ WEBAPP_TELEGRAM_BOT_TOKEN not found in database or environment');
        throw new Error('Telegram bot token not configured');
      }

      const url = `https://api.telegram.org/bot${webappBotToken}/sendMessage`;
      
      console.log(`📱 Sending telegram notification to ${telegramId}...`);
      
      const requestBody: any = {
        chat_id: telegramId,
        text: message,
        parse_mode: 'HTML'
      };
      
      // Добавляем клавиатуру если передана
      if (replyMarkup) {
        requestBody.reply_markup = replyMarkup;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Telegram API error:', errorData);
        throw new Error(`Telegram API error: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      console.log('✅ Telegram notification sent successfully:', result.message_id);
      
    } catch (error) {
      console.error('❌ Error sending telegram notification:', error);
      throw error;
    }
  }

  // Основной метод для выполнения задач
  static async executeJob(job: any) {
    try {
      console.log(`🚀 Executing job ${job.id} of type ${job.job_type}`);
      
      // Помечаем задачу как выполняющуюся
      await (prisma as any).notification_jobs.update({
        where: { id: job.id },
        data: { status: 'executing' }
      });

      let success = false;
      
      switch (job.job_type) {
        case 'payment_reminder_first':
        case 'payment_reminder_final':
        case 'payment_reminder_cancel':
          await this.executePaymentReminder(Number(job.id), job.data);
          success = true;
          break;
          
        case 'bonus_notice':
          await this.executeBonusNotification(Number(job.id), job.data);
          success = true;
          break;
          
        case 'restock_notice':
          await this.executeRestockNotification(Number(job.id), job.data);
          success = true;
          break;
          
        case 'account_tier_notice':
          await this.executeAccountTierNotification(Number(job.id), job.data);
          success = true;
          break;
          
        default:
          console.error(`❌ Unknown job type: ${job.job_type}`);
          success = false;
      }

      // Помечаем задачу как выполненную или неудачную
      await (prisma as any).notification_jobs.update({
        where: { id: job.id },
        data: { 
          status: success ? 'executed' : 'failed',
          executed_at: new Date()
        }
      });
      
      console.log(`✅ Job ${job.id} completed with status: ${success ? 'executed' : 'failed'}`);
      
    } catch (error) {
      console.error(`❌ Error executing job ${job.id}:`, error);
      
      // Увеличиваем счетчик попыток и помечаем как неудачную
      await (prisma as any).notification_jobs.update({
        where: { id: job.id },
        data: { 
          status: 'failed',
          retry_count: { increment: 1 },
          executed_at: new Date()
        }
      });
      
      throw error;
    }
  }
} 