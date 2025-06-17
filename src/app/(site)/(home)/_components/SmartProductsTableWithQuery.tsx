"use client";

import { useState, useEffect, Suspense } from "react";
import { useDateRange } from "@/context/DateRangeContext";
import { useProductsAnalytics, useExchangeRate, useUpdateProduct } from "@/hooks/useProductsAnalytics";
import { PurchaseCartModal } from "./PurchaseCartModal";
import { EditablePriceTRY } from "./EditablePriceTRY";
import { EditableField } from "@/components/ui/EditableField";
import toast from 'react-hot-toast';

interface ProductAnalytics {
  id: number;
  name: string;
  brand: string;
  
  // ОСТАТКИ И ЗАПАСЫ
  currentStock: number;
  inTransitQuantity: number;
  totalAvailable: number;
  
  // СКОРОСТЬ ПРОДАЖ
  avgDailySales: number;
  daysUntilZero: number;
  stockStatus: 'critical' | 'low' | 'normal' | 'excess';
  
  // РЕКОМЕНДАЦИИ ПО ЗАКУПКАМ
  recommendedOrderQuantity: number;
  optimalStockLevel: number;
  
  // ФИНАНСОВЫЕ ПОКАЗАТЕЛИ
  avgPurchasePrice: number;
  avgpurchasepricetry: number;
  prime_cost: number;
  avgSalePrice: number;
  oldPrice?: number; // старая цена для отображения скидки
  profitMargin: number;
  profitMarginBasic: number;
  deliveryCostPerUnit: number;
  allocatedExpensesPerUnit: number;
  profitPerUnit: number;
  totalRealProfit: number;
  roi: number;
  
  // ДИНАМИКА И ТРЕНДЫ
  salesTrend: 'growing' | 'stable' | 'declining';
  salesVariability: 'stable' | 'moderate' | 'volatile';
  seasonalityFactor: number;
  
  // ABC/XYZ КЛАССИФИКАЦИЯ
  abcClass: 'A' | 'B' | 'C';
  xyzClass: 'X' | 'Y' | 'Z';
  
  // ПОКАЗАТЕЛИ ОБОРАЧИВАЕМОСТИ
  inventoryTurnover: number;
  avgInventoryValue: number;
  daysInInventory: number;
}

interface CartItem {
  id: number;
  name: string;
  brand: string;
  quantity: number;
  costPrice: number; // себестоимость в рублях
  costPriceTRY: number; // себестоимость в лирах
}

// Компонент статус бейджа для остатков
function StockStatusBadge({ status, daysUntilZero }: { status: string, daysUntilZero: number }) {
  const statusConfig = {
    critical: { 
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', 
      icon: '🔴', 
      text: `Критично (${daysUntilZero}д)` 
    },
    low: { 
      color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', 
      icon: '🟡', 
      text: `Мало (${daysUntilZero}д)` 
    },
    normal: { 
      color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', 
      icon: '🟢', 
      text: `Норма (${daysUntilZero}д)` 
    },
    excess: { 
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', 
      icon: '🔵', 
      text: `Избыток (${daysUntilZero}д)` 
    }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig];
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </span>
  );
}

// Компонент тренда продаж
function SalesTrendBadge({ trend }: { trend: string }) {
  const trendConfig = {
    growing: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: '📈', text: 'Растет' },
    stable: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', icon: '➡️', text: 'Стабильно' },
    declining: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: '📉', text: 'Падает' }
  };
  
  const config = trendConfig[trend as keyof typeof trendConfig];
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </span>
  );
}

// Компонент ABC/XYZ классификации
function ClassificationBadge({ abcClass, xyzClass }: { abcClass: string, xyzClass: string }) {
  const getABCColor = (cls: string) => {
    switch (cls) {
      case 'A': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'B': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'C': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  const getXYZColor = (cls: string) => {
    switch (cls) {
      case 'X': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Y': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Z': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  
  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${getABCColor(abcClass)}`}>
        {abcClass}
      </span>
      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${getXYZColor(xyzClass)}`}>
        {xyzClass}
      </span>
    </div>
  );
}

// Компонент кнопок корзины
interface ProductCartActionsProps {
  product: ProductAnalytics;
  cartItems: CartItem[];
  onAddToCart: (product: ProductAnalytics, quantity: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveFromCart: (id: number) => void;
}

function ProductCartActions({ 
  product, 
  cartItems, 
  onAddToCart, 
  onUpdateQuantity, 
  onRemoveFromCart 
}: ProductCartActionsProps) {
  const [quantity, setQuantity] = useState(product.recommendedOrderQuantity || 1);
  const [isAdding, setIsAdding] = useState(false);
  
  const cartItem = cartItems.find(item => item.id === product.id);
  const isInCart = !!cartItem;
  
  const handleAddToCart = async () => {
    setIsAdding(true);
    
    try {
      onAddToCart(product, quantity);
      toast.success(
        `${product.name} (${quantity} шт.) добавлено в корзину`,
        {
          duration: 2000,
          icon: '🛒',
          style: {
            borderRadius: '10px',
            background: '#1A6DFF',
            color: '#fff',
          },
        }
      );
    } catch (error) {
      toast.error('Ошибка при добавлении в корзину');
    } finally {
      setIsAdding(false);
    }
  };
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 9999) {
      setQuantity(newQuantity);
    }
  };
  
  if (isInCart) {
    return (
      <button className="w-full px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300 font-medium text-sm transition-colors hover:bg-green-100 dark:hover:bg-green-900/30">
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>✓ В корзине ({cartItem.quantity} шт.)</span>
        </div>
      </button>
    );
  }
  
  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`
        w-full px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-md transform hover:scale-105 active:scale-95 group
        ${product.recommendedOrderQuantity > 0 
          ? 'bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white hover:opacity-90' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
        }
        ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <div className="flex items-center justify-center gap-2">
        {isAdding ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Добавление...</span>
          </>
        ) : (
          <>
            {/* Встроенный stepper в кнопку */}
            <div className="flex items-center gap-1">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (quantity > 1) {
                    handleQuantityChange(quantity - 1);
                  }
                }}
                className={`w-6 h-6 flex items-center justify-center rounded border border-white/30 text-white/80 hover:bg-white/20 transition-colors cursor-pointer select-none ${
                  quantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                −
              </div>
              <span className="mx-2 min-w-[20px] text-center font-bold">{quantity}</span>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuantityChange(quantity + 1);
                }}
                className="w-6 h-6 flex items-center justify-center rounded border border-white/30 text-white/80 hover:bg-white/20 transition-colors cursor-pointer select-none"
              >
                +
              </div>
            </div>
            <span className="ml-2">🛒 в корзину</span>
          </>
        )}
      </div>
    </button>
  );
}

function SmartProductsTableContent() {
  // Состояние таблицы
  const [globalFilter, setGlobalFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(50);
  const [sortBy, setSortBy] = useState<keyof ProductAnalytics>('stockStatus');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Состояние корзины
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { dateRange } = useDateRange();

  // Рассчитываем период в днях
  const period = dateRange.from && dateRange.to 
    ? Math.max(1, Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)))
    : 31;

  // React Query hooks
  const { data: analyticsData, isLoading: loading, error } = useProductsAnalytics(period);
  const { data: exchangeRateData } = useExchangeRate('TRY');
  const updateProductMutation = useUpdateProduct();

  const products = analyticsData?.products || [];
  const summary = analyticsData?.summary;
  const exchangeRate = exchangeRateData?.rateWithBuffer;

  // Фильтрация товаров
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
    product.brand.toLowerCase().includes(globalFilter.toLowerCase())
  );

  // Сортировка
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  // Пагинация
  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const startIndex = currentPage * pageSize;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + pageSize);

  const handleSort = (column: keyof ProductAnalytics) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Функции для работы с корзиной
  const addToCart = (product: ProductAnalytics, quantity: number = 1) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setCartItems(prev => prev.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        brand: product.brand,
        quantity,
        costPrice: product.avgPurchasePrice || 0,
        costPriceTRY: 0 // будет рассчитано в модальном окне
      };
      setCartItems(prev => [...prev, newItem]);
    }
  };

  const updateCartQuantity = (id: number, quantity: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const updateCartCostPrice = (id: number, costPrice: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, costPrice } : item
    ));
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const openCartModal = () => {
    setIsCartOpen(true);
  };

  const createPurchase = async (items: CartItem[], totalTRY: number, totalRUB: number, supplierName: string = 'Поставщик Турция', notes: string = '') => {
    try {
      // Получаем актуальный курс лиры
      const currentExchangeRate = exchangeRate || 2.02;

      // Пересчитываем цены в лирах для каждого товара
      const itemsWithTRY = items.map(item => ({
        ...item,
        costPriceTRY: item.costPrice / currentExchangeRate
      }));

      const response = await fetch('/api/purchases/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: itemsWithTRY,
          totalTRY,
          totalRUB,
          supplierName,
          notes,
          exchangeRate: currentExchangeRate,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка при создании закупки');
      }

      // Очищаем корзину после успешного создания
      setCartItems([]);
      
      toast.success(`Закупка успешно создана! ID: ${result.data.id}`);
    } catch (error) {
      console.error('Ошибка создания закупки:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка при создании закупки');
    }
  };

  // Функции для обновления товара
  const handleUpdateStock = async (productId: number, newStock: number) => {
    try {
      await updateProductMutation.mutateAsync({
        id: productId,
        data: { stock_quantity: newStock },
        period,
      });
      toast.success('Остаток товара обновлен');
    } catch (error) {
      toast.error('Ошибка при обновлении остатка');
      throw error;
    }
  };

  const handleUpdatePrice = async (productId: number, newPrice: number) => {
    try {
      await updateProductMutation.mutateAsync({
        id: productId,
        data: { price: newPrice },
        period,
      });
      toast.success('Цена товара обновлена');
    } catch (error) {
      toast.error('Ошибка при обновлении цены');
      throw error;
    }
  };

  const handleUpdateOldPrice = async (productId: number, newOldPrice: number) => {
    try {
      await updateProductMutation.mutateAsync({
        id: productId,
        data: { old_price: newOldPrice },
        period,
      });
      toast.success('Старая цена обновлена');
    } catch (error) {
      toast.error('Ошибка при обновлении старой цены');
      throw error;
    }
  };

  if (loading) {
    return (
      <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-dark dark:text-white">Загрузка умной аналитики...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-center py-16">
          <div className="text-red-500 dark:text-red-400">Ошибка: {error.message}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* Сводка */}
      {summary && (
        <div className="border-b border-stroke px-7.5 py-4.5 dark:border-dark-3">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{summary.criticalStock}</div>
              <div className="text-xs text-gray-500">Критичные остатки</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{summary.lowStock}</div>
              <div className="text-xs text-gray-500">Мало товара</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{summary.needsReorder}</div>
              <div className="text-xs text-gray-500">Нужно заказать</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{summary.avgProfitMargin}%</div>
              <div className="text-xs text-gray-500">Средняя маржа</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-dark dark:text-white">{summary.totalProducts}</div>
              <div className="text-xs text-gray-500">Всего товаров</div>
            </div>
          </div>
        </div>
      )}

      {/* Поиск и фильтры */}
      <div className="flex flex-col gap-4 border-b border-stroke px-7.5 py-4.5 dark:border-dark-3 sm:flex-row-reverse sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-0">
        <div className="flex items-center gap-4">
          <div className="relative z-20 w-full max-w-[414px]">
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full rounded-lg border border-stroke bg-transparent px-5 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary dark:text-white"
              placeholder="Поиск товаров..."
            />
            <button className="absolute right-0 top-0 flex h-11.5 w-11.5 items-center justify-center rounded-r-md bg-primary text-white hover:bg-opacity-90 transition-colors duration-200">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" className="size-4.5">
                <path fillRule="evenodd" clipRule="evenodd" d="M8.625 2.0625C5.00063 2.0625 2.0625 5.00063 2.0625 8.625C2.0625 12.2494 5.00063 15.1875 8.625 15.1875C12.2494 15.1875 15.1875 12.2494 15.1875 8.625C15.1875 5.00063 12.2494 2.0625 8.625 2.0625ZM0.9375 8.625C0.9375 4.37931 4.37931 0.9375 8.625 0.9375C12.8707 0.9375 16.3125 4.37931 16.3125 8.625C16.3125 10.5454 15.6083 12.3013 14.4441 13.6487L16.8977 16.1023C17.1174 16.3219 17.1174 16.6781 16.8977 16.8977C16.6781 17.1174 16.3219 17.1174 16.1023 16.8977L13.6487 14.4441C12.3013 15.6083 10.5454 16.3125 8.625 16.3125C4.37931 16.3125 0.9375 12.8707 0.9375 8.625Z" />
              </svg>
            </button>
          </div>
          
          {/* Кнопка корзины */}
          <button
            onClick={openCartModal}
            className="relative px-4 py-2.5 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white rounded-lg hover:opacity-90 transition-all duration-200 hover:shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L6 5H4m1 8v5a2 2 0 002 2h10a2 2 0 002-2v-5m-12 0h12" />
            </svg>
            <span className="hidden sm:inline">Корзина</span>
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-stroke dark:border-dark-3">
              <th className="cursor-pointer px-4 py-4 text-left font-medium text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => handleSort('name')}>
                Товар ↕️
              </th>
              <th className="cursor-pointer px-4 py-4 text-left font-medium text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => handleSort('stockStatus')}>
                Статус остатков ↕️
              </th>
              <th className="cursor-pointer px-4 py-4 text-left font-medium text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => handleSort('avgDailySales')}>
                Продажи/день ↕️
              </th>
              <th className="cursor-pointer px-4 py-4 text-left font-medium text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => handleSort('recommendedOrderQuantity')}>
                К заказу ↕️
              </th>
              <th className="cursor-pointer px-4 py-4 text-left font-medium text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => handleSort('salesTrend')}>
                Тренд ↕️
              </th>
              <th className="cursor-pointer px-4 py-4 text-left font-medium text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => handleSort('profitMargin')} title="Реальная маржа с учетом всех расходов: доставка (350₽/шт) + общие расходы">
                Реальная маржа ↕️
              </th>
              <th className="cursor-pointer px-4 py-4 text-left font-medium text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => handleSort('abcClass')}>
                ABC/XYZ ↕️
              </th>
              <th className="px-4 py-4 text-left font-medium text-dark dark:text-white">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center font-medium text-dark-5 dark:text-dark-6">
                  {globalFilter ? 'Товары не найдены по запросу' : 'Товары не найдены'}
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => (
                <tr key={product.id} className="border-t border-stroke hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-dark dark:text-white mb-2">{product.name}</div>
                      
                      {/* Цены с возможностью редактирования */}
                      <div className="space-y-1.5">
                        {/* Цена продажи */}
                        <div className="flex items-center gap-2">
                          <span className="text-purple-600 dark:text-purple-400">🏷️</span>
                          <EditableField
                            value={product.avgSalePrice}
                            label="цену продажи"
                            suffix="₽"
                            type="decimal"
                            min={0}
                            onSave={(value) => handleUpdatePrice(product.id, value)}
                            isLoading={updateProductMutation.isPending}
                            displayClassName="text-purple-600 dark:text-purple-400"
                            formatDisplay={(value) => `${value.toLocaleString()} ₽ (продажа)`}
                          />
                        </div>

                        {/* Старая цена (если есть) */}
                        {product.oldPrice !== undefined && product.oldPrice > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">💸</span>
                            <EditableField
                              value={product.oldPrice}
                              label="старую цену"
                              suffix="₽"
                              type="decimal"
                              min={0}
                              onSave={(value) => handleUpdateOldPrice(product.id, value)}
                              isLoading={updateProductMutation.isPending}
                              displayClassName="text-gray-500 line-through"
                              formatDisplay={(value) => `${value.toLocaleString()} ₽ (старая)`}
                            />
                          </div>
                        )}

                        {/* Добавить старую цену если ее нет */}
                        {(!product.oldPrice || product.oldPrice === 0) && (
                          <button
                            onClick={() => handleUpdateOldPrice(product.id, product.avgSalePrice)}
                            className="text-xs text-blue-500 hover:text-blue-700 underline"
                          >
                            + Добавить старую цену
                          </button>
                        )}

                        {/* Себестоимость (только отображение) */}
                        {exchangeRate && (
                          <>
                            <div className="text-xs text-green-600 dark:text-green-400">
                              💰 {Math.round(product.prime_cost * exchangeRate).toLocaleString()} ₽ (себест.)
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              💸 ₺{product.prime_cost.toFixed(2)}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Остаток с возможностью редактирования */}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-gray-400">Остаток:</span>
                        <EditableField
                          value={product.currentStock}
                          label="остаток товара"
                          suffix="шт."
                          type="integer"
                          min={0}
                          onSave={(value) => handleUpdateStock(product.id, value)}
                          isLoading={updateProductMutation.isPending}
                          displayClassName="text-xs"
                          formatDisplay={(value) => `${value} шт.`}
                        />
                        <span className="text-xs text-gray-400">+ {product.inTransitQuantity} в пути</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StockStatusBadge status={product.stockStatus} daysUntilZero={product.daysUntilZero} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-dark dark:text-white">{product.avgDailySales} шт</div>
                    <div className="text-xs text-gray-500">≈ {(product.avgDailySales * 30).toFixed(0)} в месяц</div>
                  </td>
                  <td className="px-4 py-4">
                    {product.recommendedOrderQuantity > 0 ? (
                      <div>
                        <div className="font-bold text-blue-600 dark:text-blue-400">{product.recommendedOrderQuantity} шт</div>
                        <div className="text-xs text-gray-500">Оптимум: {product.optimalStockLevel}</div>
                      </div>
                    ) : (
                      <span className="text-gray-500">Достаточно</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <SalesTrendBadge trend={product.salesTrend} />
                    <div className="text-xs text-gray-500 mt-1">Вариативность: {product.salesVariability}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-dark dark:text-white" title={`Реальная маржа с учетом всех расходов:\n• Доставка: ${product.deliveryCostPerUnit}₽/шт\n• Общие расходы: ${product.allocatedExpensesPerUnit}₽/шт\n• Без расходов: ${product.profitMarginBasic}%\n• Прибыль с единицы: ${product.profitPerUnit}₽`}>
                      {product.profitMargin}%
                    </div>
                    <div className="text-xs text-gray-500">
                      <span title={`Прибыль с единицы: ${product.profitPerUnit}₽`}>
                        💰 {product.profitPerUnit}₽/шт
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      <span title={`Доставка: ${product.deliveryCostPerUnit}₽ + Общие: ${product.allocatedExpensesPerUnit}₽`}>
                        📦 {product.deliveryCostPerUnit}₽ + 📊 {product.allocatedExpensesPerUnit}₽
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      ROI: {product.roi}%
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <ClassificationBadge abcClass={product.abcClass} xyzClass={product.xyzClass} />
                  </td>
                  <td className="px-4 py-4">
                    <ProductCartActions 
                      product={product}
                      cartItems={cartItems}
                      onAddToCart={addToCart}
                      onUpdateQuantity={updateCartQuantity}
                      onRemoveFromCart={removeFromCart}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      <div className="flex flex-col gap-4 px-7.5 py-7 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="flex items-center">
          <button
            className="flex items-center justify-center rounded-[3px] p-[7px] hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-50 transition-colors duration-200 text-dark-5 dark:text-dark-6"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>

          {Array.from({ length: totalPages }, (_, index) => index).map((pageIndex) => (
            <button
              key={pageIndex}
              onClick={() => handlePageChange(pageIndex)}
              className={`mx-1 flex items-center justify-center rounded-[3px] p-1.5 px-[15px] font-medium transition-colors duration-200 hover:bg-primary hover:text-white ${
                currentPage === pageIndex
                  ? "bg-primary text-white"
                  : "text-dark-5 dark:text-dark-6"
              }`}
            >
              {pageIndex + 1}
            </button>
          ))}

          <button
            className="flex items-center justify-center rounded-[3px] p-[7px] hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-50 transition-colors duration-200 text-dark-5 dark:text-dark-6"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>

        <p className="font-medium text-dark dark:text-white">
          Показано {Math.min(startIndex + 1, sortedProducts.length)} - {Math.min(startIndex + pageSize, sortedProducts.length)} из{" "}
          {sortedProducts.length} записей
          {globalFilter && ` (отфильтровано из ${products.length})`}
        </p>
      </div>

      {/* Модальное окно корзины */}
      <PurchaseCartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onUpdateCostPrice={updateCartCostPrice}
        onRemoveItem={removeFromCart}
        onCreatePurchase={createPurchase}
      />
    </section>
  );
}

export function SmartProductsTable() {
  return (
    <Suspense fallback={
      <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-dark dark:text-white">Загрузка умной аналитики...</span>
        </div>
      </section>
    }>
      <SmartProductsTableContent />
    </Suspense>
  );
} 