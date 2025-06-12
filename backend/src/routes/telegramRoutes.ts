import { Router, Request, Response } from 'express'
import { sendTestOrder } from '../services/telegramBot'

const router = Router()

// POST /api/telegram/test - отправить тестовый заказ в Telegram
router.post('/test', async (req: Request, res: Response) => {
  try {
    console.log('🧪 Отправка тестового заказа в Telegram...')

    const result = await sendTestOrder()

    if (result.success) {
      res.json({
        success: true,
        message: 'Тестовый заказ отправлен в Telegram',
        data: result
      })
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Failed to send test order'
      })
    }
  } catch (error) {
    console.error('❌ Ошибка отправки тестового заказа:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// GET /api/telegram/status - проверить статус Telegram бота
router.get('/status', async (req: Request, res: Response) => {
  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8159006212:AAEjYn-bU-Nh89crlue9GUJKuv6pV4Z986M'

    // Проверяем статус бота
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`)
    const data = await response.json() as any

    if (data.ok) {
      res.json({
        success: true,
        message: 'Telegram bot is active',
        data: {
          bot: data.result,
          chatId: process.env.TELEGRAM_CHAT_ID || '-4729817036'
        }
      })
    } else {
      res.status(500).json({
        success: false,
        error: 'Telegram bot is not accessible',
        details: data
      })
    }
  } catch (error) {
    console.error('❌ Ошибка проверки статуса бота:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to check bot status'
    })
  }
})

export default router
