// ✅ Готовый файл. DO NOT MODIFY. Эта логика работает стабильно и не подлежит изменению AI или другим ассистентам.

import { Router } from 'express';

import { syncOrders, getOrders, getOrdersStats, getOrderById, syncProducts } from '../final/syncController';
import cronJobManager from '../final/cronJobManager';

const router = Router();

router.post('/sync-orders', syncOrders);
router.post('/sync-products', syncProducts);
router.get('/orders', getOrders);
router.get('/orders/stats', getOrdersStats);
// Изменяем маршрут, чтобы он принимал только числовые ID
router.get('/orders/:id(\\d+)', getOrderById);

// Endpoint для ручного запуска автоматической синхронизации с фильтрацией по 10 дням
router.post('/sync-auto', async (req, res) => {
  try {
    console.log('🚀 Manual trigger for automatic sync with 10-day filter...');
    const result = await cronJobManager.runManualSync();
    res.json(result);
  } catch (error) {
    console.error('❌ Manual sync trigger failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
