import express from 'express';

import {
  getProducts,
  getProductById,
  updateProductCost,
  hideProduct,
  hideProductByName,
  getHiddenProducts,
  updateProductStock,
  updateProductPrice,
  updateProductAnalytics
} from '../controllers/productController';

const router = express.Router();

// GET /api/products - получить все товары
router.get('/', getProducts);

// GET /api/products/hidden - получить список скрытых товаров
router.get('/hidden', getHiddenProducts);

// GET /api/products/:id - получить товар по ID
router.get('/:id', getProductById);

// PUT /api/products/:id/cost - обновить себестоимость товара
router.put('/:id/cost', updateProductCost);

// PUT /api/products/:id/stock - обновить остаток товара
router.put('/:id/stock', updateProductStock);

// PATCH /api/products/:id/stock - операции с остатком (add/subtract)
router.patch('/:id/stock', updateProductStock);

// PUT /api/products/:id/price - обновить цену товара
router.put('/:id/price', updateProductPrice);

// PUT /api/products/:id/analytics - обновить аналитические данные товара
router.put('/:id/analytics', updateProductAnalytics);

// PATCH /api/products/:id/hide - скрыть/показать товар по ID
router.patch('/:id/hide', hideProduct);

// POST /api/products/hide - скрыть/показать товар по имени
router.post('/hide', hideProductByName);

export default router;
