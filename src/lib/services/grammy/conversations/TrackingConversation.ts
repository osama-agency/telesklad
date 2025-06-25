import { Conversation } from '@grammyjs/conversations';
import { ExtendedContext, ConversationContext } from '../types/grammy-types';
import { KeyboardUtils } from '../utils/keyboard-utils';
import { prisma } from '@/libs/prismaDb';
import { RedisService } from '../../redis.service';
import { ReportService } from '../../ReportService';
import { logger } from '@/lib/logger';

/**
 * TrackingConversation - Conversation для ввода трек-номеров курьерами
 * 
 * Workflow:
 * 1. Курьер нажимает "Привязать трек-номер"
 * 2. Система запрашивает ввод трек-номера
 * 3. Курьер вводит трек-номер в чат
 * 4. Система сохраняет трек-номер и обновляет статус заказа
 * 5. Отправляет уведомления клиенту
 */
export class TrackingConversation {
  
  /**
   * Главная функция conversation для ввода трек-номера
   */
  static async trackingFlow(conversation: Conversation<ExtendedContext>, ctx: ExtendedContext): Promise<void> {
    logger.info('🗣️ Starting tracking conversation', { userId: ctx.from?.id }, 'Grammy');

    try {
      // Получаем состояние пользователя из Redis
      const userState = await RedisService.getUserState(`user_${ctx.chat?.id}_state`);
      
      if (!userState || !userState.order_id) {
        logger.warn('⚠️ No user state found for tracking conversation', { 
          userId: ctx.from?.id,
          chatId: ctx.chat?.id 
        }, 'Grammy');
        
        await ctx.reply('❌ Ошибка: не найдена информация о заказе. Попробуйте снова.');
        return;
      }

      const orderId = userState.order_id;
      logger.info('📦 Processing tracking for order', { orderId, userId: ctx.from?.id }, 'Grammy');

      // Получаем заказ из БД
      const order = await prisma.orders.findUnique({
        where: { id: BigInt(orderId) },
        include: {
          users: true,
          order_items: {
            include: {
              products: true
            }
          }
        }
      });

      if (!order) {
        logger.warn('⚠️ Order not found', { orderId }, 'Grammy');
        await ctx.reply(`❌ Заказ №${orderId} не найден.`);
        return;
      }

      // Ждем ввод трек-номера от пользователя
      await ctx.reply('📝 Введите трек-номер для отслеживания:');
      
      logger.info('⏳ Waiting for tracking number input', { orderId, userId: ctx.from?.id }, 'Grammy');
      
      // Ожидаем сообщение с трек-номером
      const trackingMessage = await conversation.wait();
      
      if (!trackingMessage.message?.text) {
        await ctx.reply('❌ Пожалуйста, введите трек-номер текстом.');
        return;
      }

      const trackingNumber = trackingMessage.message.text.trim();
      
      // Валидация трек-номера
      if (!TrackingConversation.isValidTrackingNumber(trackingNumber)) {
        await ctx.reply(
          '❌ Неверный формат трек-номера. Попробуйте еще раз.\n\n' +
          'Примеры правильных форматов:\n' +
          '• RA123456789RU\n' +
          '• RR123456789RU\n' +
          '• 12345678901234'
        );
        return;
      }

      logger.info('✅ Valid tracking number received', { 
        orderId, 
        trackingNumber: trackingNumber.substring(0, 5) + '...',
        userId: ctx.from?.id 
      }, 'Grammy');

      // Обновляем заказ с трек-номером
      const updatedOrder = await prisma.orders.update({
        where: { id: BigInt(orderId) },
        data: {
          tracking_number: trackingNumber,
          status: 3, // shipped
          shipped_at: new Date(),
          updated_at: new Date()
        },
        include: {
          users: true,
          order_items: {
            include: {
              products: true
            }
          }
        }
      });

      logger.info('✅ Order updated with tracking number', { 
        orderId, 
        newStatus: 'shipped' 
      }, 'Grammy');

      // Формируем подтверждающее сообщение курьеру
      const confirmationMessage = TrackingConversation.buildCourierConfirmation(
        updatedOrder, 
        trackingNumber
      );

      const trackingKeyboard = KeyboardUtils.createTrackingKeyboard(orderId.toString(), trackingNumber);

      await ctx.reply(confirmationMessage, {
        reply_markup: trackingKeyboard,
        parse_mode: 'HTML'
      });

      // Отправляем уведомления через ReportService
      await TrackingConversation.sendNotifications(updatedOrder, trackingNumber);

      // Очищаем состояние пользователя
      await RedisService.clearUserState(`user_${ctx.chat?.id}_state`);

      logger.info('✅ Tracking conversation completed successfully', { 
        orderId, 
        userId: ctx.from?.id 
      }, 'Grammy');

    } catch (error) {
      logger.error('❌ Error in tracking conversation', { 
        error: (error as Error).message,
        userId: ctx.from?.id,
        chatId: ctx.chat?.id
      }, 'Grammy');

      await ctx.reply(
        '😔 Произошла ошибка при сохранении трек-номера. ' +
        'Попробуйте еще раз или обратитесь в поддержку.'
      );
    }
  }

  /**
   * Валидация трек-номера
   */
  static isValidTrackingNumber(trackingNumber: string): boolean {
    if (!trackingNumber || trackingNumber.length < 5) {
      return false;
    }

    // Российская почта: RA123456789RU, RR123456789RU
    const russianPostPattern = /^[A-Z]{2}\d{9}[A-Z]{2}$/;
    
    // СДЭК: цифровой код
    const cdekPattern = /^\d{10,14}$/;
    
    // Почта России: штрих-код
    const russianPostBarcodePattern = /^\d{14}$/;
    
    // DPD, Boxberry и другие
    const genericPattern = /^[A-Z0-9]{5,20}$/;

    return russianPostPattern.test(trackingNumber) ||
           cdekPattern.test(trackingNumber) ||
           russianPostBarcodePattern.test(trackingNumber) ||
           genericPattern.test(trackingNumber);
  }

  /**
   * Построение сообщения подтверждения для курьера
   */
  static buildCourierConfirmation(order: any, trackingNumber: string): string {
    const user = order.users;
    const orderItems = order.order_items;
    
    const itemsStr = orderItems.map((item: any) => 
      `• ${item.products.name} — ${item.quantity}шт.`
    ).join('\n');

    return `✅ <b>Трек-номер успешно привязан!</b>\n\n` +
      `📦 <b>Заказ №${order.id}</b>\n` +
      `🔢 <b>Трек-номер:</b> <code>${trackingNumber}</code>\n\n` +
      `📄 <b>Состав заказа:</b>\n${itemsStr}\n\n` +
      `👤 <b>Получатель:</b> ${TrackingConversation.getFullName(user)}\n` +
      `📱 <b>Телефон:</b> ${user.phone_number || 'Не указан'}\n\n` +
      `📅 <b>Отправлено:</b> ${new Date().toLocaleString('ru-RU')}\n\n` +
      `🎉 Клиент уведомлен о отправке заказа!`;
  }

  /**
   * Отправка уведомлений о отправке заказа
   */
  static async sendNotifications(order: any, trackingNumber: string): Promise<void> {
    try {
      // Подготавливаем данные заказа для ReportService
      const orderForReport = {
        ...order,
        msg_id: order.msg_id ? BigInt(order.msg_id) : null
      };

      // Отправляем уведомления через ReportService
      // Это отправит уведомление клиенту о том, что заказ отправлен
      await ReportService.handleOrderStatusChange(orderForReport as any, 2); // previous status: processing

      logger.info('✅ Shipping notifications sent', { 
        orderId: order.id,
        trackingNumber: trackingNumber.substring(0, 5) + '...'
      }, 'Grammy');

    } catch (error) {
      logger.error('❌ Failed to send shipping notifications', { 
        error: (error as Error).message,
        orderId: order.id 
      }, 'Grammy');
    }
  }

  /**
   * Получение полного имени пользователя
   */
  static getFullName(user: any): string {
    const firstName = user.first_name || user.first_name_raw || '';
    const lastName = user.last_name || user.last_name_raw || '';
    const middleName = user.middle_name || '';
    
    return `${firstName} ${lastName} ${middleName}`.trim() || 'Не указано';
  }

  /**
   * Conversation для повторного ввода трек-номера
   */
  static async retryTrackingFlow(conversation: Conversation<ExtendedContext>, ctx: ExtendedContext): Promise<void> {
    logger.info('🔄 Starting retry tracking conversation', { userId: ctx.from?.id }, 'Grammy');

    await ctx.reply(
      '🔄 Введите новый трек-номер:\n\n' +
      '💡 <b>Поддерживаемые форматы:</b>\n' +
      '• Российская почта: RA123456789RU\n' +
      '• СДЭК: 1234567890\n' +
      '• Почта России: 12345678901234\n' +
      '• Другие службы: буквы и цифры',
      { parse_mode: 'HTML' }
    );

    // Переиспользуем основной flow
    await TrackingConversation.trackingFlow(conversation, ctx);
  }

  /**
   * Conversation для редактирования существующего трек-номера
   */
  static async editTrackingFlow(conversation: Conversation<ExtendedContext>, ctx: ExtendedContext, orderId: string): Promise<void> {
    logger.info('✏️ Starting edit tracking conversation', { 
      userId: ctx.from?.id,
      orderId 
    }, 'Grammy');

    try {
      // Получаем текущий заказ
      const order = await prisma.orders.findUnique({
        where: { id: BigInt(orderId) },
        include: { users: true }
      });

      if (!order) {
        await ctx.reply('❌ Заказ не найден.');
        return;
      }

      const currentTracking = order.tracking_number;
      
      await ctx.reply(
        `✏️ <b>Редактирование трек-номера</b>\n\n` +
        `📦 <b>Заказ №${orderId}</b>\n` +
        `🔢 <b>Текущий трек-номер:</b> <code>${currentTracking || 'Не указан'}</code>\n\n` +
        `📝 Введите новый трек-номер:`,
        { parse_mode: 'HTML' }
      );

      // Устанавливаем состояние для редактирования
      await RedisService.setUserState(`user_${ctx.chat?.id}_state`, {
        order_id: BigInt(orderId),
        mode: 'edit_tracking',
        timestamp: Date.now()
      }, 300); // 5 минут TTL

      // Переиспользуем основной flow
      await TrackingConversation.trackingFlow(conversation, ctx);

    } catch (error) {
      logger.error('❌ Error in edit tracking conversation', { 
        error: (error as Error).message,
        orderId,
        userId: ctx.from?.id 
      }, 'Grammy');

      await ctx.reply('😔 Произошла ошибка при редактировании трек-номера.');
    }
  }

  /**
   * Вспомогательная функция для создания состояния tracking conversation
   */
  static async createTrackingState(
    chatId: number, 
    orderId: string, 
    msgId: number, 
    hMsgId: number
  ): Promise<void> {
    const state = {
      order_id: BigInt(orderId),
      msg_id: msgId,
      h_msg: hMsgId,
      timestamp: Date.now(),
      mode: 'tracking'
    };

    await RedisService.setUserState(`user_${chatId}_state`, state, 300); // 5 минут TTL
    
    logger.info('✅ Tracking state created', { 
      orderId, 
      chatId,
      msgId,
      hMsgId 
    }, 'Grammy');
  }

  /**
   * Вспомогательная функция для получения информации о заказе
   */
  static async getOrderInfo(orderId: string): Promise<any | null> {
    try {
      const order = await prisma.orders.findUnique({
        where: { id: BigInt(orderId) },
        include: {
          users: true,
          order_items: {
            include: {
              products: true
            }
          }
        }
      });

      return order;
    } catch (error) {
      logger.error('❌ Failed to get order info', { 
        error: (error as Error).message,
        orderId 
      }, 'Grammy');
      return null;
    }
  }
}