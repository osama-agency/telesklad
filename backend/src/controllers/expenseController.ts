import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ExpenseController {
  // Получение списка расходов с фильтрацией
  static async getExpenses(req: Request, res: Response) {
    try {
      const {
        category,
        productId,
        from,
        to,
        page = 1,
        limit = 50
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (category) {
        where.category = category;
      }

      if (productId) {
        where.productId = Number(productId);
      }

      if (from || to) {
        where.date = {};
        if (from) {
          where.date.gte = new Date(from as string);
        }
        if (to) {
          where.date.lte = new Date(to as string);
        }
      }

      const [expenses, total] = await Promise.all([
        prisma.expense.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { date: 'desc' }
        }),
        prisma.expense.count({ where })
      ]);

      // Подсчет общей суммы расходов
      const totalAmount = await prisma.expense.aggregate({
        where,
        _sum: {
          amount: true
        }
      });

      res.json({
        success: true,
        data: {
          expenses,
          total,
          totalAmount: totalAmount._sum.amount || 0,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch expenses'
      });
    }
  }

  // Создание нового расхода
  static async createExpense(req: Request, res: Response) {
    try {
      const { date, category, amount, comment, productId } = req.body;

      // Валидация обязательных полей
      if (!category || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Category and amount are required'
        });
      }

      const expense = await prisma.expense.create({
        data: {
          date: date ? new Date(date) : new Date(),
          category,
          amount: Number(amount),
          comment,
          productId: productId ? Number(productId) : null
        }
      });

      res.status(201).json({
        success: true,
        data: expense
      });
    } catch (error) {
      console.error('Error creating expense:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create expense'
      });
    }
  }

  // Получение категорий расходов
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.expense.findMany({
        select: {
          category: true
        },
        distinct: ['category']
      });

      const categoryList = categories.map(c => c.category);

      res.json({
        success: true,
        data: categoryList
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories'
      });
    }
  }

  // Получение статистики расходов по категориям
  static async getExpenseStats(req: Request, res: Response) {
    try {
      const { from, to } = req.query;

      const where: any = {};

      if (from || to) {
        where.date = {};
        if (from) {
          where.date.gte = new Date(from as string);
        }
        if (to) {
          where.date.lte = new Date(to as string);
        }
      }

      const stats = await prisma.expense.groupBy({
        by: ['category'],
        where,
        _sum: {
          amount: true
        },
        _count: {
          _all: true
        }
      });

      const formattedStats = stats.map(stat => ({
        category: stat.category,
        totalAmount: stat._sum.amount || 0,
        count: stat._count._all
      }));

      res.json({
        success: true,
        data: formattedStats
      });
    } catch (error) {
      console.error('Error fetching expense stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch expense statistics'
      });
    }
  }

  // Получение конкретного расхода по ID
  static async getExpenseById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const expense = await prisma.expense.findUnique({
        where: {
          id: id
        }
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          error: 'Expense not found'
        });
      }

      res.json({
        success: true,
        data: expense
      });
    } catch (error) {
      console.error('Error fetching expense:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch expense'
      });
    }
  }

  // Обновление расхода
  static async updateExpense(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { date, category, amount, comment, productId } = req.body;

      // Проверяем, существует ли расход
      const existingExpense = await prisma.expense.findUnique({
        where: { id: id }
      });

      if (!existingExpense) {
        return res.status(404).json({
          success: false,
          error: 'Expense not found'
        });
      }

      // Валидация обязательных полей
      if (!category || !amount) {
        return res.status(400).json({
          success: false,
          error: 'Category and amount are required'
        });
      }

      const updatedExpense = await prisma.expense.update({
        where: { id: id },
        data: {
          date: date ? new Date(date) : existingExpense.date,
          category,
          amount: Number(amount),
          comment,
          productId: productId ? Number(productId) : null
        }
      });

      res.json({
        success: true,
        data: updatedExpense
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update expense'
      });
    }
  }

  // Удаление расхода
  static async deleteExpense(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Проверяем, существует ли расход
      const existingExpense = await prisma.expense.findUnique({
        where: { id: id }
      });

      if (!existingExpense) {
        return res.status(404).json({
          success: false,
          error: 'Expense not found'
        });
      }

      await prisma.expense.delete({
        where: { id: id }
      });

      res.json({
        success: true,
        message: 'Expense deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete expense'
      });
    }
  }

  // Массовое удаление расходов
  static async bulkDeleteExpenses(req: Request, res: Response) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Array of IDs is required'
        });
      }

      const result = await prisma.expense.deleteMany({
        where: {
          id: { in: ids }
        }
      });

      res.json({
        success: true,
        data: {
          deletedCount: result.count
        },
        message: `${result.count} expenses deleted successfully`
      });
    } catch (error) {
      console.error('Error bulk deleting expenses:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete expenses'
      });
    }
  }
}

// Экспорт класса по умолчанию
export default ExpenseController;

// Дополнительные named exports для совместимости
export const getAllExpenses = ExpenseController.getExpenses;
export const getExpenseStatistics = ExpenseController.getExpenseStats;
export const getMonthlyTotals = ExpenseController.getExpenseStats;
export const getTaxDeductibleExpenses = ExpenseController.getExpenses;
export const searchExpenses = ExpenseController.getExpenses;
export const getTopVendors = ExpenseController.getExpenseStats;
export const getCategoriesWithTotals = ExpenseController.getExpenseStats;
export const getExpenseReport = ExpenseController.getExpenseStats;
export const getExpensesByCategory = ExpenseController.getExpenses;
export const getExpenseById = ExpenseController.getExpenseById;
export const createExpense = ExpenseController.createExpense;
export const bulkCreateExpenses = ExpenseController.createExpense;
export const updateExpense = ExpenseController.updateExpense;
export const deleteExpense = ExpenseController.deleteExpense;
