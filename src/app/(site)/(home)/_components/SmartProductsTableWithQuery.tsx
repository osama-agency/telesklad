"use client";

import { useState, useEffect, Suspense } from "react";
import { useDateRange } from "@/context/DateRangeContext";
import { useProductsAnalytics, useExchangeRate, useUpdateProduct, useCreatePurchase } from "@/hooks/useProductsAnalytics";
import { PurchaseCartModal } from "./PurchaseCartModal";
import { EditablePriceTRY } from "./EditablePriceTRY";
import { EditableField } from "@/components/ui/EditableField";
import { EditProductModal } from "@/components/Modals/EditProductModal";
import AddProductModal from "@/components/Modals/AddProductModal";
import toast from 'react-hot-toast';

interface ProductAnalytics {
  id: string;
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
  
  // ВИДИМОСТЬ В WEBAPP
  show_in_webapp?: boolean;
}

interface CartItem {
  id: string;
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
  onEditProduct: (product: ProductAnalytics) => void;
}

function ProductCartActions({ 
  product, 
  cartItems, 
  onAddToCart, 
  onUpdateQuantity, 
  onRemoveFromCart,
  onEditProduct 
}: ProductCartActionsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [quantity, setQuantity] = useState(product.recommendedOrderQuantity || 1);
  
  const cartItem = cartItems.find(item => item.id === product.id);
  const isInCart = !!cartItem;
  const recommendedQty = product.recommendedOrderQuantity || 1;
  
  const handleQuickAdd = async (qty: number) => {
    setIsAdding(true);
    
    try {
      onAddToCart(product, qty);
      toast.success(
        `${product.name} (${qty} шт.) добавлено в корзину`,
        {
          duration: 1500,
          icon: '🛒',
          style: {
            borderRadius: '8px',
            background: '#1A6DFF',
            color: '#fff',
            fontSize: '14px',
          },
        }
      );
    } catch (error) {
      toast.error('Ошибка при добавлении в корзину');
    } finally {
      setIsAdding(false);
      setShowQuantitySelector(false);
    }
  };

  const handleCustomAdd = async () => {
    await handleQuickAdd(quantity);
  };
  
  // Состояние "уже в корзине"
  if (isInCart) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex-1 px-2 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md text-green-700 dark:text-green-300 text-xs font-medium text-center">
          ✓ {cartItem.quantity}
        </div>
        <button
          onClick={() => onRemoveFromCart(product.id)}
          className="w-6 h-6 flex items-center justify-center rounded-md bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          title="Удалить из корзины"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  }

  // Селектор количества
  if (showQuantitySelector) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
            disabled={quantity <= 1}
          >
            −
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-12 h-6 text-center text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            min="1"
          />
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
          >
            +
          </button>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleCustomAdd}
            disabled={isAdding}
            className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isAdding ? '...' : '✓'}
          </button>
          <button
            onClick={() => setShowQuantitySelector(false)}
            className="px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // Основные кнопки добавления
  if (recommendedQty > 0) {
    return (
      <div className="flex gap-1">
        {/* Кнопка редактирования */}
        <button
          onClick={() => onEditProduct(product)}
          className="w-7 h-7 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          title="Редактировать товар"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        
        {/* Быстрое добавление рекомендуемого количества */}
        <button
          onClick={() => handleQuickAdd(recommendedQty)}
          disabled={isAdding}
          className="flex-1 px-2 py-1.5 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white text-xs font-medium rounded-md hover:opacity-90 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-1"
          title={`Добавить ${recommendedQty} шт. (рекомендуемое количество)`}
        >
          {isAdding ? (
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>{recommendedQty}</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Для товаров без рекомендации к заказу
  return (
    <div className="flex gap-1">
      {/* Кнопка редактирования */}
      <button
        onClick={() => onEditProduct(product)}
        className="w-7 h-7 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        title="Редактировать товар"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      
      <button
        onClick={() => setShowQuantitySelector(true)}
        className="flex-1 px-2 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
        title="Товар в достатке, но можно добавить в корзину"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Добавить</span>
      </button>
    </div>
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
  
  // Состояние модального окна редактирования товара
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<{
    id: number;
    name: string | null;
    description: string | null;
    price: number | null;
    stock_quantity: number;
    ancestry: string | null;
    weight: string | null;
    dosage_form: string | null;
    package_quantity: number | null;
    main_ingredient: string | null;
    brand: string | null;
    old_price: number | null;
    prime_cost: number | null;
    is_visible: boolean | null;
    avgpurchasepricerub: number | null;
    avgpurchasepricetry: number | null;
    quantity_in_transit: number | null;
  } | null>(null);

  // Состояние модального окна добавления товара
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  
  // Состояние показа скрытых товаров
  const [showHiddenProducts, setShowHiddenProducts] = useState(false);
  
  // Состояния фильтров
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [webappVisibilityFilter, setWebappVisibilityFilter] = useState<string>('all');

  const { dateRange } = useDateRange();

  // Рассчитываем период в днях
  const period = dateRange.from && dateRange.to 
    ? Math.max(1, Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)))
    : 31;

  // React Query hooks
  const { data: analyticsData, isLoading: loading, error } = useProductsAnalytics(
    period, 
    showHiddenProducts, 
    categoryFilter, 
    webappVisibilityFilter
  );
  const { data: exchangeRateData } = useExchangeRate('TRY');
  const updateProductMutation = useUpdateProduct();
  const createPurchaseMutation = useCreatePurchase();

  const products = analyticsData?.products || [];
  const summary = analyticsData?.summary;
  const exchangeRate = exchangeRateData?.rateWithBuffer;

  // Константы для категорий
  const categoryOptions = [
    { value: 'all', label: 'Все категории' },
    { value: '23/20', label: 'СДВГ препараты' },
    { value: '23/21', label: 'Добавки и витамины' },
    { value: '23/24', label: 'Контрацептивы' },
    { value: '23/36', label: 'Другие препараты' },
  ];

  const webappVisibilityOptions = [
    { value: 'all', label: 'Все товары' },
    { value: 'visible', label: 'Видимые в WebApp' },
    { value: 'hidden', label: 'Скрытые в WebApp' },
  ];

  // Фильтрация товаров (только по поиску, остальные фильтры обрабатываются на сервере)
  const filteredProducts = products.filter(product => {
    // Фильтр по поиску
    const matchesSearch = product.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
      product.brand.toLowerCase().includes(globalFilter.toLowerCase());
    
    return matchesSearch;
  });

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
        costPrice: (product.prime_cost || 0) * (exchangeRate || 2.1), // себестоимость в рублях
        costPriceTRY: product.prime_cost || 0 // себестоимость в лирах из prime_cost
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
      // Используем уже правильные значения costPriceTRY из prime_cost
      const itemsWithTRY = items.map(item => ({
        ...item
        // costPriceTRY уже содержит правильное значение из prime_cost
      }));

      await createPurchaseMutation.mutate({
        items: itemsWithTRY,
        totalTRY,
        totalRUB,
        supplierName,
        notes,
      });

      // Очищаем корзину после успешного создания
      setCartItems([]);
      
      toast.success('Закупка успешно создана!');
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

  const handleUpdatePrimeCost = async (productId: number, newPrimeCost: number) => {
    try {
      await updateProductMutation.mutateAsync({
        id: productId,
        data: { prime_cost: newPrimeCost },
        period,
      });
      toast.success('Себестоимость в лирах обновлена');
    } catch (error) {
      toast.error('Ошибка при обновлении себестоимости');
      throw error;
    }
  };

  // Функция открытия модального окна редактирования
  const handleEditProduct = async (product: ProductAnalytics) => {
    try {
      console.log('handleEditProduct: Starting with product:', product);
      
      // Загружаем полные данные товара из API
      const response = await fetch(`/api/products/${product.id}`);
      console.log('handleEditProduct: API response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке данных товара');
      }
      
      const fullProduct = await response.json();
      console.log('handleEditProduct: Full product from API:', fullProduct);
      
      // Преобразуем данные в нужный формат
      const productForEdit = {
        id: fullProduct.id,
        name: fullProduct.name || product.name,
        description: fullProduct.description || null,
        price: fullProduct.price || product.avgSalePrice,
        stock_quantity: fullProduct.stock_quantity || product.currentStock,
        ancestry: fullProduct.ancestry || null,
        weight: fullProduct.weight || null,
        dosage_form: fullProduct.dosage_form || null,
        package_quantity: fullProduct.package_quantity || null,
        main_ingredient: fullProduct.main_ingredient || null,
        brand: fullProduct.brand || product.brand,
        old_price: fullProduct.old_price || product.oldPrice || null,
        prime_cost: fullProduct.prime_cost || product.prime_cost,
        is_visible: fullProduct.is_visible !== undefined ? fullProduct.is_visible : true,
        avgpurchasepricerub: fullProduct.avgpurchasepricerub || product.avgPurchasePrice,
        avgpurchasepricetry: fullProduct.avgpurchasepricetry || product.avgpurchasepricetry,
        quantity_in_transit: fullProduct.quantity_in_transit || product.inTransitQuantity,
      };
      
      console.log('handleEditProduct: Product for edit:', productForEdit);
      
      setEditingProduct(productForEdit);
      setIsEditProductModalOpen(true);
    } catch (error) {
      console.error('Error loading product data:', error);
      toast.error('Ошибка при загрузке данных товара');
    }
  };

  // Функция закрытия модального окна редактирования
  const handleCloseEditModal = () => {
    setEditingProduct(null);
    setIsEditProductModalOpen(false);
  };

  // Функция сохранения изменений товара
  const handleSaveProduct = (updatedProduct: any) => {
    // Обновляем данные после сохранения
    setEditingProduct(null);
    setIsEditProductModalOpen(false);
    window.location.reload(); // Простое решение
  };

  // Функция удаления товара
  const handleDeleteProduct = (productId: number) => {
    // Обновляем данные после удаления
    setEditingProduct(null);
    setIsEditProductModalOpen(false);
    window.location.reload(); // Простое решение для обновления данных
  };

  // Функция обновления данных после добавления товара
  const handleProductAdded = () => {
    // Обновляем таблицу после добавления товара
    window.location.reload(); // Простое решение для обновления данных
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A6DFF]"></div>
          <span className="ml-3 text-[#1E293B] dark:text-white">Загрузка умной аналитики...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-16">
          <div className="text-red-500 dark:text-red-400">Ошибка: {(error as any)?.message || 'Неизвестная ошибка'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-[#1A6DFF]/30 dark:hover:border-[#1A6DFF]/30 transition-all duration-300">
      {/* Индикатор режима скрытых товаров */}
      {showHiddenProducts && (
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-3 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
            <span className="font-medium">Отображаются скрытые товары</span>
            <span className="text-sm opacity-75">(товары с отключенной видимостью в админке)</span>
          </div>
        </div>
      )}

      {/* Сводка */}
      {summary && !showHiddenProducts && (
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{summary.criticalStock}</div>
              <div className="text-xs text-[#64748B] dark:text-gray-400">Критичные остатки</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{summary.lowStock}</div>
              <div className="text-xs text-[#64748B] dark:text-gray-400">Мало товара</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{summary.needsReorder}</div>
              <div className="text-xs text-[#64748B] dark:text-gray-400">Нужно заказать</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{summary.inTransitTotal || 0}</div>
              <div className="text-xs text-[#64748B] dark:text-gray-400">В пути</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{summary.avgProfitMargin}%</div>
              <div className="text-xs text-[#64748B] dark:text-gray-400">Средняя маржа</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1E293B] dark:text-white">{summary.totalProducts}</div>
              <div className="text-xs text-[#64748B] dark:text-gray-400">Всего товаров</div>
            </div>
          </div>
        </div>
      )}

      {/* Поиск и фильтры */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-5">
        {/* Первая строка - поиск и кнопки действий */}
        <div className="flex flex-col gap-4 sm:flex-row-reverse sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-0 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative z-20 w-full max-w-[414px]">
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent px-5 py-2.5 outline-none focus:border-[#1A6DFF] focus:ring-2 focus:ring-[#1A6DFF]/20 dark:text-white transition-all duration-300"
              placeholder="Поиск товаров..."
            />
            <button className="absolute right-0 top-0 flex h-11.5 w-11.5 items-center justify-center rounded-r-md bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white hover:scale-105 transition-all duration-200">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" className="size-4.5">
                <path fillRule="evenodd" clipRule="evenodd" d="M8.625 2.0625C5.00063 2.0625 2.0625 5.00063 2.0625 8.625C2.0625 12.2494 5.00063 15.1875 8.625 15.1875C12.2494 15.1875 15.1875 12.2494 15.1875 8.625C15.1875 5.00063 12.2494 2.0625 8.625 2.0625ZM0.9375 8.625C0.9375 4.37931 4.37931 0.9375 8.625 0.9375C12.8707 0.9375 16.3125 4.37931 16.3125 8.625C16.3125 10.5454 15.6083 12.3013 14.4441 13.6487L16.8977 16.1023C17.1174 16.3219 17.1174 16.6781 16.8977 16.8977C16.6781 17.1174 16.3219 17.1174 16.1023 16.8977L13.6487 14.4441C12.3013 15.6083 10.5454 16.3125 8.625 16.3125C4.37931 16.3125 0.9375 12.8707 0.9375 8.625Z" />
              </svg>
            </button>
            </div>
          </div>
          
          {/* Кнопка показа скрытых товаров */}
          <button
            onClick={() => setShowHiddenProducts(!showHiddenProducts)}
            className={`px-4 py-2.5 rounded-lg hover:scale-105 transition-all duration-300 hover:shadow-md flex items-center gap-2 ${
              showHiddenProducts 
                ? 'bg-gray-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showHiddenProducts ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              )}
            </svg>
            <span className="hidden sm:inline">
              {showHiddenProducts ? 'Скрыть скрытые' : 'Показать скрытые'}
            </span>
          </button>

          {/* Кнопка добавления товара */}
          <button
            onClick={() => setIsAddProductModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white rounded-lg hover:scale-105 transition-all duration-300 hover:shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Новый товар</span>
          </button>
          
          {/* Кнопка корзины */}
          <button
            onClick={openCartModal}
            className="relative px-4 py-2.5 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white rounded-lg hover:scale-105 transition-all duration-300 hover:shadow-md flex items-center gap-2"
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

        {/* Вторая строка - фильтры */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* Фильтр по категориям */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[#1E293B] dark:text-white whitespace-nowrap">
              Категория:
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-[#1A6DFF] focus:ring-2 focus:ring-[#1A6DFF]/20 dark:text-white transition-all duration-300"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Фильтр по видимости в WebApp (только если не показываем скрытые товары) */}
          {!showHiddenProducts && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-[#1E293B] dark:text-white whitespace-nowrap">
                WebApp:
              </label>
              <select
                value={webappVisibilityFilter}
                onChange={(e) => {
                  setWebappVisibilityFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none focus:border-[#1A6DFF] focus:ring-2 focus:ring-[#1A6DFF]/20 dark:text-white transition-all duration-300"
              >
                {webappVisibilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Счетчик отфильтрованных товаров */}
          <div className="text-sm text-[#64748B] dark:text-gray-400 ml-auto">
            {filteredProducts.length} из {products.length} товаров
          </div>
        </div>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-gray-200 dark:border-gray-700">
              <th className="cursor-pointer px-4 py-4 text-left font-medium text-[#1E293B] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200" onClick={() => handleSort('name')}>
                Товар ↕️
              </th>
              <th className="cursor-pointer px-4 py-4 text-left font-medium text-[#1E293B] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200" onClick={() => handleSort('stockStatus')}>
                Статус остатков ↕️
              </th>
              <th className="cursor-pointer px-4 py-4 text-left font-medium text-[#1E293B] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200" onClick={() => handleSort('avgDailySales')}>
                Продажи/день ↕️
              </th>
              <th className="cursor-pointer px-4 py-4 text-left font-medium text-[#1E293B] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200" onClick={() => handleSort('recommendedOrderQuantity')}>
                К заказу ↕️
              </th>
              <th className="cursor-pointer px-4 py-4 text-left font-medium text-[#1E293B] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200" onClick={() => handleSort('salesTrend')}>
                Тренд ↕️
              </th>
              <th className="cursor-pointer px-4 py-4 text-left font-medium text-[#1E293B] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200" onClick={() => handleSort('profitMargin')} title="Реальная маржа с учетом всех расходов: доставка (350₽/шт) + общие расходы">
                Реальная маржа ↕️
              </th>
              <th className="cursor-pointer px-4 py-4 text-left font-medium text-[#1E293B] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200" onClick={() => handleSort('abcClass')}>
                ABC/XYZ ↕️
              </th>
              <th className="px-4 py-4 text-left font-medium text-[#1E293B] dark:text-white w-28">
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center font-medium text-[#64748B] dark:text-gray-400">
                  {globalFilter ? 'Товары не найдены по запросу' : 'Товары не найдены'}
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => (
                <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-[#1E293B] dark:text-white mb-2">{product.name}</div>
                      
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

                        {/* Себестоимость с возможностью редактирования */}
                        {exchangeRate && (
                          <>
                            <div className="text-xs text-green-600 dark:text-green-400">
                              💰 {Math.round(product.prime_cost * exchangeRate).toLocaleString()} ₽ (себест.)
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600 dark:text-blue-400">💸</span>
                              <EditableField
                                value={product.prime_cost}
                                label="себестоимость в лирах"
                                suffix="₺"
                                type="decimal"
                                min={0}
                                step={0.01}
                                onSave={(value) => handleUpdatePrimeCost(product.id, value)}
                                isLoading={updateProductMutation.isPending}
                                displayClassName="text-xs text-blue-600 dark:text-blue-400"
                                formatDisplay={(value) => `₺${value.toFixed(2)} (себест.)`}
                              />
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
                    <div className="font-medium text-[#1E293B] dark:text-white">{product.avgDailySales} шт</div>
                    <div className="text-xs text-[#64748B] dark:text-gray-400">≈ {(product.avgDailySales * 30).toFixed(0)} в месяц</div>
                  </td>
                  <td className="px-4 py-4">
                    {product.recommendedOrderQuantity > 0 ? (
                      <div>
                        <div className="font-bold text-blue-600 dark:text-blue-400">{product.recommendedOrderQuantity} шт</div>
                        <div className="text-xs text-[#64748B] dark:text-gray-400">Оптимум: {product.optimalStockLevel}</div>
                      </div>
                    ) : (
                      <span className="text-[#64748B] dark:text-gray-400">Достаточно</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <SalesTrendBadge trend={product.salesTrend} />
                    <div className="text-xs text-[#64748B] dark:text-gray-400 mt-1">Вариативность: {product.salesVariability}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-[#1E293B] dark:text-white" title={`Реальная маржа с учетом всех расходов:\n• Доставка: ${product.deliveryCostPerUnit}₽/шт\n• Общие расходы: ${product.allocatedExpensesPerUnit}₽/шт\n• Без расходов: ${product.profitMarginBasic}%\n• Прибыль с единицы: ${product.profitPerUnit}₽`}>
                      {product.profitMargin}%
                    </div>
                    <div className="text-xs text-[#64748B] dark:text-gray-400">
                      <span title={`Прибыль с единицы: ${product.profitPerUnit}₽`}>
                        💰 {product.profitPerUnit}₽/шт
                      </span>
                    </div>
                    <div className="text-xs text-[#64748B] dark:text-gray-400">
                      <span title={`Доставка: ${product.deliveryCostPerUnit}₽ + Общие: ${product.allocatedExpensesPerUnit}₽`}>
                        📦 {product.deliveryCostPerUnit}₽ + 📊 {product.allocatedExpensesPerUnit}₽
                      </span>
                    </div>
                    <div className="text-xs text-[#64748B] dark:text-gray-400">
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
                      onEditProduct={handleEditProduct}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Пагинация */}
      <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="flex items-center">
          <button
            className="flex items-center justify-center rounded-lg p-2 hover:bg-gradient-to-r hover:from-[#1A6DFF] hover:to-[#00C5FF] hover:text-white disabled:pointer-events-none disabled:opacity-50 transition-all duration-300 text-[#64748B] dark:text-gray-400 hover:scale-105"
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
              className={`mx-1 flex items-center justify-center rounded-lg p-2 px-4 font-medium transition-all duration-300 hover:scale-105 ${
                currentPage === pageIndex
                  ? "bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white"
                  : "text-[#64748B] dark:text-gray-400 hover:bg-gradient-to-r hover:from-[#1A6DFF] hover:to-[#00C5FF] hover:text-white"
              }`}
            >
              {pageIndex + 1}
            </button>
          ))}

          <button
            className="flex items-center justify-center rounded-lg p-2 hover:bg-gradient-to-r hover:from-[#1A6DFF] hover:to-[#00C5FF] hover:text-white disabled:pointer-events-none disabled:opacity-50 transition-all duration-300 text-[#64748B] dark:text-gray-400 hover:scale-105"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>

        <p className="font-medium text-[#1E293B] dark:text-white">
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

      {/* Модальное окно добавления товара */}
      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={handleProductAdded}
      />

      {/* Модальное окно редактирования товара */}
      <EditProductModal
        isOpen={isEditProductModalOpen}
        onClose={handleCloseEditModal}
        product={editingProduct}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
}

export function SmartProductsTable() {
  return (
    <Suspense fallback={
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A6DFF]"></div>
          <span className="ml-3 text-[#1E293B] dark:text-white">Загрузка умной аналитики...</span>
        </div>
      </div>
    }>
      <SmartProductsTableContent />
    </Suspense>
  );
} 