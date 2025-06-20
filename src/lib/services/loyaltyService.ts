import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LoyaltyService {
  
  /**
   * Добавляет бонусы пользователю
   */
  static async addBonus(
    userId: bigint,
    amount: number,
    reason: string,
    sourceType?: string,
    sourceId?: bigint
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Создаем запись в логе бонусов
        const bonusLog = await tx.bonus_logs.create({
          data: {
            user_id: userId,
            bonus_amount: amount,
            reason,
            source_type: sourceType,
            source_id: sourceId,
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        // Обновляем баланс пользователя
        const user = await tx.users.update({
          where: { id: userId },
          data: {
            bonus_balance: {
              increment: amount
            }
          }
        });

        return { bonusLog, user };
      });
    } catch (error) {
      console.error('Ошибка добавления бонусов:', error);
      throw error;
    }
  }

  /**
   * Списывает бонусы у пользователя
   */
  static async deductBonus(
    userId: bigint,
    amount: number,
    reason: string,
    sourceType?: string,
    sourceId?: bigint
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Проверяем достаточность бонусов
        const user = await tx.users.findUnique({
          where: { id: userId }
        });

        if (!user || user.bonus_balance < amount) {
          throw new Error('Недостаточно бонусов на балансе');
        }

        // Создаем запись в логе бонусов (отрицательная сумма)
        const bonusLog = await tx.bonus_logs.create({
          data: {
            user_id: userId,
            bonus_amount: -amount,
            reason,
            source_type: sourceType,
            source_id: sourceId,
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        // Обновляем баланс пользователя
        const updatedUser = await tx.users.update({
          where: { id: userId },
          data: {
            bonus_balance: {
              decrement: amount
            }
          }
        });

        return { bonusLog, user: updatedUser };
      });
    } catch (error) {
      console.error('Ошибка списания бонусов:', error);
      throw error;
    }
  }

  /**
   * Начисляет кэшбек за заказ
   */
  static async processOrderCashback(orderId: bigint, userId: bigint) {
    try {
      // Получаем заказ с товарами
      const order = await prisma.orders.findUnique({
        where: { id: orderId },
        include: {
          order_items: true,
          users: {
            include: {
              account_tiers: true
            }
          }
        }
      });

      if (!order || !order.users.account_tiers) {
        return null;
      }

      // Получаем настройки
      const bonusThresholdSetting = await prisma.settings.findUnique({
        where: { variable: 'bonus_threshold' }
      });
      
      const deliveryPriceSetting = await prisma.settings.findUnique({
        where: { variable: 'delivery_price' }
      });

      const bonusThreshold = parseInt(bonusThresholdSetting?.value || '5000');
      const deliveryPrice = parseInt(deliveryPriceSetting?.value || '500');

      // Рассчитываем сумму без доставки
      const totalAmount = parseFloat(order.total_amount.toString());
      const subtotal = order.has_delivery ? totalAmount - deliveryPrice : totalAmount;

      // Проверяем минимальную сумму для кэшбека
      if (subtotal < bonusThreshold) {
        return null;
      }

      // Рассчитываем кэшбек (округляем до 50₽)
      const cashbackPercent = order.users.account_tiers.bonus_percentage;
      const cashbackAmount = Math.round((subtotal * cashbackPercent / 100) / 50) * 50;

      if (cashbackAmount > 0) {
        return await this.addBonus(
          userId,
          cashbackAmount,
          'order',
          'orders',
          orderId
        );
      }

      return null;
    } catch (error) {
      console.error('Ошибка начисления кэшбека:', error);
      throw error;
    }
  }

  /**
   * Проверяет и обновляет уровень лояльности пользователя
   */
  static async checkAndUpgradeAccountTier(userId: bigint) {
    try {
      return await prisma.$transaction(async (tx) => {
        const user = await tx.users.findUnique({
          where: { id: userId },
          include: {
            account_tiers: true
          }
        });

        if (!user) {
          throw new Error('Пользователь не найден');
        }

        // Получаем все уровни лояльности
        const allTiers = await tx.account_tiers.findMany({
          orderBy: { order_threshold: 'asc' }
        });

        // Если у пользователя нет уровня, присваиваем первый
        if (!user.account_tiers) {
          const firstTier = allTiers[0];
          if (firstTier && user.order_count >= firstTier.order_threshold) {
            return await tx.users.update({
              where: { id: userId },
              data: {
                account_tier_id: firstTier.id
              }
            });
          }
          return user;
        }

        // Ищем следующий уровень
        const nextTier = allTiers.find(tier => 
          tier.order_threshold > user.account_tiers!.order_threshold &&
          user.order_count >= tier.order_threshold
        );

        if (nextTier) {
          return await tx.users.update({
            where: { id: userId },
            data: {
              account_tier_id: nextTier.id
            }
          });
        }

        return user;
      });
    } catch (error) {
      console.error('Ошибка обновления уровня лояльности:', error);
      throw error;
    }
  }

  /**
   * Увеличивает счетчик заказов и проверяет уровень лояльности
   */
  static async incrementOrderCount(userId: bigint, orderTotal: number) {
    try {
      // Получаем настройки
      const bonusThresholdSetting = await prisma.settings.findUnique({
        where: { variable: 'bonus_threshold' }
      });
      
      const bonusThreshold = parseInt(bonusThresholdSetting?.value || '5000');

      // Увеличиваем счетчик заказов только если сумма больше порога
      if (orderTotal >= bonusThreshold) {
        await prisma.users.update({
          where: { id: userId },
          data: {
            order_count: {
              increment: 1
            }
          }
        });

        // Проверяем и обновляем уровень лояльности
        return await this.checkAndUpgradeAccountTier(userId);
      }

      return null;
    } catch (error) {
      console.error('Ошибка увеличения счетчика заказов:', error);
      throw error;
    }
  }

  /**
   * Валидирует возможность потратить бонусы
   */
  static async validateBonusUsage(userId: bigint, bonusAmount: number, orderTotal: number) {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('Пользователь не найден');
      }

      // Проверяем достаточность бонусов
      if (user.bonus_balance < bonusAmount) {
        throw new Error('Недостаточно бонусов на балансе');
      }

      // Проверяем кратность 100
      if (bonusAmount % 100 !== 0) {
        throw new Error('Бонусы должны быть кратны 100₽');
      }

      // Проверяем минимальную сумму
      if (bonusAmount < 100) {
        throw new Error('Минимальная сумма для трат - 100₽');
      }

      // Проверяем, что не тратим больше стоимости товаров
      if (bonusAmount > orderTotal) {
        throw new Error('Нельзя потратить больше стоимости заказа');
      }

      return true;
    } catch (error) {
      console.error('Ошибка валидации бонусов:', error);
      throw error;
    }
  }
}

export default LoyaltyService; 