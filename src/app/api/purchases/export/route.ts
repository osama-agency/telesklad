import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/libs/prismaDb';

// GET - экспорт данных закупок
export async function GET(request: NextRequest) {
  try {
    // ВРЕМЕННО ОТКЛЮЧЕНА АВТОРИЗАЦИЯ
    // const session = await getServerSession();
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log('📤 Purchases Export API: Starting...');

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv'; // csv, xlsx, pdf
    const ids = searchParams.get('ids'); // comma-separated IDs для экспорта конкретных закупок
    
    // Применяем те же фильтры, что и в основном API
    const urgent = searchParams.get('urgent');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');

    console.log('📤 Export filters:', { format, ids, urgent, status, search, dateFrom, dateTo, minAmount, maxAmount });

    // Строим условия фильтрации
    const whereConditions: any = {};

    // Если указаны конкретные ID
    if (ids) {
      const purchaseIds = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (purchaseIds.length > 0) {
        whereConditions.id = { in: purchaseIds };
      }
    } else {
      // Применяем обычные фильтры
      if (urgent !== null && urgent !== undefined) {
        whereConditions.isurgent = urgent === 'true';
      }
      if (status) {
        whereConditions.status = status;
      }
      if (dateFrom || dateTo) {
        whereConditions.createdat = {};
        if (dateFrom) {
          whereConditions.createdat.gte = new Date(dateFrom);
        }
        if (dateTo) {
          whereConditions.createdat.lte = new Date(dateTo);
        }
      }
      if (minAmount || maxAmount) {
        whereConditions.totalamount = {};
        if (minAmount) {
          whereConditions.totalamount.gte = parseFloat(minAmount);
        }
        if (maxAmount) {
          whereConditions.totalamount.lte = parseFloat(maxAmount);
        }
      }
      if (search) {
        whereConditions.OR = [
          {
            suppliername: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            notes: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            purchase_items: {
              some: {
                productname: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          }
        ];
      }
    }

    // Получаем данные для экспорта
    console.log('🔍 Querying database with conditions:', JSON.stringify(whereConditions, null, 2));
    
    const purchases = await prisma.purchases.findMany({
      where: whereConditions,
      include: {
        purchase_items: true,
        users: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true
          }
        }
      },
      orderBy: {
        createdat: 'desc'
      }
    });

    console.log(`📤 Found ${purchases.length} purchases for export`);

    if (purchases.length === 0) {
      return NextResponse.json({ error: 'No purchases found for export' }, { status: 400 });
    }

    console.log(`📤 Exporting ${purchases.length} purchases in ${format.toUpperCase()} format`);

    // Подготавливаем данные для экспорта
    const exportData = purchases.map((purchase: any) => {
      const items = purchase.purchase_items || [];
      const itemsText = items.map((item: any) => 
        `${item.productname || 'Unknown'} (${item.quantity} шт. × ${item.costprice || 0} ₺)`
      ).join('; ');

      return {
        'ID': String(purchase.id),
        'Дата создания': new Date(purchase.createdat).toLocaleDateString('ru-RU'),
        'Статус': getStatusLabel(purchase.status),
        'Срочная': purchase.isurgent ? 'Да' : 'Нет',
        'Сумма (₺)': Number(purchase.totalamount || 0).toFixed(2),
        'Поставщик': purchase.suppliername || 'Не указан',
        'Товары': itemsText,
        'Количество позиций': items.length,
        'Пользователь': purchase.users ? 
          `${purchase.users.first_name || ''} ${purchase.users.last_name || ''}`.trim() || purchase.users.email : 
          'Неизвестен',
        'Примечания': purchase.notes || '',
        'Телефон поставщика': purchase.supplierphone || '',
        'Адрес поставщика': purchase.supplieraddress || '',
        'Дата доставки': purchase.deliverydate ? new Date(purchase.deliverydate).toLocaleDateString('ru-RU') : '',
        'Трек-номер': purchase.deliverytrackingnumber || '',
        'Статус доставки': purchase.deliverystatus || '',
        'Перевозчик': purchase.deliverycarrier || '',
        'Примечания к доставке': purchase.deliverynotes || ''
      };
    });

    // Генерируем файл в зависимости от формата
    if (format === 'csv') {
      return generateCSV(exportData);
    } else if (format === 'xlsx') {
      return generateXLSX(exportData);
    } else if (format === 'pdf') {
      return generatePDF(exportData);
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error exporting purchases:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

// POST - массовый экспорт с дополнительными параметрами
export async function POST(request: NextRequest) {
  try {
    const { 
      format = 'csv', 
      filters = {}, 
      columns = [], 
      title = 'Закупки',
      includeDetails = true 
    } = await request.json();

    console.log('📤 Purchases Export API (POST): Starting with custom parameters...');

    // Применяем фильтры из POST запроса
    const whereConditions: any = {};
    
    if (filters.ids && Array.isArray(filters.ids)) {
      whereConditions.id = { in: filters.ids };
    } else {
      if (filters.urgent !== undefined) {
        whereConditions.isurgent = filters.urgent;
      }
      if (filters.status) {
        whereConditions.status = filters.status;
      }
      if (filters.dateFrom || filters.dateTo) {
        whereConditions.createdat = {};
        if (filters.dateFrom) {
          whereConditions.createdat.gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          whereConditions.createdat.lte = new Date(filters.dateTo);
        }
      }
      if (filters.minAmount || filters.maxAmount) {
        whereConditions.totalamount = {};
        if (filters.minAmount) {
          whereConditions.totalamount.gte = filters.minAmount;
        }
        if (filters.maxAmount) {
          whereConditions.totalamount.lte = filters.maxAmount;
        }
      }
    }

    const purchases = await prisma.purchases.findMany({
      where: whereConditions,
      include: {
        purchase_items: includeDetails ? {
          include: {
            products: {
              select: {
                id: true,
                name: true
              }
            }
          }
        } : false,
        users: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true
          }
        }
      },
      orderBy: {
        createdat: 'desc'
      }
    });

    // Подготавливаем данные с учетом выбранных колонок
    const defaultColumns = [
      'ID', 'Дата создания', 'Статус', 'Срочная', 'Сумма (₺)', 
      'Поставщик', 'Товары', 'Количество позиций', 'Пользователь'
    ];
    const selectedColumns = columns.length > 0 ? columns : defaultColumns;

    const exportData = purchases.map((purchase: any) => {
      const fullData: any = {
        'ID': String(purchase.id),
        'Дата создания': new Date(purchase.createdat).toLocaleDateString('ru-RU'),
        'Статус': getStatusLabel(purchase.status),
        'Срочная': purchase.isurgent ? 'Да' : 'Нет',
        'Сумма (₺)': Number(purchase.totalamount || 0).toFixed(2),
        'Поставщик': purchase.suppliername || 'Не указан',
        'Товары': includeDetails && purchase.purchase_items ? 
          purchase.purchase_items.map((item: any) => 
            `${item.productname || 'Unknown'} (${item.quantity} шт. × ${item.costprice || 0} ₺)`
          ).join('; ') : 'Не включены',
        'Количество позиций': purchase.purchase_items ? purchase.purchase_items.length : 0,
        'Пользователь': purchase.users ? 
          `${purchase.users.first_name || ''} ${purchase.users.last_name || ''}`.trim() || purchase.users.email : 
          'Неизвестен',
        'Примечания': purchase.notes || '',
        'Телефон поставщика': purchase.supplierphone || '',
        'Адрес поставщика': purchase.supplieraddress || ''
      };

      // Возвращаем только выбранные колонки
      const filteredData: any = {};
      selectedColumns.forEach((column: string) => {
        if (fullData.hasOwnProperty(column)) {
          filteredData[column] = fullData[column];
        }
      });
      return filteredData;
    });

    console.log(`📤 Exporting ${purchases.length} purchases in ${format.toUpperCase()} format with custom parameters`);

    // Генерируем файл
    if (format === 'csv') {
      return generateCSV(exportData, title);
    } else if (format === 'xlsx') {
      return generateXLSX(exportData, title);
    } else if (format === 'pdf') {
      return generatePDF(exportData, title);
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error in POST export:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

// Вспомогательные функции для генерации файлов

function getStatusLabel(status: string): string {
  const statusLabels: { [key: string]: string } = {
    'draft': 'Черновик',
    'sent': 'Отправлено',
    'paid': 'Оплачено',
    'in_transit': 'В пути',
    'received': 'Получено',
    'cancelled': 'Отменено'
  };
  return statusLabels[status] || status;
}

function generateCSV(data: any[], title: string = 'Закупки'): NextResponse {
  if (data.length === 0) {
    return NextResponse.json({ error: 'No data to export' }, { status: 400 });
  }

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  // Обрабатываем каждую строку данных
  for (const row of data) {
    const csvRow = headers.map(header => {
      const value = row[header] || '';
      // Экранируем кавычки и переносы строк
      const escapedValue = String(value).replace(/"/g, '""');
      return `"${escapedValue}"`;
    }).join(',');
    csvRows.push(csvRow);
  }
  
  const csvContent = csvRows.join('\n');
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `${title}_${timestamp}.csv`;

  console.log('📤 CSV headers:', headers);
  console.log('📤 CSV rows count:', csvRows.length - 1);

  // Создаем Buffer с BOM для правильного отображения кириллицы в Excel
  const bom = Buffer.from([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
  const contentBuffer = Buffer.from(csvContent, 'utf8');
  const buffer = Buffer.concat([bom, contentBuffer]);

  return new Response(buffer, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Length': buffer.length.toString()
    }
  }) as NextResponse;
}

function generateXLSX(data: any[], title: string = 'Закупки'): NextResponse {
  // Для простоты возвращаем CSV с XLSX заголовками
  // В реальном проекте здесь должна быть библиотека типа xlsx
  console.log('⚠️ XLSX export not fully implemented, returning CSV format');
  
  if (data.length === 0) {
    return NextResponse.json({ error: 'No data to export' }, { status: 400 });
  }

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join('\t')]; // Используем табы для Excel
  
  for (const row of data) {
    const csvRow = headers.map(header => {
      const value = String(row[header] || '');
      // Для Excel убираем переносы строк и табы
      return value.replace(/[\r\n\t]/g, ' ');
    }).join('\t');
    csvRows.push(csvRow);
  }
  
  const csvContent = csvRows.join('\n');
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `${title}_${timestamp}.xlsx`;

  const bom = Buffer.from([0xEF, 0xBB, 0xBF]); // UTF-8 BOM
  const contentBuffer = Buffer.from(csvContent, 'utf8');
  const buffer = Buffer.concat([bom, contentBuffer]);

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Length': buffer.length.toString()
    }
  }) as NextResponse;
}

function generatePDF(data: any[], title: string = 'Закупки'): NextResponse {
  // Для простоты возвращаем HTML, который можно распечатать как PDF
  // В реальном проекте здесь должна быть библиотека типа puppeteer или jsPDF
  console.log('⚠️ PDF export not fully implemented, returning HTML format');
  
  if (data.length === 0) {
    return NextResponse.json({ error: 'No data to export' }, { status: 400 });
  }

  const headers = Object.keys(data[0]);
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; text-align: center; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; font-size: 12px; }
    th, td { border: 1px solid #ddd; padding: 6px; text-align: left; word-wrap: break-word; }
    th { background-color: #f2f2f2; font-weight: bold; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .timestamp { text-align: center; color: #666; margin-top: 20px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <table>
    <thead>
      <tr>
        ${headers.map(header => `<th>${header}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>
          ${headers.map(header => {
            const value = String(row[header] || '');
            // Экранируем HTML символы
            const escapedValue = value
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
            return `<td>${escapedValue}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="timestamp">
    Создано: ${new Date().toLocaleString('ru-RU')}
  </div>
</body>
</html>`;

  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `${title}_${timestamp}.html`;

  const buffer = Buffer.from(htmlContent, 'utf8');

  return new Response(buffer, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Length': buffer.length.toString()
    }
  }) as NextResponse;
} 