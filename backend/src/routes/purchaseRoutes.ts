import { Router } from 'express'
import {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchaseStatus,
  updatePurchase,
  updatePurchaseItems,
  deletePurchase
} from '../controllers/purchaseController'

import { sendTestOrderToPrivateChat, sendTestOrder } from '../services/telegramBot'

const router = Router()

// GET /api/purchases - получить все заказы
router.get('/', getAllPurchases)

// GET /api/purchases/:id - получить заказ по ID
router.get('/:id', getPurchaseById)

// POST /api/purchases - создать новый заказ
router.post('/', createPurchase)

// PATCH /api/purchases/:id/status - обновить статус заказа
router.patch('/:id/status', updatePurchaseStatus)

// PUT /api/purchases/:id - обновить заказ
router.put('/:id', updatePurchase)

// PUT /api/purchases/:id/items - обновить товары в заказе
router.put('/:id/items', updatePurchaseItems)

// DELETE /api/purchases/:id - удалить заказ
router.delete('/:id', deletePurchase)

// POST /api/purchases/test-all-recipients - тестирование отправки всем получателям
router.post('/test-all-recipients', async (req, res) => {
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

// POST /api/purchases/test-webapp/:chatId - тестирование WebApp кнопок в приватном чате
router.post('/test-webapp/:chatId', async (req, res) => {
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

export default router
