const express = require('express');
const WarehouseOrderController = require('../controllers/warehouseOrderController');
const { validateWarehouseOrder } = require('../middleware/validation');

const router = express.Router();

/**
 * @route GET /api/warehouse-orders
 * @desc Get all warehouse orders with optional filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} status - Filter by order status
 * @query {string} supplier - Filter by supplier name
 * @query {string} dateFrom - Start date filter (YYYY-MM-DD)
 * @query {string} dateTo - End date filter (YYYY-MM-DD)
 * @query {string} sortBy - Sort field (default: created_at)
 * @query {string} sortOrder - Sort order ASC/DESC (default: DESC)
 * @access Public
 */
router.get('/', WarehouseOrderController.getAllWarehouseOrders);

/**
 * @route GET /api/warehouse-orders/overdue
 * @desc Get overdue warehouse orders
 * @access Public
 */
router.get('/overdue', WarehouseOrderController.getOverdueOrders);

/**
 * @route GET /api/warehouse-orders/statistics
 * @desc Get warehouse order statistics
 * @query {string} dateFrom - Start date filter (YYYY-MM-DD)
 * @query {string} dateTo - End date filter (YYYY-MM-DD)
 * @access Public
 */
router.get('/statistics', WarehouseOrderController.getWarehouseOrderStatistics);

/**
 * @route GET /api/warehouse-orders/delivery-performance
 * @desc Get delivery performance statistics
 * @query {string} dateFrom - Start date filter (YYYY-MM-DD)
 * @query {string} dateTo - End date filter (YYYY-MM-DD)
 * @access Public
 */
router.get('/delivery-performance', WarehouseOrderController.getDeliveryPerformance);

/**
 * @route GET /api/warehouse-orders/supplier/:supplier
 * @desc Get orders by supplier
 * @param {string} supplier - Supplier name
 * @access Public
 */
router.get('/supplier/:supplier', WarehouseOrderController.getOrdersBySupplier);

/**
 * @route GET /api/warehouse-orders/:id
 * @desc Get single warehouse order by ID
 * @param {string} id - Warehouse order ID
 * @access Public
 */
router.get('/:id', WarehouseOrderController.getWarehouseOrderById);

/**
 * @route POST /api/warehouse-orders
 * @desc Create new warehouse order
 * @body {string} supplier_name - Supplier name (required)
 * @body {string} supplier_contact - Supplier contact (required)
 * @body {string} order_date - Order date (optional, defaults to now)
 * @body {string} expected_delivery_date - Expected delivery date
 * @body {string} invoice_number - Invoice number
 * @body {string} tracking_number - Tracking number
 * @body {string} notes - Order notes
 * @body {array} items - Array of order items (required)
 * @body {number} items[].product_id - Product ID (required)
 * @body {number} items[].quantity - Quantity (required)
 * @body {number} items[].unit_cost - Unit cost (required)
 * @access Private
 */
router.post('/', WarehouseOrderController.createWarehouseOrder);

/**
 * @route POST /api/warehouse-orders/:id/receive
 * @desc Mark warehouse order as received
 * @param {string} id - Warehouse order ID
 * @body {string} actual_delivery_date - Actual delivery date (optional)
 * @body {array} items - Array of received items with quantities (optional)
 * @body {number} items[].product_id - Product ID
 * @body {number} items[].received_quantity - Received quantity
 * @access Private
 */
router.post('/:id/receive', WarehouseOrderController.markAsReceived);

/**
 * @route PUT /api/warehouse-orders/:id
 * @desc Update warehouse order
 * @param {string} id - Warehouse order ID
 * @body Warehouse order update data
 * @access Private
 */
router.put('/:id', WarehouseOrderController.updateWarehouseOrder);

/**
 * @route PATCH /api/warehouse-orders/:id/status
 * @desc Update warehouse order status
 * @param {string} id - Warehouse order ID
 * @body {string} status - New status (Ожидается, Получено, Отменено)
 * @access Private
 */
router.patch('/:id/status', WarehouseOrderController.updateWarehouseOrderStatus);

/**
 * @route DELETE /api/warehouse-orders/:id
 * @desc Delete warehouse order
 * @param {string} id - Warehouse order ID
 * @access Private
 */
router.delete('/:id', WarehouseOrderController.deleteWarehouseOrder);

module.exports = router;
