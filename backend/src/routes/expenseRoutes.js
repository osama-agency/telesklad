const express = require('express');
const ExpenseController = require('../controllers/expenseController');
const { validateExpense } = require('../middleware/validation');

const router = express.Router();

/**
 * @route GET /api/expenses
 * @desc Get all expenses with optional filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} category - Filter by expense category
 * @query {string} vendor - Filter by vendor name
 * @query {string} dateFrom - Start date filter (YYYY-MM-DD)
 * @query {string} dateTo - End date filter (YYYY-MM-DD)
 * @query {boolean} taxDeductible - Filter by tax deductible status
 * @query {string} paymentMethod - Filter by payment method
 * @query {string} search - Search in description or vendor
 * @query {string} sortBy - Sort field (default: date)
 * @query {string} sortOrder - Sort order ASC/DESC (default: DESC)
 * @access Public
 */
router.get('/', ExpenseController.getAllExpenses);

/**
 * @route GET /api/expenses/statistics
 * @desc Get expense statistics and analytics
 * @query {string} dateFrom - Start date filter (YYYY-MM-DD)
 * @query {string} dateTo - End date filter (YYYY-MM-DD)
 * @access Public
 */
router.get('/statistics', ExpenseController.getExpenseStatistics);

/**
 * @route GET /api/expenses/monthly-totals
 * @desc Get monthly expense totals
 * @query {number} year - Year filter (optional)
 * @access Public
 */
router.get('/monthly-totals', ExpenseController.getMonthlyTotals);

/**
 * @route GET /api/expenses/tax-deductible
 * @desc Get tax deductible expenses
 * @query {string} dateFrom - Start date filter (YYYY-MM-DD)
 * @query {string} dateTo - End date filter (YYYY-MM-DD)
 * @access Public
 */
router.get('/tax-deductible', ExpenseController.getTaxDeductibleExpenses);

/**
 * @route GET /api/expenses/search
 * @desc Search expenses by description or vendor
 * @query {string} q - Search query (required)
 * @access Public
 */
router.get('/search', ExpenseController.searchExpenses);

/**
 * @route GET /api/expenses/top-vendors
 * @desc Get top vendors by expense amount
 * @query {number} limit - Number of vendors to return (default: 10)
 * @query {string} dateFrom - Start date filter (YYYY-MM-DD)
 * @query {string} dateTo - End date filter (YYYY-MM-DD)
 * @access Public
 */
router.get('/top-vendors', ExpenseController.getTopVendors);

/**
 * @route GET /api/expenses/categories
 * @desc Get expense categories with totals
 * @query {string} dateFrom - Start date filter (YYYY-MM-DD)
 * @query {string} dateTo - End date filter (YYYY-MM-DD)
 * @access Public
 */
router.get('/categories', ExpenseController.getCategoriesWithTotals);

/**
 * @route GET /api/expenses/report
 * @desc Get comprehensive expense report for a period
 * @query {string} dateFrom - Start date (required, YYYY-MM-DD)
 * @query {string} dateTo - End date (required, YYYY-MM-DD)
 * @query {string} format - Report format: 'json' (default)
 * @access Public
 */
router.get('/report', ExpenseController.getExpenseReport);

/**
 * @route GET /api/expenses/category/:category
 * @desc Get expenses by specific category
 * @param {string} category - Expense category
 * @access Public
 */
router.get('/category/:category', ExpenseController.getExpensesByCategory);

/**
 * @route GET /api/expenses/:id
 * @desc Get single expense by ID
 * @param {string} id - Expense ID
 * @access Public
 */
router.get('/:id', ExpenseController.getExpenseById);

/**
 * @route POST /api/expenses
 * @desc Create new expense
 * @body {string} date - Expense date (optional, defaults to today)
 * @body {string} category - Expense category (required)
 * @body {number} amount - Expense amount (required)
 * @body {string} description - Expense description (required)
 * @body {string} vendor - Vendor name (optional)
 * @body {string} reference_number - Reference number (optional)
 * @body {string} payment_method - Payment method (optional)
 * @body {boolean} tax_deductible - Tax deductible status (default: false)
 * @body {string} receipt_url - Receipt URL (optional)
 * @body {string} notes - Additional notes (optional)
 * @access Private
 */
router.post('/', ExpenseController.createExpense);

/**
 * @route POST /api/expenses/bulk
 * @desc Bulk create expenses
 * @body {array} expenses - Array of expense objects
 * @access Private
 */
router.post('/bulk', ExpenseController.bulkCreateExpenses);

/**
 * @route PUT /api/expenses/:id
 * @desc Update expense
 * @param {string} id - Expense ID
 * @body Expense update data
 * @access Private
 */
router.put('/:id', ExpenseController.updateExpense);

/**
 * @route DELETE /api/expenses/:id
 * @desc Delete expense
 * @param {string} id - Expense ID
 * @access Private
 */
router.delete('/:id', ExpenseController.deleteExpense);

module.exports = router;
