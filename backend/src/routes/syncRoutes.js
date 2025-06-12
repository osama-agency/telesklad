const express = require('express');
const SyncController = require('../controllers/syncController');

const router = express.Router();

/**
 * @route POST /api/sync/orders
 * @desc Sync orders from external API for a specific user
 * @body {number} userId - User ID (required)
 * @access Private
 */
router.post('/orders', SyncController.syncOrdersForUser);

/**
 * @route GET /api/sync/orders/:userId
 * @desc Get synced orders for a user with optional filtering and pagination
 * @param {string} userId - User ID
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} dateFrom - Start date filter (YYYY-MM-DD)
 * @query {string} dateTo - End date filter (YYYY-MM-DD)
 * @query {string} sortBy - Sort field (default: paid_at)
 * @query {string} sortOrder - Sort order ASC/DESC (default: DESC)
 * @access Private
 */
router.get('/orders/:userId', SyncController.getSyncedOrders);

/**
 * @route POST /api/sync/auto
 * @desc Manually trigger automatic sync for all users
 * @access Private (Admin only)
 */
router.post('/auto', SyncController.triggerAutoSync);

module.exports = router;
