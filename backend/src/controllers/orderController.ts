import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Получить все заказы
const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      customer,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Строим условия фильтрации
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (customer) {
      where.customerName = {
        contains: customer as string,
        mode: 'insensitive'
      };
    }

    if (dateFrom || dateTo) {
      where.orderDate = {};
      if (dateFrom) {
        where.orderDate.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.orderDate.lte = new Date(dateTo as string);
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true
      },
      orderBy: {
        [sortBy as string]: sortOrder === 'ASC' ? 'asc' : 'desc'
      },
      skip: offset,
      take: limitNum
    });

    const total = await prisma.order.count({ where });

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
};

// Получить статистику заказов
const getOrderStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dateFrom, dateTo } = req.query;

    const where: any = {};
    if (dateFrom || dateTo) {
      where.orderDate = {};
      if (dateFrom) {
        where.orderDate.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.orderDate.lte = new Date(dateTo as string);
      }
    }

    const totalOrders = await prisma.order.count({ where });
    const totalRevenue = await prisma.order.aggregate({
      where,
      _sum: {
        total: true
      }
    });

    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      where,
      _count: {
        status: true
      }
    });

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        statusCounts
      }
    });
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order statistics'
    });
  }
};

// Поиск заказов по клиенту
const searchOrdersByCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customer } = req.query;

    if (!customer) {
      res.status(400).json({
        success: false,
        error: 'Customer name is required'
      });

      return;
    }

    const orders = await prisma.order.findMany({
      where: {
        customerName: {
          contains: customer as string,
          mode: 'insensitive'
        }
      },
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error searching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search orders'
    });
  }
};

// Получить заказы по статусу
const getOrdersByStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.params;

    const orders = await prisma.order.findMany({
      where: {
        status
      },
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders by status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders by status'
    });
  }
};

// Получить заказ по ID
const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true
      }
    });

    if (!order) {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });

      return;
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
};

// Создать новый заказ
const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderData = req.body;

    const order = await prisma.order.create({
      data: {
        ...orderData,
        orderDate: orderData.orderDate ? new Date(orderData.orderDate) : new Date()
      },
      include: {
        items: true
      }
    });

    console.log(`✅ Order created: ${order.id}`);

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
};

// Добавить товар к заказу
const addOrderItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const itemData = req.body;

    const item = await prisma.orderItem.create({
      data: {
        ...itemData,
        orderId: id
      }
    });

    console.log(`✅ Item added to order ${id}`);

    res.status(201).json({
      success: true,
      data: item,
      message: 'Item added to order successfully'
    });
  } catch (error) {
    console.error('Error adding order item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add order item'
    });
  }
};

// Обновление статуса заказа
const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      res.status(400).json({
        success: false,
        error: 'Order ID and status are required'
      });

      return;
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Order ${id} status updated to: ${status}`);

    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Удалить заказ
const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.order.delete({
      where: { id }
    });

    console.log(`✅ Order ${id} deleted`);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete order'
    });
  }
};

// ES6 экспорты для TypeScript
export {
  getAllOrders,
  getOrderStatistics,
  searchOrdersByCustomer,
  getOrdersByStatus,
  getOrderById,
  createOrder,
  addOrderItem,
  updateOrderStatus,
  deleteOrder
};

// CommonJS экспорт для совместимости
module.exports = {
  getAllOrders,
  getOrderStatistics,
  searchOrdersByCustomer,
  getOrdersByStatus,
  getOrderById,
  createOrder,
  addOrderItem,
  updateOrderStatus,
  deleteOrder
};
