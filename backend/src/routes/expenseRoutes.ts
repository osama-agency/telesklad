import { Router } from 'express';

import { ExpenseController } from '../controllers/expenseController';

const router = Router();

// Получение списка расходов
router.get('/', ExpenseController.getExpenses);

// Получение категорий расходов
router.get('/categories', ExpenseController.getCategories);

// Получение статистики расходов
router.get('/stats', ExpenseController.getExpenseStats);

// Получение конкретного расхода по ID
router.get('/:id', ExpenseController.getExpenseById);

// Создание нового расхода
router.post('/', ExpenseController.createExpense);

// Обновление расхода
router.put('/:id', ExpenseController.updateExpense);

// Удаление расхода
router.delete('/:id', ExpenseController.deleteExpense);

// Массовое удаление расходов
router.delete('/bulk', ExpenseController.bulkDeleteExpenses);

export default router;
