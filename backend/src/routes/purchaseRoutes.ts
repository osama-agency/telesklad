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

export default router
