import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
  try {
    console.log('📦 Запрос товаров из базы данных');

    // Получаем параметр showHidden из query
    const showHidden = req.query.showHidden === 'true';

    const products = await prisma.product.findMany({
      where: {
        price: {
          not: undefined
        },
        // Фильтруем скрытые товары, если не запрошены специально
        ...(showHidden ? {} : { isHidden: false })
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`✅ Найдено ${products.length} товаров`);

    // Преобразуем данные в формат для аналитики закупок
    const analyticsProducts = products.map(product => {
      const stockQuantity = product.stockQuantity || 0;
      const avgSalesPerDay = 2.5; // среднее потребление
      const daysToZero = stockQuantity / avgSalesPerDay;
      const minStock = Math.max(Math.floor(stockQuantity * 0.3), 5);
      const toPurchase = stockQuantity < minStock ? minStock - stockQuantity + 7 : 0; // +7 дней запаса

      // Определяем уровень срочности
      let urgencyLevel = 'normal';
      if (daysToZero <= 3) urgencyLevel = 'critical';
      else if (daysToZero <= 7) urgencyLevel = 'warning';

      return {
        id: product.id,
        externalId: product.externalId,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price.toString()),
        costPrice: product.costPrice ? parseFloat(product.costPrice.toString()) : null,
        costPriceTRY: product.costPriceTRY ? parseFloat(product.costPriceTRY.toString()) : null,
        stockQuantity: stockQuantity,
        stock_quantity: stockQuantity, // для совместимости
        brand: product.brand,
        category: product.brand, // используем бренд как категорию
        mainIngredient: product.mainIngredient,
        main_ingredient: product.mainIngredient, // для совместимости
        dosageForm: product.dosageForm,
        dosage_form: product.dosageForm, // для совместимости
        packageQuantity: product.packageQuantity,
        package_quantity: product.packageQuantity, // для совместимости
        weight: product.weight,

        // Рассчитанные поля для аналитики
        avgSalesPerDay,
        daysToZero: Math.round(daysToZero * 10) / 10,
        minStock,
        toPurchase,
        urgencyLevel,
        salesLast30Days: Math.floor(Math.random() * 50) + 10, // временно случайные
        isHidden: product.isHidden,

        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });

    res.json({
      success: true,
      data: {
        products: analyticsProducts,
        total: analyticsProducts.length
      }
    });

  } catch (error) {
    console.error('❌ Ошибка получения товаров:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения товаров'
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Товар не найден'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('❌ Ошибка получения товара:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения товара'
    });
  }
};

export const updateProductCost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { costPrice } = req.body;

    const product = await prisma.product.update({
      where: {
        id: parseInt(id)
      },
      data: {
        costPrice: costPrice ? parseFloat(costPrice) : null
      }
    });

    console.log(`💰 Обновлена себестоимость товара ${product.name}: ${costPrice} ₺`);

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('❌ Ошибка обновления себестоимости:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления себестоимости'
    });
  }
};

export const hideProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isHidden } = req.body;

    const product = await prisma.product.update({
      where: {
        id: parseInt(id)
      },
      data: {
        isHidden: isHidden !== undefined ? isHidden : true
      }
    });

    console.log(`👁️ ${isHidden ? 'Скрыт' : 'Показан'} товар: ${product.name}`);

    res.json({
      success: true,
      data: product,
      message: `Товар ${isHidden ? 'скрыт' : 'показан'}`
    });

  } catch (error) {
    console.error('❌ Ошибка скрытия товара:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка скрытия товара'
    });
  }
};

// Скрытие товара по имени
export const hideProductByName = async (req: Request, res: Response) => {
  try {
    const { productName, isHidden } = req.body;

    if (!productName) {
      return res.status(400).json({
        success: false,
        error: 'Имя товара обязательно'
      });
    }

    // Ищем товар по имени
    const product = await prisma.product.findFirst({
      where: {
        name: productName
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Товар "${productName}" не найден`
      });
    }

    // Обновляем состояние скрытия
    const updatedProduct = await prisma.product.update({
      where: {
        id: product.id
      },
      data: {
        isHidden: isHidden !== undefined ? isHidden : true
      }
    });

    console.log(`👁️ ${isHidden ? 'Скрыт' : 'Показан'} товар: ${updatedProduct.name}`);

    res.json({
      success: true,
      data: updatedProduct,
      message: `Товар "${productName}" ${isHidden ? 'скрыт' : 'показан'}`
    });

  } catch (error) {
    console.error('❌ Ошибка скрытия товара по имени:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка скрытия товара'
    });
  }
};

// Получение списка скрытых товаров
export const getHiddenProducts = async (req: Request, res: Response) => {
  try {
    const hiddenProducts = await prisma.product.findMany({
      where: {
        isHidden: true
      },
      select: {
        name: true
      }
    });

    const hiddenProductNames = hiddenProducts.map(p => p.name);

    res.json({
      success: true,
      hiddenProducts: hiddenProductNames,
      count: hiddenProductNames.length
    });

  } catch (error) {
    console.error('❌ Ошибка получения скрытых товаров:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка получения скрытых товаров'
    });
  }
};

export const updateProductStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stockQuantity, quantity, operation } = req.body;

    // Поддерживаем как прямое обновление, так и операции добавления/вычитания
    let newStockQuantity: number;

    if (stockQuantity !== undefined) {
      // Прямое обновление остатка
      newStockQuantity = parseInt(stockQuantity);
    } else if (quantity !== undefined && operation) {
      // Операции добавления/вычитания
      const currentProduct = await prisma.product.findUnique({
        where: { id: parseInt(id) },
        select: { stockQuantity: true, name: true }
      });

      if (!currentProduct) {
        return res.status(404).json({
          success: false,
          error: 'Товар не найден'
        });
      }

      const currentStock = currentProduct.stockQuantity || 0;
      const changeQuantity = parseInt(quantity);

      if (operation === 'add') {
        newStockQuantity = currentStock + changeQuantity;
      } else if (operation === 'subtract') {
        newStockQuantity = Math.max(0, currentStock - changeQuantity);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Некорректная операция. Используйте "add" или "subtract"'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        error: 'Укажите stockQuantity или quantity с operation'
      });
    }

    const product = await prisma.product.update({
      where: {
        id: parseInt(id)
      },
      data: {
        stockQuantity: newStockQuantity,
        updatedAt: new Date()
      }
    });

    console.log(`📦 Обновлен остаток товара ${product.name}: ${newStockQuantity} шт`);

    res.json({
      success: true,
      data: product,
      message: 'Остаток товара обновлен'
    });

  } catch (error) {
    console.error('❌ Ошибка обновления остатка:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления остатка'
    });
  }
};

export const updateProductPrice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    const product = await prisma.product.update({
      where: {
        id: parseInt(id)
      },
      data: {
        price: parseFloat(price),
        updatedAt: new Date()
      }
    });

    console.log(`💰 Обновлена цена товара ${product.name}: ${price} ₽`);

    res.json({
      success: true,
      data: product,
      message: 'Цена товара обновлена'
    });

  } catch (error) {
    console.error('❌ Ошибка обновления цены:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления цены'
    });
  }
};

export const updateProductAnalytics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { avgDailySales30d, daysToZero, recommendedQty, trend, inTransit, minStock } = req.body;

    const updateData: any = {};

    if (avgDailySales30d !== undefined) updateData.avgDailySales30d = parseFloat(avgDailySales30d);
    if (daysToZero !== undefined) updateData.daysToZero = parseInt(daysToZero);
    if (recommendedQty !== undefined) updateData.recommendedQty = parseInt(recommendedQty);
    if (trend !== undefined) updateData.trend = trend;
    if (inTransit !== undefined) updateData.inTransit = parseInt(inTransit);
    if (minStock !== undefined) updateData.minStock = parseInt(minStock);

    updateData.updatedAt = new Date();

    const product = await prisma.product.update({
      where: {
        id: parseInt(id)
      },
      data: updateData
    });

    console.log(`📊 Обновлена аналитика товара ${product.name}`);

    res.json({
      success: true,
      data: product,
      message: 'Аналитика товара обновлена'
    });

  } catch (error) {
    console.error('❌ Ошибка обновления аналитики:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка обновления аналитики'
    });
  }
};

// CommonJS экспорты для совместимости с routes
module.exports = {
  getProducts,
  getProductById,
  updateProductCost,
  hideProduct,
  hideProductByName,
  getHiddenProducts,
  updateProductStock,
  updateProductPrice,
  updateProductAnalytics
};
