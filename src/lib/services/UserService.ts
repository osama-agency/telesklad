import { prisma } from '@/libs/prismaDb'

export class UserService {
  /**
   * Поиск или создание пользователя из Telegram
   */
  static async findOrCreateTelegramUser(tgUser: any) {
    const tgId = BigInt(tgUser.id)
    
    let user = await prisma.users.findUnique({
      where: { tg_id: tgId }
    })

    if (!user) {
      user = await prisma.users.create({
        data: {
          tg_id: tgId,
          email: `telegram_${tgUser.id}@telegram.com`,
          first_name_raw: tgUser.first_name || '',
          last_name_raw: tgUser.last_name || '',
          username: tgUser.username || null,
          started: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      })
      
      console.log(`✅ New user created: ${user.id} (tg_id: ${tgId})`)
    } else {
      // Обновляем информацию при каждом входе
      user = await prisma.users.update({
        where: { tg_id: tgId },
        data: {
          first_name_raw: tgUser.first_name || user.first_name_raw,
          last_name_raw: tgUser.last_name || user.last_name_raw,
          username: tgUser.username || user.username,
          started: true,
          is_blocked: false,
          updated_at: new Date()
        }
      })
    }

    return user
  }

  /**
   * Получение пользователя по Telegram ID
   */
  static async getUserByTelegramId(tgId: string | bigint) {
    return await prisma.users.findUnique({
      where: { tg_id: BigInt(tgId) },
      include: {
        orders: {
          orderBy: { created_at: 'desc' },
          take: 10
        }
      }
    })
  }

  /**
   * Обновление статуса пользователя при команде /start
   */
  static async handleTelegramStart(tgUser: any) {
    const user = await this.findOrCreateTelegramUser(tgUser)
    
    // Отмечаем, что пользователь активен
    await prisma.users.update({
      where: { id: user.id },
      data: {
        started: true,
        is_blocked: false,
        updated_at: new Date()
      }
    })

    return user
  }

  /**
   * Получение пользователя по ID
   */
  static async getUserById(id: number | bigint) {
    return await prisma.users.findUnique({
      where: { id: BigInt(id) }
    })
  }

  /**
   * Валидация Telegram initData
   */
  static validateTelegramInitData(initData: string): boolean {
    const crypto = require('crypto')
    const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.WEBAPP_TELEGRAM_BOT_TOKEN
    
    if (!botToken) {
      console.error('❌ Bot token not found for validation')
      return false
    }

    try {
      const params = new URLSearchParams(initData)
      const hash = params.get('hash')
      params.delete('hash')
      
      const dataCheckString = Array.from(params.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n')
      
      const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
      const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')
      
      return calculatedHash === hash
    } catch (error) {
      console.error('❌ Error validating Telegram initData:', error)
      return false
    }
  }

  /**
   * Парсинг данных пользователя из initData
   */
  static parseTelegramInitData(initData: string) {
    try {
      const params = new URLSearchParams(initData)
      const userParam = params.get('user')
      
      if (!userParam) {
        throw new Error('No user data in initData')
      }
      
      return JSON.parse(userParam)
    } catch (error) {
      console.error('❌ Error parsing Telegram initData:', error)
      throw error
    }
  }
} 