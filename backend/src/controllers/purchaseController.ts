import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { sendOrderNotification } from '../services/telegramBot'

const prisma = new PrismaClient()

// GET /api/purchases - получить все заказы
export const getAllPurchases = async (req: Request, res: Response) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({
      success: true,
      data: purchases
    })
  } catch (error) {
    console.error('❌ Ошибка получения заказов:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch purchases'
    })
  }
}

// GET /api/purchases/:id - получить заказ по ID
export const getPurchaseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        items: true
      }
    })

    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found'
      })
    }

    res.json({
      success: true,
      data: purchase
    })
  } catch (error) {
    console.error('❌ Ошибка получения заказа:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch purchase'
    })
  }
}

// POST /api/purchases - создать новый заказ
export const createPurchase = async (req: Request, res: Response) => {
  try {
    const {
      totalCost,
      logisticsCost = 0,
      isUrgent = false,
      supplier,
      items
    } = req.body

    // Валидация
    if (!totalCost || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: totalCost, items'
      })
    }

    // Создаем заказ с товарами
    const purchase = await prisma.purchase.create({
      data: {
        totalCost,
        logisticsCost,
        isUrgent,
        supplier,
        status: 'pending',
        items: {
          create: items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            productId: item.productId || null
          }))
        }
      },
      include: {
        items: true
      }
    })

    console.log('✅ Заказ создан:', purchase.id)

    // Отправляем уведомление в Telegram
    const orderData = {
      id: purchase.id,
      sequenceId: (purchase as any).sequenceId,
      status: purchase.status as any,
      totalCost: Number(purchase.totalCost),
      isUrgent: purchase.isUrgent,
      supplier: purchase.supplier || undefined,
      items: purchase.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.total)
      })),
      createdAt: purchase.createdAt
    }

        const telegramResult = await sendOrderNotification(orderData)

    if (telegramResult.success && telegramResult.messageId) {
      // Сохраняем message_id в базе данных
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { telegramMessageId: telegramResult.messageId }
      })
      console.log('✅ Уведомление отправлено в Telegram, message_id сохранен')
    } else {
      console.error('❌ Ошибка отправки в Telegram:', telegramResult.error)
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
      error: 'Failed to create purchase'
    })
  }
}

// PATCH /api/purchases/:id/status - обновить статус заказа
export const updatePurchaseStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    // Валидация статуса
    const validStatuses = [
      'pending', 'confirmed', 'ready_for_payment', 'paid',
      'in_transit', 'delivering', 'received', 'cancelled'
    ]

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      })
    }

    // Обновляем статус
    const purchase = await prisma.purchase.update({
      where: { id },
      data: {
        status,
        statusUpdatedAt: new Date()
      },
      include: {
        items: true
      }
    }) as any

    console.log(`✅ Статус заказа ${id} обновлен на ${status}`)

    // Если есть telegramMessageId, обновляем сообщение в Telegram
    if (purchase.telegramMessageId) {
      const { updateOrderMessage } = await import('../services/telegramBot')

      const orderData = {
        id: purchase.id,
        sequenceId: purchase.sequenceId,
        status: status as any,
        totalCost: Number(purchase.totalCost),
        isUrgent: purchase.isUrgent,
        supplier: purchase.supplier || undefined,
        items: purchase.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.total)
        })),
        createdAt: purchase.createdAt
      }

      const telegramResult = await updateOrderMessage(
        process.env.TELEGRAM_CHAT_ID || '-4729817036',
        purchase.telegramMessageId,
        orderData
      )

      if (telegramResult.success) {
        console.log('✅ Сообщение в Telegram обновлено')
      } else {
        console.error('❌ Ошибка обновления сообщения в Telegram:', telegramResult.error)
      }
    }

    res.json({
      success: true,
      data: purchase
    })
  } catch (error) {
    console.error('❌ Ошибка обновления статуса:', error)

    if ((error as any).code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found'
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update purchase status'
    })
  }
}

// PUT /api/purchases/:id - обновить заказ
export const updatePurchase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      totalCost,
      logisticsCost,
      isUrgent,
      supplier,
      status
    } = req.body

    const updateData: any = {}

    if (totalCost !== undefined) updateData.totalCost = totalCost
    if (logisticsCost !== undefined) updateData.logisticsCost = logisticsCost
    if (isUrgent !== undefined) updateData.isUrgent = isUrgent
    if (supplier !== undefined) updateData.supplier = supplier
    if (status !== undefined) {
      updateData.status = status
      updateData.statusUpdatedAt = new Date()
    }

    const purchase = await prisma.purchase.update({
      where: { id },
      data: updateData,
      include: {
        items: true
      }
    })

    res.json({
      success: true,
      data: purchase
    })
  } catch (error) {
    console.error('❌ Ошибка обновления заказа:', error)

    if ((error as any).code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found'
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update purchase'
    })
  }
}

// PUT /api/purchases/:id/items - обновить товары в заказе
export const updatePurchaseItems = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { items, totalCost } = req.body

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required'
      })
    }

    // Обновляем товары в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Обновляем каждый товар
      for (const item of items) {
        await tx.purchaseItem.update({
          where: { id: item.id },
          data: {
            quantity: item.quantity,
            price: item.price,
            total: item.total
          }
        })
      }

      // Обновляем общую сумму заказа
      const purchase = await tx.purchase.update({
        where: { id },
        data: { totalCost },
        include: { items: true }
      })

      return purchase
    })

    console.log(`✅ Товары в заказе ${id} обновлены`)

    // Если есть telegramMessageId, обновляем сообщение в Telegram
    if ((result as any).telegramMessageId) {
      const { updateOrderMessage } = await import('../services/telegramBot')

      const orderData = {
        id: result.id,
        sequenceId: (result as any).sequenceId,
        status: result.status as any,
        totalCost: Number(result.totalCost),
        isUrgent: result.isUrgent,
        supplier: result.supplier || undefined,
        items: result.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.total)
        })),
        createdAt: result.createdAt
      }

      const telegramResult = await updateOrderMessage(
        process.env.TELEGRAM_CHAT_ID || '-4729817036',
        (result as any).telegramMessageId,
        orderData
      )

      if (telegramResult.success) {
        console.log('✅ Сообщение в Telegram обновлено')
      } else {
        console.error('❌ Ошибка обновления сообщения в Telegram:', telegramResult.error)
      }
    }

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('❌ Ошибка обновления товаров:', error)

    if ((error as any).code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Purchase or item not found'
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update purchase items'
    })
  }
}

// DELETE /api/purchases/:id - удалить заказ
export const deletePurchase = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    await prisma.purchase.delete({
      where: { id }
    })

    console.log(`✅ Заказ ${id} удален`)

    res.json({
      success: true,
      message: 'Purchase deleted successfully'
    })
  } catch (error) {
    console.error('❌ Ошибка удаления заказа:', error)

    if ((error as any).code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found'
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete purchase'
    })
  }
}
