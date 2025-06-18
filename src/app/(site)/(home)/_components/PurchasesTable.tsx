"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Purchase, PurchaseItem } from "../../purchases/types";
import { ReceivePurchaseModal } from "@/components/Modals/ReceivePurchaseModal";
import PurchaseModal from "@/components/Modals/PurchaseModal";

interface Product {
  id: number;
  name: string;
}

interface PurchasesTableProps {
  className?: string;
}

interface ReceiveModalData {
  purchase: Purchase;
  items: Array<{
    id: number;
    productName: string;
    ordered: number;
    received: number;
    expenses: number;
  }>;
}

// Типы для модального окна редактирования (совместимость с PurchaseModal)
interface ModalPurchase {
  id: number;
  totalAmount: number;
  isUrgent: boolean;
  expenses?: number;
  status: "draft" | "sent" | "awaiting_payment" | "paid" | "in_transit" | "received" | "cancelled";
  items: ModalPurchaseItem[];
  createdAt: string;
  updatedAt: string;
}

interface ModalPurchaseItem {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  costPrice: number;
  total: number;
}

interface ModalProduct {
  id: number;
  name: string;
  prime_cost?: number;
  avgPurchasePriceRub?: number;
}

export function PurchasesTable({ className }: PurchasesTableProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveModalData, setReceiveModalData] = useState<ReceiveModalData | null>(null);
  const [currentReceivingPurchase, setCurrentReceivingPurchase] = useState<Purchase | null>(null);
  
  // Состояния для модального окна редактирования
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<ModalPurchase | null>(null);
  const [modalProducts, setModalProducts] = useState<ModalProduct[]>([]);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [sendingToTelegram, setSendingToTelegram] = useState<number | null>(null);

  // Загружаем данные
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔧 Loading data...');
        
        // Загружаем закупки и товары параллельно
        const [purchasesResponse, productsResponse] = await Promise.all([
          fetch('/api/purchases'),
          fetch('/api/products/simple')
        ]);
        
        console.log('🔧 Purchases response status:', purchasesResponse.status, purchasesResponse.ok);
        console.log('🔧 Products response status:', productsResponse.status, productsResponse.ok);
        
        if (!purchasesResponse.ok || !productsResponse.ok) {
          throw new Error(`Failed to fetch data: purchases=${purchasesResponse.status}, products=${productsResponse.status}`);
        }

        const [purchasesResult, productsResult] = await Promise.all([
          purchasesResponse.json(),
          productsResponse.json()
        ]);
        
        console.log('🔧 Purchases API Response:', purchasesResult);
        console.log('🔧 Products API Response:', productsResult);
        
        // Устанавливаем закупки
        if (Array.isArray(purchasesResult)) {
          // Проверяем и нормализуем данные закупок
          const normalizedPurchases = purchasesResult.map((purchase: any) => ({
            ...purchase,
            items: (purchase.items || []).map((item: any) => ({
              ...item,
              quantity: item.quantity || 0,
              costPrice: item.costPrice || 0,
              total: item.total || 0,
              product: item.product || { id: item.productId, name: 'Товар' }
            })), // Убеждаемся, что items всегда массив с нормализованными данными
            createdAt: purchase.createdAt || new Date().toISOString(),
            updatedAt: purchase.updatedAt || new Date().toISOString(),
            status: purchase.status || 'draft',
            totalAmount: purchase.totalAmount || 0,
            isUrgent: purchase.isUrgent || false,
            expenses: purchase.expenses || 0
          }));
          
          setPurchases(normalizedPurchases);
          console.log('✅ Loaded', normalizedPurchases.length, 'purchases');
        } else {
          console.error('❌ Invalid purchases API response:', purchasesResult);
          throw new Error('Invalid purchases API response');
        }

        // Устанавливаем товары
        if (productsResult.success && productsResult.data && Array.isArray(productsResult.data.products)) {
          setProducts(productsResult.data.products);
          
          // Преобразуем товары для модального окна
          const productsForModal = productsResult.data.products.map((p: any) => ({
            id: parseInt(p.id),
            name: p.name,
            prime_cost: p.prime_cost,
            avgPurchasePriceRub: p.avgpurchasepricerub
          }));
          setModalProducts(productsForModal);
          
          console.log('✅ Loaded', productsResult.data.products.length, 'products');
          console.log('✅ Modal products loaded:', productsForModal.length);
        } else {
          console.error('❌ Invalid products API response');
          // Товары не критичны для закупок, продолжаем
          setProducts([]);
          setModalProducts([]);
        }

      } catch (error) {
        console.error('❌ Error loading data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Функция форматирования статуса
  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "draft":
        return `${baseClasses} bg-gray-500/10 text-gray-500 border border-gray-500/20`;
      case "sent":
        return `${baseClasses} bg-blue-500/10 text-blue-500 border border-blue-500/20`;
      case "ordered":
        return `${baseClasses} bg-blue-500/10 text-blue-500 border border-blue-500/20`;
      case "awaiting_payment":
        return `${baseClasses} bg-orange-500/10 text-orange-500 border border-orange-500/20`;
      case "paid":
        return `${baseClasses} bg-emerald-500/10 text-emerald-500 border border-emerald-500/20`;
      case "in_transit":
        return `${baseClasses} bg-purple-500/10 text-purple-500 border border-purple-500/20`;
      case "received":
        return `${baseClasses} bg-teal-500/10 text-teal-500 border border-teal-500/20`;
      case "cancelled":
        return `${baseClasses} bg-red-500/10 text-red-500 border border-red-500/20`;
      default:
        return `${baseClasses} bg-gray-500/10 text-gray-500 border border-gray-500/20`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft": return "🗒️ Черновик";
      case "sent": return "📤 Отправлено";
      case "ordered": return "📤 Заказано";
      case "awaiting_payment": return "💳 Ожидает оплату";
      case "paid": return "💰 Оплачено";
      case "in_transit": return "🚚 В пути";
      case "received": return "✅ Получено";
      case "cancelled": return "❌ Отменено";
      default: return status;
    }
  };

  // Функция фильтрации по периоду
  const filterByPeriod = (purchase: Purchase) => {
    if (periodFilter === "all") return true;
    
    if (!purchase.createdAt) return true; // Если нет даты, показываем
    
    const purchaseDate = new Date(purchase.createdAt);
    if (isNaN(purchaseDate.getTime())) return true; // Если дата некорректная, показываем
    
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    switch (periodFilter) {
      case "7": return diffDays <= 7;
      case "30": return diffDays <= 30;
      case "90": return diffDays <= 90;
      default: return true;
    }
  };

  // Фильтрация закупок
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = globalFilter === "" || 
      purchase.id.toString().includes(globalFilter) ||
      (purchase.items && purchase.items.length > 0 && purchase.items.some(item => 
        item.product?.name?.toLowerCase().includes(globalFilter.toLowerCase())
      ));
    
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter;
    const matchesPeriod = filterByPeriod(purchase);
    
    const matchesProduct = productFilter === "all" || 
      (purchase.items && purchase.items.length > 0 && purchase.items.some(item => item.productId.toString() === productFilter));
    
    return matchesSearch && matchesStatus && matchesPeriod && matchesProduct;
  });

  // Пагинация
  const totalPages = Math.ceil(filteredPurchases.length / pageSize);
  const startIndex = currentPage * pageSize;
  const paginatedPurchases = filteredPurchases.slice(startIndex, startIndex + pageSize);

  const handleRowClick = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowDetails(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    if (!dateString) {
      return new Date().toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return new Date().toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Получение списка товаров для отображения
  const getProductsList = (items: PurchaseItem[]) => {
    if (!items || items.length === 0) return "Нет товаров";
    
    // Показываем все товары, но не более 3х для экономии места
    const maxItemsToShow = 3;
    const itemsToShow = items.slice(0, maxItemsToShow);
    
    const productNames = itemsToShow.map(item => {
      const name = item.product?.name || `Товар #${item.productId}`;
      return `${name} (${item.quantity} шт.)`;
    });
    
    let result = productNames.join(", ");
    
    if (items.length > maxItemsToShow) {
      result += ` и еще ${items.length - maxItemsToShow} товаров`;
    }
    
    return result;
  };

  // Получение основного товара для отображения (для совместимости)
  const getMainProduct = (items: PurchaseItem[]) => {
    if (!items || items.length === 0) return "Нет товаров";
    if (items.length === 1) return items[0]?.product?.name || `Товар #${items[0]?.productId}`;
    return `${items[0]?.product?.name || `Товар #${items[0]?.productId}`} +${items.length - 1} др.`;
  };

  // Расчет и отображение времени доставки
  const getDeliveryInfo = (purchase: Purchase) => {
    const now = new Date();
    const createdAt = new Date(purchase.createdAt);
    
    // Проверяем валидность даты
    if (!purchase.createdAt || isNaN(createdAt.getTime())) {
      return <span className="text-gray-400 dark:text-gray-500">—</span>;
    }
    
    switch (purchase.status) {
      case 'draft':
        return <span className="text-gray-400 dark:text-gray-500">—</span>;
      
      case 'ordered':
      case 'in_transit': {
        const daysInTransit = Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const expectedDays = 20; // По умолчанию 20 дней, позже будем брать из SupplierStats
        
        if (daysInTransit > expectedDays + 3) {
          return (
            <div className="flex flex-col">
              <span className="text-red-600 dark:text-red-400 font-medium">
                {daysInTransit} дней
              </span>
              <span className="text-xs text-red-500">
                Просрочено на {daysInTransit - expectedDays} дн.
              </span>
            </div>
          );
        } else if (daysInTransit >= expectedDays - 2) {
          return (
            <div className="flex flex-col">
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                {daysInTransit} дней
              </span>
              <span className="text-xs text-gray-500">
                Ожидается ~{expectedDays} дн.
              </span>
            </div>
          );
        } else {
          return (
            <div className="flex flex-col">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {daysInTransit} дней
              </span>
              <span className="text-xs text-gray-500">
                Ожидается ~{expectedDays} дн.
              </span>
            </div>
          );
        }
      }
      
      case 'received': {
        // Для полученных товаров показываем фактическое время доставки
        // Пока используем время от создания до сегодня (временно)
        const deliveryDays = Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return (
          <div className="flex flex-col">
            <span className="text-green-600 dark:text-green-400 font-medium">
              {deliveryDays} дней
            </span>
            <span className="text-xs text-green-500">
              Доставлено
            </span>
          </div>
        );
      }
      
      case 'cancelled':
        return <span className="text-gray-400 dark:text-gray-500">Отменено</span>;
      
      default:
        return <span className="text-gray-400 dark:text-gray-500">—</span>;
    }
  };

  // Обработчик оприходования
  const handleReceive = (purchase: Purchase) => {
    setCurrentReceivingPurchase(purchase);
    setShowReceiveModal(true);
  };

  // Обработчик успешного оприходования
  const handleReceiveSuccess = async (data: {
    purchaseId: number;
    items: Array<{
      id: number;
      receivedQuantity: number;
    }>;
    logisticsExpense: number;
    receivedAt: string;
    notes?: string;
  }) => {
    // Обновляем список закупок
    setPurchases(prev => prev.map(p => 
      p.id === data.purchaseId 
        ? { ...p, status: 'received' as Purchase['status'] }
        : p
    ));
    
    // Закрываем модальное окно
    setShowReceiveModal(false);
    setCurrentReceivingPurchase(null);
    
    console.log('✅ Закупка оприходована:', data);
  };

  // Обработчик отправки в Telegram
  const handleSendTelegram = async (purchaseId: number) => {
    setSendingToTelegram(purchaseId);
    try {
      const response = await fetch(`/api/purchases/${purchaseId}/send-telegram`, {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('✅ Закупка успешно отправлена в Telegram!');
        // Обновляем статус закупки локально
        setPurchases(prev => prev.map(p => 
          p.id === purchaseId 
            ? { ...p, status: 'ordered' as Purchase['status'] }
            : p
        ));
      } else {
        alert('❌ Ошибка отправки в Telegram');
      }
    } catch (error) {
      console.error('Error sending to Telegram:', error);
      alert('❌ Ошибка отправки в Telegram');
    } finally {
      setSendingToTelegram(null);
    }
  };

  // Конвертация типов для модального окна
  const convertToModalPurchase = (purchase: Purchase): ModalPurchase => {
    // Конвертируем статус "ordered" в "sent" для совместимости с модальным окном
    let modalStatus: ModalPurchase['status'] = "draft";
    switch (purchase.status) {
      case "ordered":
        modalStatus = "sent";
        break;
      case "draft":
      case "in_transit":
      case "received":
      case "cancelled":
        modalStatus = purchase.status;
        break;
    }

    return {
      id: purchase.id,
      totalAmount: purchase.totalAmount,
      isUrgent: purchase.isUrgent,
      expenses: purchase.expenses,
      status: modalStatus,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
      items: purchase.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name || '',
        quantity: item.quantity,
        costPrice: item.costPrice,
        total: item.total,
      })),
    };
  };

  const handleEdit = (purchase: Purchase) => {
    console.log('🔧 handleEdit called with purchase:', purchase);
    const modalPurchase = convertToModalPurchase(purchase);
    console.log('🔧 Converted to modal purchase:', modalPurchase);
    setEditingPurchase(modalPurchase);
    setIsEditModalOpen(true);
    console.log('🔧 Modal should be open now');
  };

  const handleCreateNew = () => {
    console.log('🔧 Creating new purchase');
    setEditingPurchase(null);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (purchase: Purchase) => {
    if (!confirm(`Вы уверены, что хотите удалить закупку #${purchase.id}?`)) {
      return;
    }

    setDeleting(purchase.id);
    try {
      const response = await fetch(`/api/purchases/${purchase.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete purchase');
      }

      setPurchases(prev => prev.filter(p => p.id !== purchase.id));
    } catch (error) {
      console.error('Error deleting purchase:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleModalSuccess = (updatedPurchase: ModalPurchase) => {
    // Конвертируем статус обратно из "sent" в "ordered" для совместимости с Purchase
    let purchaseStatus: Purchase['status'] = "draft";
    switch (updatedPurchase.status) {
      case "sent":
        purchaseStatus = "ordered";
        break;
      case "draft":
      case "in_transit":
      case "received":
      case "cancelled":
        purchaseStatus = updatedPurchase.status;
        break;
      default:
        // Для статусов awaiting_payment и paid используем ordered
        purchaseStatus = "ordered";
    }

    const convertedPurchase: Purchase = {
      id: updatedPurchase.id,
      totalAmount: updatedPurchase.totalAmount,
      isUrgent: updatedPurchase.isUrgent,
      expenses: updatedPurchase.expenses,
      status: purchaseStatus,
      createdAt: updatedPurchase.createdAt || new Date().toISOString(),
      updatedAt: updatedPurchase.updatedAt || new Date().toISOString(),
      userId: purchases[0]?.userId || '', // Берем userId из существующих закупок
      items: updatedPurchase.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          id: item.id || 0,
          productId: item.productId,
          quantity: item.quantity,
          costPrice: item.costPrice,
          total: item.total,
          purchaseId: updatedPurchase.id,
          product: product ? {
            id: product.id,
            name: product.name,
            userId: purchases[0]?.userId || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } : {
            id: item.productId,
            name: item.productName,
            userId: purchases[0]?.userId || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }),
    };

    if (editingPurchase) {
      setPurchases(prev => prev.map(p => 
        p.id === editingPurchase.id ? convertedPurchase : p
      ));
    } else {
      setPurchases(prev => [convertedPurchase, ...prev]);
    }
    setEditingPurchase(null);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setEditingPurchase(null);
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A6DFF] border-t-transparent"></div>
          <span className="ml-3 text-[#1E293B] dark:text-white">Загрузка закупок...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-center py-16">
          <div className="text-red-500 dark:text-red-400">Ошибка: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700"
      >
        {/* Header with filters */}
        <div className="border-b border-gray-100 dark:border-gray-700 p-6">
          <div className="flex flex-col gap-4">
            {/* Title and search row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white flex items-center gap-2">
                <svg className="h-5 w-5 text-[#1A6DFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                История закупок
              </h3>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                {/* Create new purchase button */}
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 w-full sm:w-auto"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Создать закупку
                </button>
                
                {/* Search */}
                <div className="relative w-full sm:max-w-[300px]">
                  <input
                    type="text"
                    value={globalFilter}
                    onChange={(e) => {
                      setGlobalFilter(e.target.value);
                      setCurrentPage(0);
                    }}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-10 py-2 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                    placeholder="Поиск по ID или товару..."
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filters row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
              >
                <option value="all">Все статусы</option>
                <option value="draft">🗒️ Черновик</option>
                <option value="sent">📤 Отправлено</option>
                <option value="ordered">📤 Заказано</option>
                <option value="awaiting_payment">💳 Ожидает оплату</option>
                <option value="paid">💰 Оплачено</option>
                <option value="in_transit">🚚 В пути</option>
                <option value="received">✅ Получено</option>
                <option value="cancelled">❌ Отменено</option>
              </select>

              {/* Period filter */}
              <select
                value={periodFilter}
                onChange={(e) => {
                  setPeriodFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
              >
                <option value="all">Все время</option>
                <option value="7">Последние 7 дней</option>
                <option value="30">Последние 30 дней</option>
                <option value="90">Последние 90 дней</option>
              </select>

              {/* Product filter */}
              <select
                value={productFilter}
                onChange={(e) => {
                  setProductFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 min-w-[150px]"
              >
                <option value="all">Все товары</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id.toString()}>
                    {product.name}
                  </option>
                ))}
              </select>

              {/* Page size selector */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-[#64748B] dark:text-gray-400">На странице:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(0);
                  }}
                  className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table - скрыта на мобильных */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#64748B] dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#64748B] dark:text-gray-400 uppercase tracking-wider">
                  Дата закупки
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#64748B] dark:text-gray-400 uppercase tracking-wider">
                  Товары
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#64748B] dark:text-gray-400 uppercase tracking-wider">
                  Сумма
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#64748B] dark:text-gray-400 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#64748B] dark:text-gray-400 uppercase tracking-wider">
                  Время доставки
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-[#64748B] dark:text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paginatedPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="font-medium text-[#64748B] dark:text-gray-400">
                      {globalFilter || statusFilter !== "all" || periodFilter !== "all" || productFilter !== "all"
                        ? 'Закупки не найдены по заданным фильтрам' 
                        : 'Закупки не найдены'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedPurchases.map((purchase) => (
                  <motion.tr
                    key={purchase.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(purchase)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-[#1A6DFF]">#{purchase.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1E293B] dark:text-white">
                      {formatDate(purchase.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#1E293B] dark:text-white">
                      {getMainProduct(purchase.items)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-[#1E293B] dark:text-white">
                        ₺{(purchase.totalAmount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(purchase.status)}>
                        {getStatusText(purchase.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getDeliveryInfo(purchase)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(purchase);
                          }}
                          className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#1A6DFF]"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        {purchase.status === 'draft' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendTelegram(purchase.id);
                            }}
                            disabled={sendingToTelegram === purchase.id}
                            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-[#0088cc]/10 dark:hover:bg-[#0088cc]/20 hover:text-[#0088cc] disabled:opacity-50"
                            title="Отправить закупщику в Telegram"
                          >
                            {sendingToTelegram === purchase.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0088cc] border-t-transparent"></div>
                            ) : (
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                              </svg>
                            )}
                          </button>
                        )}
                        
                        {purchase.status === 'in_transit' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReceive(purchase);
                            }}
                            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600"
                            title="Оприходовать"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(purchase);
                          }}
                          disabled={deleting === purchase.id}
                          className="rounded-lg p-2 text-gray-400 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 disabled:opacity-50"
                        >
                          {deleting === purchase.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent"></div>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - показаны только на мобильных */}
        <div className="md:hidden p-4 space-y-4">
          {paginatedPurchases.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="font-medium text-[#64748B] dark:text-gray-400 mb-6">
                {globalFilter || statusFilter !== "all" || periodFilter !== "all" || productFilter !== "all"
                  ? 'Закупки не найдены по заданным фильтрам' 
                  : 'Закупки не найдены'}
              </p>
              {/* Кнопка создания закупки для пустого состояния */}
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Создать первую закупку
              </button>
            </div>
          ) : (
            paginatedPurchases.map((purchase) => (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleRowClick(purchase)}
                className="group rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-4 transition-all hover:border-[#1A6DFF]/30 hover:bg-white dark:hover:bg-gray-600 hover:shadow-sm cursor-pointer"
              >
                {/* Header с ID и статусом */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-[#1E293B] dark:text-white">
                      Закупка #{purchase.id}
                    </h4>
                    <span className={getStatusBadge(purchase.status)}>
                      {getStatusText(purchase.status)}
                    </span>
                    {purchase.isUrgent && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-900/30 px-2 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-400">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Срочная
                      </span>
                    )}
                  </div>
                </div>

                {/* Информация о закупке */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(purchase.createdAt)}</span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-[#64748B] dark:text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <div className="flex-1">
                      <div className="text-[#1E293B] dark:text-white font-medium leading-relaxed">
                        {getProductsList(purchase.items)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {getDeliveryInfo(purchase)}
                  </div>
                </div>

                {/* Сумма и действия */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#64748B] dark:text-gray-400">Сумма:</span>
                    <span className="font-bold text-lg text-[#1E293B] dark:text-white">
                      ₺{(purchase.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Кнопки действий */}
                  <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendTelegram(purchase.id);
                      }}
                      disabled={sendingToTelegram === purchase.id}
                      className="rounded-lg p-2 text-gray-400 transition-all hover:bg-[#0088cc]/10 dark:hover:bg-[#0088cc]/20 hover:text-[#0088cc] disabled:opacity-50"
                      title="Отправить закупщику в Telegram"
                    >
                      {sendingToTelegram === purchase.id ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0088cc] border-t-transparent"></div>
                      ) : (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(purchase);
                      }}
                      className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#1A6DFF]"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(purchase);
                      }}
                      disabled={deleting === purchase.id}
                      className="rounded-lg p-2 text-gray-400 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 disabled:opacity-50"
                    >
                      {deleting === purchase.id ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-rose-600 border-t-transparent"></div>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 px-6 py-4">
            <p className="text-sm text-[#64748B] dark:text-gray-400">
              Показано {startIndex + 1}-{Math.min(startIndex + pageSize, filteredPurchases.length)} из {filteredPurchases.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-[#1E293B] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Предыдущая
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    currentPage === i
                      ? 'bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white'
                      : 'border border-gray-200 dark:border-gray-600 text-[#1E293B] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-1.5 text-sm font-medium text-[#1E293B] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Следующая
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Purchase Details Modal */}
      {showDetails && selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-4 w-full max-w-4xl rounded-xl bg-white dark:bg-gray-800 shadow-xl"
          >
            <div className="border-b border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-[#1E293B] dark:text-white">
                  Детали закупки #{selectedPurchase.id}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-[#64748B] dark:text-gray-400">Дата создания</p>
                  <p className="font-medium text-[#1E293B] dark:text-white">
                    {formatDate(selectedPurchase.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B] dark:text-gray-400">Общая сумма</p>
                  <p className="font-medium text-[#1E293B] dark:text-white">
                    ₺{(selectedPurchase.totalAmount || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B] dark:text-gray-400">Статус</p>
                  <div className="mt-1">
                    <span className={getStatusBadge(selectedPurchase.status)}>
                      {getStatusText(selectedPurchase.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-lg font-semibold text-[#1E293B] dark:text-white">Товары</h4>
                <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-700">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[#64748B] dark:text-gray-400">
                          Товар
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[#64748B] dark:text-gray-400">
                          Количество
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[#64748B] dark:text-gray-400">
                          Цена за единицу
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-[#64748B] dark:text-gray-400">
                          Сумма
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {selectedPurchase.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-[#1E293B] dark:text-white">
                            <div>
                              <div className="font-medium">
                                {item.product?.name || `Товар #${item.productId}`}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {item.productId}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#1E293B] dark:text-white">
                            {item.quantity} шт.
                          </td>
                          <td className="px-4 py-3 text-[#1E293B] dark:text-white">
                            ₺{(item.costPrice || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-[#1E293B] dark:text-white">
                            ₺{(item.total || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 p-6">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className="rounded-lg border border-gray-200 dark:border-gray-600 px-4 py-2 text-[#1E293B] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Закрыть
                </button>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    handleEdit(selectedPurchase);
                  }}
                  className="rounded-lg bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] px-4 py-2 text-white hover:shadow-lg transition-all"
                >
                  Редактировать
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Receive Purchase Modal */}
      {currentReceivingPurchase && (
        <ReceivePurchaseModal
          isOpen={showReceiveModal}
          onClose={() => {
            setShowReceiveModal(false);
            setCurrentReceivingPurchase(null);
          }}
          purchase={currentReceivingPurchase}
          onReceive={handleReceiveSuccess}
          isLoading={false}
        />
      )}

      {/* Edit Purchase Modal */}
      <PurchaseModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        purchase={editingPurchase}
        onSuccess={handleModalSuccess}
        products={modalProducts}
      />

      {/* Floating Action Button for Mobile */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleCreateNew}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white shadow-lg transition-all duration-300 hover:shadow-xl md:hidden"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </motion.button>
    </>
  );
} 