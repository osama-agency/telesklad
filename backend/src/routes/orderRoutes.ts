import express from 'express';
import {
  getAllOrders,
  getOrderStatistics,
  searchOrdersByCustomer,
  getOrdersByStatus,
  getOrderById,
  createOrder,
  addOrderItem,
  updateOrderStatus,
  deleteOrder
} from '../controllers/orderController';

const router = express.Router();

// GET /api/orders - получить все заказы
router.get('/', getAllOrders);

// GET /api/orders/statistics - получить статистику заказов
router.get('/statistics', getOrderStatistics);

// GET /api/orders/search - поиск заказов по клиенту
router.get('/search', searchOrdersByCustomer);

// GET /api/orders/status/:status - получить заказы по статусу
router.get('/status/:status', getOrdersByStatus);

// GET /api/orders/:id - получить заказ по ID
router.get('/:id', getOrderById);

// POST /api/orders - создать новый заказ
router.post('/', createOrder);

// POST /api/orders/:id/items - добавить товар к заказу
router.post('/:id/items', addOrderItem);

// PATCH /api/orders/:id/status - обновить статус заказа
router.patch('/:id/status', updateOrderStatus);

// DELETE /api/orders/:id - удалить заказ
router.delete('/:id', deleteOrder);

export default router;
