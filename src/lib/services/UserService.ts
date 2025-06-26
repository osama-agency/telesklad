import { prisma } from '@/libs/prismaDb'

export class UserService {
  /**
   * Поиск или создание пользователя из Telegram
   */
  static async findOrCreateTelegramUser(tgUser: any) {
    const tgId = BigInt(tgUser.id)
    
    // Логируем данные пользователя для отладки
    console.log('📱 Telegram user data:', tgUser)
    
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
          photo_url: tgUser.photo_url || null,
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
          photo_url: tgUser.photo_url || user.photo_url,
          started: true,
          is_blocked: false,
          updated_at: new Date()
        }
      })
    }

    // Асинхронно обновляем фото профиля из Telegram (не блокируем основной процесс)
    if (!user.photo_url || (Date.now() - new Date(user.updated_at).getTime() > 24 * 60 * 60 * 1000)) {
      // Обновляем фото если его нет или если прошло больше суток с последнего обновления
      this.updateUserPhotoFromTelegram(tgId).catch(error => {
        console.error('Failed to update user photo:', error)
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

  /**
   * Получение и обновление фото профиля пользователя через Telegram Bot API
   */
  static async updateUserPhotoFromTelegram(tgId: string | bigint) {
    try {
      // Используем токен бота (можно использовать любой из наших ботов)
      const botToken = process.env.TELESKLAD_BOT_TOKEN || process.env.WEBAPP_TELEGRAM_BOT_TOKEN
      if (!botToken) {
        console.error('❌ Bot token not found for getting user photos')
        return null
      }

      // Получаем фотографии профиля пользователя через Bot API
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getUserProfilePhotos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: tgId.toString(),
          limit: 1 // Берем только последнее фото
        }),
      })

      if (!response.ok) {
        console.error('❌ Failed to get user profile photos:', await response.text())
        return null
      }

      const result = await response.json()
      
      if (!result.ok || !result.result.photos || result.result.photos.length === 0) {
        console.log('📷 No profile photos found for user:', tgId)
        return null
      }

      // Берем самую большую версию фото
      const photos = result.result.photos[0] // Первая (самая новая) фотография
      const largestPhoto = photos[photos.length - 1] // Самый большой размер
      
      // Получаем прямую ссылку на файл
      const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: largestPhoto.file_id
        }),
      })

      if (!fileResponse.ok) {
        console.error('❌ Failed to get file info:', await fileResponse.text())
        return null
      }

      const fileResult = await fileResponse.json()
      
      if (!fileResult.ok || !fileResult.result.file_path) {
        console.error('❌ No file path in response')
        return null
      }

      // Формируем URL для загрузки фото
      const photoUrl = `https://api.telegram.org/file/bot${botToken}/${fileResult.result.file_path}`
      
      // Обновляем photo_url в базе данных
      await prisma.users.update({
        where: { tg_id: BigInt(tgId) },
        data: {
          photo_url: photoUrl,
          updated_at: new Date()
        }
      })

      console.log('✅ User photo updated:', tgId, photoUrl)
      return photoUrl

    } catch (error) {
      console.error('❌ Error updating user photo:', error)
      return null
    }
  }
} 