import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { sendOrderNotification, sendTestOrderToPrivateChat, sendTestOrder } from '../services/telegramBot'

const router = Router()
const prisma = new PrismaClient()

// Создание нового заказа
router.post('/', async (req: Request, res: Response) => {
  try {
    const { supplier, totalCost, items, isUrgent = false } = req.body

    if (!supplier || !totalCost || !items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: supplier, totalCost, items'
      })
    }

    // Получаем следующий sequenceId
    const lastPurchase = await prisma.purchase.findFirst({
      orderBy: { sequenceId: 'desc' }
    })
    const sequenceId = (lastPurchase?.sequenceId || 0) + 1

    // Создаем заказ
    const purchase = await prisma.purchase.create({
      data: {
        sequenceId,
        supplier,
        totalCost: parseFloat(totalCost.toString()),
        isUrgent,
        status: 'pending',
        items: {
          create: items.map((item: any) => ({
            name: item.name,
            quantity: parseInt(item.quantity.toString()),
            price: parseFloat(item.price.toString()),
            total: parseFloat(item.total.toString())
          }))
        }
      },
      include: {
        items: true
      }
    })

    console.log('✅ Заказ создан:', purchase.id)

    // Отправляем в Telegram
    const orderData = {
      id: purchase.id,
      sequenceId: purchase.sequenceId,
      status: purchase.status as any,
      totalCost: parseFloat(purchase.totalCost.toString()),
      isUrgent: purchase.isUrgent,
      supplier: purchase.supplier || '',
      items: purchase.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price.toString()),
        total: parseFloat(item.total.toString())
      })),
      createdAt: purchase.createdAt
    }

    const telegramResult = await sendOrderNotification(orderData)

    if (telegramResult.success && telegramResult.messageId) {
      // Сохраняем message_id в базе
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { telegramMessageId: telegramResult.messageId }
      })
      console.log('✅ Уведомление отправлено в Telegram, message_id сохранен')
    }

    res.status(201).json({
      success: true,
      data: purchase,
      telegram: telegramResult
    })

  } catch (error) {
    console.error('❌ Ошибка создания заказа:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Тестирование отправки всем получателям
router.post('/test-all-recipients', async (req: Request, res: Response) => {
  try {
    console.log('🧪 Запрос на тестирование отправки всем получателям')

    const result = await sendTestOrder()

    if (result.success) {
      res.json({
        success: true,
        message: 'Тестовый заказ отправлен всем получателям',
        results: result.results
      })
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Ошибка отправки тестового заказа',
        results: result.results
      })
    }
  } catch (error) {
    console.error('❌ Ошибка в /test-all-recipients:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Тестирование WebApp кнопок в приватном чате
router.post('/test-webapp/:chatId', async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params

    console.log('🧪 Запрос на тестирование WebApp кнопок в приватном чате:', chatId)

    const result = await sendTestOrderToPrivateChat(chatId)

    if (result.success) {
      res.json({
        success: true,
        message: 'Тестовый заказ с WebApp кнопкой отправлен в приватный чат',
        chatId
      })
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Ошибка отправки тестового заказа'
      })
    }
  } catch (error) {
    console.error('❌ Ошибка в /test-webapp:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Получение заказа по ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: { items: true }
    })

    if (!purchase) {
      return res.status(404).json({ success: false, error: 'Order not found' })
    }

    res.json({ success: true, data: purchase })
  } catch (error) {
    console.error('❌ Ошибка получения заказа:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Обновление товаров в заказе
router.put('/:id/items', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { items } = req.body

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'Items array is required' })
    }

    // Удаляем старые товары и создаем новые
    await prisma.purchaseItem.deleteMany({
      where: { purchaseId: id }
    })

    const updatedPurchase = await prisma.purchase.update({
      where: { id },
      data: {
        items: {
          create: items.map((item: any) => ({
            name: item.name,
            quantity: parseInt(item.quantity.toString()),
            price: parseFloat(item.price.toString()),
            total: parseFloat(item.total.toString())
          }))
        }
      },
      include: { items: true }
    })

    console.log('✅ Товары в заказе', id, 'обновлены')

    res.json({ success: true, data: updatedPurchase })
  } catch (error) {
    console.error('❌ Ошибка обновления товаров:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Обновление статуса заказа
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' })
    }

    const updatedPurchase = await prisma.purchase.update({
      where: { id },
      data: {
        status,
        statusUpdatedAt: new Date()
      },
      include: { items: true }
    })

    console.log('✅ Статус заказа', id, 'обновлен на', status)

    res.json({ success: true, data: updatedPurchase })
  } catch (error) {
    console.error('❌ Ошибка обновления статуса:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router
