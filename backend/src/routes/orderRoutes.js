const express = require('express');
const OrderController = require('../controllers/orderController');
const { orderValidation } = require('../middleware/validation');

const router = express.Router();

/**
 * @route GET /api/orders
 * @desc Get all customer orders with optional filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} status - Filter by order status
 * @query {string} customer - Filter by customer name
 * @query {string} dateFrom - Start date filter (YYYY-MM-DD)
 * @query {string} dateTo - End date filter (YYYY-MM-DD)
 * @query {string} sortBy - Sort field (default: created_at)
 * @query {string} sortOrder - Sort order ASC/DESC (default: DESC)
 * @access Public
 */
router.get('/', OrderController.getAllOrders);

/**
 * @route GET /api/orders/statistics
 * @desc Get order statistics
 * @query {string} dateFrom - Start date filter (YYYY-MM-DD)
 * @query {string} dateTo - End date filter (YYYY-MM-DD)
 * @access Public
 */
router.get('/statistics', OrderController.getOrderStatistics);

/**
 * @route GET /api/orders/search
 * @desc Search orders by customer name
 * @query {string} customer - Customer name to search for (required)
 * @access Public
 */
router.get('/search', OrderController.searchOrdersByCustomer);

/**
 * @route GET /api/orders/status/:status
 * @desc Get orders by specific status
 * @param {string} status - Order status (Новый, Оплачен, Доставлен, Отменён)
 * @access Public
 */
router.get('/status/:status', OrderController.getOrdersByStatus);

/**
 * @route GET /api/orders/:id
 * @desc Get single order by ID
 * @param {string} id - Order ID
 * @access Public
 */
router.get('/:id', OrderController.getOrderById);

/**
 * @route POST /api/orders
 * @desc Create new customer order
 * @body {string} customer_name - Customer name (required)
 * @body {string} customer_contact - Customer contact (required)
 * @body {string} order_date - Order date (optional, defaults to now)
 * @body {string} notes - Order notes
 * @body {array} items - Array of order items (required)
 * @body {number} items[].product_id - Product ID (required)
 * @body {number} items[].quantity - Quantity (required)
 * @body {number} items[].unit_price - Unit price (optional, uses product price)
 * @body {number} items[].discount_amount - Discount amount (optional)
 * @access Private
 */
router.post('/', orderValidation.create, OrderController.createOrder);

/**
 * @route POST /api/orders/:id/items
 * @desc Add item to existing order
 * @param {string} id - Order ID
 * @body {number} product_id - Product ID (required)
 * @body {number} quantity - Quantity (required)
 * @body {number} unit_price - Unit price (optional)
 * @body {number} discount_amount - Discount amount (optional)
 * @access Private
 */
router.post('/:id/items', OrderController.addOrderItem);

/**
 * @route PATCH /api/orders/:id/status
 * @desc Update order status
 * @param {string} id - Order ID
 * @body {string} status - New status (Новый, Оплачен, Доставлен, Отменён)
 * @access Private
 */
router.patch('/:id/status', orderValidation.updateStatus, OrderController.updateOrderStatus);

/**
 * @route DELETE /api/orders/:id
 * @desc Delete order
 * @param {string} id - Order ID
 * @access Private
 */
router.delete('/:id', OrderController.deleteOrder);

module.exports = router;
