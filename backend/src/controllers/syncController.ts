// ✅ Готовый файл. DO NOT MODIFY. Эта логика работает стабильно и не подлежит изменению AI или другим ассистентам.

import type { Request, Response } from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';

import { prisma } from '../lib/prisma';
import type { ExternalOrder } from '../types';

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
      return;
    }

    const order = await prisma.order.findUnique({
      where: {
        id: id
      },
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

    const response = {
      success: true,
      data: {
        order
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getOrdersStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dateFrom, dateTo } = req.query;

    // Строим фильтр по датам
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

    // Получаем статистику
    const [totalOrders, totalRevenue, ordersByStatus, recentOrders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where,
        _sum: {
          total: true
        }
      }),
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: {
          id: true
        }
      }),
      prisma.order.findMany({
        where,
        include: {
          items: true
        },
        orderBy: {
          orderDate: 'desc'
        },
        take: 5
      })
    ]);

    const response = {
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        ordersByStatus: ordersByStatus.map(item => ({
          status: item.status,
          count: item._count.id
        })),
        recentOrders
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching orders stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, dateFrom, dateTo, sortBy = 'orderDate', sortOrder = 'DESC' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Строим фильтр по датам
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

    // Получаем заказы с элементами
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true
        },
        orderBy: {
          [sortBy as string]: sortOrder === 'DESC' ? 'desc' : 'asc'
        },
        skip,
        take: limitNum
      }),
      prisma.order.count({ where })
    ]);

    const response = {
      success: true,
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const syncOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Starting sync orders...');

    const { authorization } = req.headers;

    if (!authorization) {
      res.status(400).json({
        success: false,
        error: 'Authorization header is required'
      });
      return;
    }

    const apiUrl = process.env.STRATTERA_API_URL;
    if (!apiUrl) {
      res.status(500).json({
        success: false,
        error: 'STRATTERA_API_URL is not configured'
      });
      return;
    }

    // Получаем данные с внешнего API
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': authorization
      }
    });

    const externalOrders: ExternalOrder[] = response.data;
    let importedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    console.log(`Received ${externalOrders.length} orders from external API`);

    // Обрабатываем каждый заказ
    for (let i = 0; i < externalOrders.length; i++) {
      const externalOrder = externalOrders[i];

      // Логируем прогресс каждые 100 заказов
      if (i % 100 === 0) {
        console.log(`Processing order ${i + 1}/${externalOrders.length} (ID: ${externalOrder.id})`);
      }

      try {
        const totalAmount = parseFloat(externalOrder.total_amount);

                // Выбираем дату: если paid_at == null, то используем created_at
        const dateString = externalOrder.paid_at || externalOrder.created_at;

        // Парсим дату в формате "05.06.2025 21:31:26"
        const dateParts = dateString.split(' ');
        const [day, month, year] = dateParts[0].split('.');
        const [hours, minutes, seconds] = dateParts[1].split(':');
        const orderDate = new Date(
          parseInt(year),
          parseInt(month) - 1, // месяцы в JavaScript начинаются с 0
          parseInt(day),
          parseInt(hours),
          parseInt(minutes),
          parseInt(seconds)
        );

        if (isNaN(totalAmount)) {
          console.warn(`Skipping order ${externalOrder.id}: invalid total_amount "${externalOrder.total_amount}"`);
          skippedCount++;
          continue;
        }

        if (isNaN(orderDate.getTime())) {
          console.warn(`Skipping order ${externalOrder.id}: invalid created_at "${externalOrder.created_at}"`);
          skippedCount++;
          continue;
        }

        await prisma.order.upsert({
          where: {
            externalId: externalOrder.id.toString()
          },
          update: {
            customerName: externalOrder.user.full_name,
            customerEmail: null, // не предоставляется в API
            customerPhone: null, // не предоставляется в API
            customerCity: externalOrder.user.city,
            customerAddress: externalOrder.user.city, // используем город как адрес
            bankCard: externalOrder.bank_card,
            bonus: externalOrder.bonus,
            deliveryCost: externalOrder.delivery_cost,
            paidAt: externalOrder.paid_at ? new Date(externalOrder.paid_at.split(' ').map((part, i) => i === 0 ? part.split('.').reverse().join('-') : part).join(' ')) : null,
            shippedAt: externalOrder.shipped_at ? new Date(externalOrder.shipped_at.split(' ').map((part, i) => i === 0 ? part.split('.').reverse().join('-') : part).join(' ')) : null,
            status: externalOrder.status,
            total: totalAmount,
            currency: 'RUB', // предполагаем рубли
            orderDate: orderDate,
            updatedAt: new Date(),
            // Обновляем элементы заказа
            items: {
              deleteMany: {}, // Удаляем старые элементы
              create: externalOrder.order_items.filter(item => {
                const itemPrice = parseFloat(item.price);
                if (isNaN(itemPrice) || item.quantity <= 0) {
                  console.warn(`Skipping invalid order item in order ${externalOrder.id}: price="${item.price}", quantity=${item.quantity}`);
                  return false;
                }
                return true;
              }).map(item => {
                const itemPrice = parseFloat(item.price);
                return {
                  productId: null, // не предоставляется в API
                  name: item.name,
                  quantity: item.quantity,
                  price: itemPrice,
                  total: itemPrice * item.quantity
                };
              })
            }
          },
          create: {
            externalId: externalOrder.id.toString(),
            customerName: externalOrder.user.full_name,
            customerEmail: null,
            customerPhone: null,
            customerCity: externalOrder.user.city,
            customerAddress: externalOrder.user.city, // используем город как адрес
            bankCard: externalOrder.bank_card,
            bonus: externalOrder.bonus,
            deliveryCost: externalOrder.delivery_cost,
            paidAt: externalOrder.paid_at ? new Date(externalOrder.paid_at.split(' ').map((part, i) => i === 0 ? part.split('.').reverse().join('-') : part).join(' ')) : null,
            shippedAt: externalOrder.shipped_at ? new Date(externalOrder.shipped_at.split(' ').map((part, i) => i === 0 ? part.split('.').reverse().join('-') : part).join(' ')) : null,
            status: externalOrder.status,
            total: totalAmount,
            currency: 'RUB',
            orderDate: orderDate,
            items: {
              create: externalOrder.order_items.filter(item => {
                const itemPrice = parseFloat(item.price);
                if (isNaN(itemPrice) || item.quantity <= 0) {
                  console.warn(`Skipping invalid order item in order ${externalOrder.id}: price="${item.price}", quantity=${item.quantity}`);
                  return false;
                }
                return true;
              }).map(item => {
                const itemPrice = parseFloat(item.price);
                return {
                  productId: null,
                  name: item.name,
                  quantity: item.quantity,
                  price: itemPrice,
                  total: itemPrice * item.quantity
                };
              })
            }
          }
        });

        importedCount++;

        // Логируем первые 5 заказов для отладки
        if (i < 5) {
          console.log(`✅ Processed order ${externalOrder.id}: ${externalOrder.user.full_name}`);
        }

      } catch (orderError) {
        console.error(`Error processing order ${externalOrder.id}:`, orderError);
        errorCount++;

        // Продолжаем обработку остальных заказов
      }
    }

    console.log(`Import completed: ${importedCount} imported, ${errorCount} errors, ${skippedCount} skipped`);

    const response_data = {
      success: true,
      imported: importedCount,
      errors: errorCount,
      skipped: skippedCount,
      message: `Successfully imported ${importedCount} orders`
    };

    res.json(response_data);
  } catch (error) {
    console.error('Sync failed:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const syncProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Starting sync products...');

    const apiUrl = 'https://strattera.tgapp.online/api/v1/products';
    const authToken = '8cM9wVBrY3p56k4L1VBpIBwOsw';

    // Получаем данные с внешнего API
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': authToken
      }
    });

    const externalProducts = response.data;
    let importedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    console.log(`Received ${externalProducts.length} products from external API`);

    // Обрабатываем каждый товар
    for (const externalProduct of externalProducts) {
      try {
        // Пропускаем товары без цены
        if (!externalProduct.price || externalProduct.price === null) {
          console.log(`⏭️  Skipping product without price: ${externalProduct.name}`);
          continue;
        }

        const price = parseFloat(externalProduct.price);
        if (isNaN(price)) {
          console.warn(`Skipping product ${externalProduct.id}: invalid price "${externalProduct.price}"`);
          continue;
        }

        // Проверяем существует ли товар
        const existingProduct = await prisma.product.findUnique({
          where: {
            externalId: externalProduct.id
          }
        });

        if (existingProduct) {
          // Обновляем существующий товар (БЕЗ ИЗМЕНЕНИЯ costPriceTRY)
          await prisma.product.update({
            where: {
              externalId: externalProduct.id
            },
            data: {
              name: externalProduct.name,
              description: externalProduct.description,
              price: price,
              stockQuantity: externalProduct.stock_quantity || 0,
              brand: externalProduct.brand,
              category: externalProduct.brand, // используем brand как категорию
              mainIngredient: externalProduct.main_ingredient,
              dosageForm: externalProduct.dosage_form,
              packageQuantity: externalProduct.package_quantity,
              weight: externalProduct.weight,
              updatedAt: new Date()
            }
          });
          updatedCount++;
        } else {
          // Создаем новый товар (БЕЗ costPriceTRY - будет обновлено отдельно)
          await prisma.product.create({
            data: {
              externalId: externalProduct.id,
              name: externalProduct.name,
              description: externalProduct.description,
              price: price,
              stockQuantity: externalProduct.stock_quantity || 0,
              brand: externalProduct.brand,
              category: externalProduct.brand,
              mainIngredient: externalProduct.main_ingredient,
              dosageForm: externalProduct.dosage_form,
              packageQuantity: externalProduct.package_quantity,
              weight: externalProduct.weight
            }
          });
          importedCount++;
        }

      } catch (productError) {
        console.error(`Error processing product ${externalProduct.id}:`, productError);
        errorCount++;
      }
    }

    console.log(`Import completed: ${importedCount} created, ${updatedCount} updated, ${errorCount} errors`);

    res.json({
      success: true,
      created: importedCount,
      updated: updatedCount,
      errors: errorCount,
      message: `Successfully synced ${importedCount + updatedCount} products`
    });
  } catch (error) {
    console.error('Sync products failed:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Функция для автоматической синхронизации (вызывается из cron)
export const autoSyncAll = async (): Promise<any> => {
  try {
    console.log('🤖 Starting automatic sync of all data...');

    // Рассчитываем дату 1 месяц назад для синхронизации
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    oneMonthAgo.setHours(0, 0, 0, 0); // Начало дня

    console.log(`📅 Will sync orders from: ${oneMonthAgo.toISOString()}`);

    const results = {
      orders: { success: false, count: 0, skipped: 0, error: null as any },
      products: { success: false, count: 0, error: null as any }
    };

    // Синхронизация заказов
    try {
      console.log('📦 Syncing orders...');

      // Получаем свежие данные из API (БЕЗ удаления старых заказов)
      const ordersResponse = await axios.get('https://strattera.tgapp.online/api/v1/orders', {
        headers: {
          'Authorization': '8cM9wVBrY3p56k4L1VBpIBwOsw'
        }
      });

      const externalOrders = ordersResponse.data;
      let orderCount = 0;
      let skippedOldOrders = 0;

      console.log(`📦 Processing ${externalOrders.length} orders from API...`);

      for (const externalOrder of externalOrders) {
        try {
          const totalAmount = parseFloat(externalOrder.total_amount);
          if (isNaN(totalAmount)) continue;

          // Парсим дату
          const dateString = externalOrder.paid_at || externalOrder.created_at;
          const dateParts = dateString.split(' ');
          const [day, month, year] = dateParts[0].split('.');
          const [hours, minutes, seconds] = dateParts[1].split(':');
          const orderDate = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hours),
            parseInt(minutes),
            parseInt(seconds)
          );

          if (isNaN(orderDate.getTime())) continue;

          // 🎯 ФИЛЬТР: Синхронизируем только заказы за последний месяц (но НЕ удаляем старые)
          if (orderDate < oneMonthAgo) {
            skippedOldOrders++;
            continue;
          }

          await prisma.order.upsert({
            where: {
              externalId: externalOrder.id.toString()
            },
            update: {
              customerName: externalOrder.user.full_name,
              customerCity: externalOrder.user.city,
              customerAddress: externalOrder.user.city,
              bankCard: externalOrder.bank_card,
              bonus: externalOrder.bonus,
              deliveryCost: externalOrder.delivery_cost,
              status: externalOrder.status,
              total: totalAmount,
              orderDate: orderDate,
              updatedAt: new Date()
            },
            create: {
              externalId: externalOrder.id.toString(),
              customerName: externalOrder.user.full_name,
              customerCity: externalOrder.user.city,
              customerAddress: externalOrder.user.city,
              bankCard: externalOrder.bank_card,
              bonus: externalOrder.bonus,
              deliveryCost: externalOrder.delivery_cost,
              status: externalOrder.status,
              total: totalAmount,
              orderDate: orderDate,
              items: {
                create: externalOrder.order_items.map((item: any) => ({
                  name: item.name,
                  quantity: item.quantity,
                  price: parseFloat(item.price),
                  total: parseFloat(item.price) * item.quantity
                }))
              }
            }
          });
          orderCount++;
        } catch (e) {
          // Продолжаем с другими заказами
        }
      }

      console.log(`✅ Orders sync completed: ${orderCount} processed, ${skippedOldOrders} skipped (older than 1 month)`);
      results.orders = { success: true, count: orderCount, skipped: skippedOldOrders, error: null };
    } catch (error) {
      results.orders.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Синхронизация товаров (без изменений)
    try {
      console.log('🛍️ Syncing products...');
      const productsResponse = await axios.get('https://strattera.tgapp.online/api/v1/products', {
        headers: {
          'Authorization': '8cM9wVBrY3p56k4L1VBpIBwOsw'
        }
      });

      const externalProducts = productsResponse.data;
      let productCount = 0;

      for (const externalProduct of externalProducts) {
        try {
          if (!externalProduct.price || externalProduct.price === null) continue;

          const price = parseFloat(externalProduct.price);
          if (isNaN(price)) continue;

          await prisma.product.upsert({
            where: {
              externalId: externalProduct.id
            },
            update: {
              name: externalProduct.name,
              description: externalProduct.description,
              price: price,
              stockQuantity: externalProduct.stock_quantity || 0,
              brand: externalProduct.brand,
              category: externalProduct.brand,
              mainIngredient: externalProduct.main_ingredient,
              dosageForm: externalProduct.dosage_form,
              packageQuantity: externalProduct.package_quantity,
              weight: externalProduct.weight,
              updatedAt: new Date()
            },
            create: {
              externalId: externalProduct.id,
              name: externalProduct.name,
              description: externalProduct.description,
              price: price,
              stockQuantity: externalProduct.stock_quantity || 0,
              brand: externalProduct.brand,
              category: externalProduct.brand,
              mainIngredient: externalProduct.main_ingredient,
              dosageForm: externalProduct.dosage_form,
              packageQuantity: externalProduct.package_quantity,
              weight: externalProduct.weight
            }
          });
          productCount++;
        } catch (e) {
          // Продолжаем с другими товарами
        }
      }

      results.products = { success: true, count: productCount, error: null };
    } catch (error) {
      results.products.error = error instanceof Error ? error.message : 'Unknown error';
    }

    console.log('✅ Automatic sync completed:', results);
    return results;
  } catch (error) {
    console.error('❌ Auto sync failed:', error);
    throw error;
  }
};
