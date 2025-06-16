"use client";

import { useState, useEffect } from "react";
import { Purchase, PurchaseItem } from "../../purchases/types";
import ReceivePurchaseModal from "@/components/Modals/ReceivePurchaseModal";

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
            items: purchase.items || [], // Убеждаемся, что items всегда массив
            createdAt: purchase.createdAt || new Date().toISOString(),
            updatedAt: purchase.updatedAt || new Date().toISOString(),
            status: purchase.status || 'draft',
            totalAmount: purchase.totalAmount || 0,
            isUrgent: purchase.isUrgent || false
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
          console.log('✅ Loaded', productsResult.data.products.length, 'products');
        } else {
          console.error('❌ Invalid products API response');
          // Товары не критичны для закупок, продолжаем
          setProducts([]);
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
    const statusConfig = {
      draft: { text: "Черновик", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
      ordered: { text: "Заказано", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
      in_transit: { text: "В пути", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" },
      received: { text: "Получено", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
      cancelled: { text: "Отменено", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Функция фильтрации по периоду
  const filterByPeriod = (purchase: Purchase) => {
    if (periodFilter === "all") return true;
    
    if (!purchase.createdAt) return true; // Если нет даты, показываем
    
    const purchaseDate = new Date(purchase.createdAt);
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
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Получение основного товара для отображения
  const getMainProduct = (items: PurchaseItem[]) => {
    if (!items || items.length === 0) return "Нет товаров";
    if (items.length === 1) return items[0]?.product?.name || "Товар";
    return `${items[0]?.product?.name || "Товар"} +${items.length - 1} др.`;
  };

  // Расчет и отображение времени доставки
  const getDeliveryInfo = (purchase: Purchase) => {
    const now = new Date();
    const createdAt = new Date(purchase.createdAt);
    
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
  const handleReceiveSuccess = (data: any) => {
    // Обновляем список закупок
    setPurchases(prev => prev.map(p => 
      p.id === data.id 
        ? { ...p, status: 'received' }
        : p
    ));
    
    // Закрываем модальное окно
    setShowReceiveModal(false);
    setCurrentReceivingPurchase(null);
    
    console.log('✅ Закупка оприходована:', data);
  };

  // Обработчик отправки в Telegram
  const handleSendTelegram = async (purchaseId: number) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}/send-telegram`, {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('Закупка отправлена в Telegram');
      } else {
        alert('Ошибка отправки в Telegram');
      }
    } catch (error) {
      console.error('Error sending to Telegram:', error);
      alert('Ошибка отправки в Telegram');
    }
  };

  if (loading) {
    return (
      <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-dark dark:text-white">Загрузка закупок...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-center py-16">
          <div className="text-red-500 dark:text-red-400">Ошибка: {error}</div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="data-table-common rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        {/* Header with filters */}
        <div className="flex flex-col gap-4 border-b border-stroke px-7.5 py-4.5 dark:border-dark-3">
          {/* Search and filters row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative z-20 w-full max-w-[414px]">
              <input
                type="text"
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full rounded-lg border border-stroke bg-transparent px-5 py-2.5 outline-none focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary dark:text-white"
                placeholder="Поиск по ID или товару..."
              />
              <button className="absolute right-0 top-0 flex h-11.5 w-11.5 items-center justify-center rounded-r-md bg-primary text-white hover:bg-opacity-90 transition-colors duration-200">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" className="size-4.5">
                  <path fillRule="evenodd" clipRule="evenodd" d="M8.625 2.0625C5.00063 2.0625 2.0625 5.00063 2.0625 8.625C2.0625 12.2494 5.00063 15.1875 8.625 15.1875C12.2494 15.1875 15.1875 12.2494 15.1875 8.625C15.1875 5.00063 12.2494 2.0625 8.625 2.0625ZM0.9375 8.625C0.9375 4.37931 4.37931 0.9375 8.625 0.9375C12.8707 0.9375 16.3125 4.37931 16.3125 8.625C16.3125 10.5454 15.6083 12.3013 14.4441 13.6487L16.8977 16.1023C17.1174 16.3219 17.1174 16.6781 16.8977 16.8977C16.6781 17.1174 16.3219 17.1174 16.1023 16.8977L13.6487 14.4441C12.3013 15.6083 10.5454 16.3125 8.625 16.3125C4.37931 16.3125 0.9375 12.8707 0.9375 8.625Z"/>
                </svg>
              </button>
            </div>

            {/* Page size selector */}
            <div className="flex items-center font-medium">
              <p className="pl-2 font-medium text-dark dark:text-white">На странице:</p>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="bg-transparent pl-2.5 text-dark dark:text-white border-none outline-none"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size} className="bg-white dark:bg-gray-dark text-dark dark:text-white">
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filters row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            {/* Status filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-dark dark:text-white">Статус:</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="rounded border border-stroke bg-transparent px-3 py-1.5 text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white focus:border-primary dark:focus:border-primary outline-none"
              >
                <option value="all">Все</option>
                <option value="draft">Черновик</option>
                <option value="ordered">Заказано</option>
                <option value="in_transit">В пути</option>
                <option value="received">Получено</option>
                <option value="cancelled">Отменено</option>
              </select>
            </div>

            {/* Period filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-dark dark:text-white">Период:</label>
              <select
                value={periodFilter}
                onChange={(e) => {
                  setPeriodFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="rounded border border-stroke bg-transparent px-3 py-1.5 text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white focus:border-primary dark:focus:border-primary outline-none"
              >
                <option value="all">Все время</option>
                <option value="7">Последние 7 дней</option>
                <option value="30">Последние 30 дней</option>
                <option value="90">Последние 90 дней</option>
              </select>
            </div>

            {/* Product filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-dark dark:text-white">Товар:</label>
              <select
                value={productFilter}
                onChange={(e) => {
                  setProductFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="rounded border border-stroke bg-transparent px-3 py-1.5 text-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white focus:border-primary dark:focus:border-primary outline-none min-w-[150px]"
              >
                <option value="all">Все товары</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id.toString()}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Table - скрыта на мобильных */}
        <div className="hidden md:block grid grid-cols-1 overflow-x-auto">
          <table className="datatable-table datatable-one !border-collapse px-4 md:px-8 w-full">
            <thead className="border-separate px-4 sticky top-0 bg-white dark:bg-gray-dark z-10">
              <tr className="border-t border-stroke dark:border-dark-3">
                <th className="whitespace-nowrap border-transparent px-2.5 pb-2.5 pt-9 font-medium text-dark dark:text-white text-left">
                  ID
                </th>
                <th className="whitespace-nowrap border-transparent px-2.5 pb-2.5 pt-9 font-medium text-dark dark:text-white text-left">
                  Дата закупки
                </th>
                <th className="whitespace-nowrap border-transparent px-2.5 pb-2.5 pt-9 font-medium text-dark dark:text-white text-left">
                  Товары
                </th>
                <th className="whitespace-nowrap border-transparent px-2.5 pb-2.5 pt-9 font-medium text-dark dark:text-white text-left">
                  Сумма
                </th>
                <th className="whitespace-nowrap border-transparent px-2.5 pb-2.5 pt-9 font-medium text-dark dark:text-white text-left">
                  Статус
                </th>
                <th className="whitespace-nowrap border-transparent px-2.5 pb-2.5 pt-9 font-medium text-dark dark:text-white text-left">
                  Время доставки
                </th>
                <th className="whitespace-nowrap border-transparent px-2.5 pb-2.5 pt-9 font-medium text-dark dark:text-white text-left">
                  Действия
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedPurchases.length === 0 ? (
                <tr className="border-t border-stroke dark:border-dark-3">
                  <td colSpan={7} className="py-12 text-center font-medium text-dark-5 dark:text-dark-6">
                    {globalFilter || statusFilter !== "all" || periodFilter !== "all" || productFilter !== "all"
                      ? 'Закупки не найдены по заданным фильтрам' 
                      : 'Закупки не найдены'}
                  </td>
                </tr>
              ) : (
                paginatedPurchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="border-t border-stroke hover:bg-primary hover:bg-opacity-5 dark:border-dark-3 transition-colors duration-200 cursor-pointer"
                    onClick={() => handleRowClick(purchase)}
                  >
                    <td className="border-b border-stroke py-5 px-2.5 font-medium text-primary dark:border-dark-3 dark:text-white">
                      #{purchase.id}
                    </td>
                    <td className="border-b border-stroke py-5 px-2.5 font-medium text-dark dark:border-dark-3 dark:text-white">
                      {formatDate(purchase.createdAt)}
                    </td>
                    <td className="border-b border-stroke py-5 px-2.5 font-medium text-dark dark:border-dark-3 dark:text-white">
                      {getMainProduct(purchase.items)}
                    </td>
                    <td className="border-b border-stroke py-5 px-2.5 font-medium text-dark dark:border-dark-3 dark:text-white">
                      ₺{purchase.totalAmount.toFixed(2)}
                    </td>
                    <td className="border-b border-stroke py-5 px-2.5 font-medium dark:border-dark-3">
                      {getStatusBadge(purchase.status)}
                    </td>
                    <td className="border-b border-stroke py-5 px-2.5 font-medium dark:border-dark-3">
                      {getDeliveryInfo(purchase)}
                    </td>
                    <td className="border-b border-stroke py-5 px-2.5 font-medium dark:border-dark-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Edit purchase:', purchase.id);
                          }}
                          className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-opacity-90 transition-all duration-200"
                        >
                          Редактировать
                        </button>
                        
                        {purchase.status === 'draft' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendTelegram(purchase.id);
                            }}
                            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-opacity-90 transition-all duration-200"
                          >
                            Отправить
                          </button>
                        )}
                        
                        {purchase.status === 'in_transit' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReceive(purchase);
                            }}
                            className="inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-opacity-90 transition-all duration-200"
                          >
                            Оприходовать
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - показаны только на мобильных */}
        <div className="md:hidden space-y-4 p-4">
          {paginatedPurchases.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="font-medium text-dark-5 dark:text-dark-6">
                {globalFilter || statusFilter !== "all" || periodFilter !== "all" || productFilter !== "all"
                  ? 'Закупки не найдены по заданным фильтрам' 
                  : 'Закупки не найдены'}
              </p>
            </div>
          ) : (
            paginatedPurchases.map((purchase) => (
              <div
                key={purchase.id}
                onClick={() => handleRowClick(purchase)}
                className="bg-[#F8FAFC] dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                {/* Header с ID и статусом */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#64748B] dark:text-gray-400">Закупка:</span>
                    <span className="font-bold text-[#1E293B] dark:text-white">
                      #{purchase.id}
                    </span>
                  </div>
                  {getStatusBadge(purchase.status)}
                </div>

                {/* Информация о закупке */}
                <div className="space-y-3 mb-4">
                  {/* Дата */}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-[#64748B] dark:text-gray-400">
                      {formatDate(purchase.createdAt)}
                    </span>
                  </div>

                  {/* Товары */}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-sm text-[#1E293B] dark:text-white font-medium">
                      {getMainProduct(purchase.items)}
                    </span>
                  </div>

                  {/* Время доставки */}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-[#64748B] dark:text-gray-400">
                      {getDeliveryInfo(purchase)}
                    </span>
                  </div>
                </div>

                {/* Сумма и действия */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#64748B] dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="font-bold text-lg text-[#1E293B] dark:text-white">
                      ₺{purchase.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Кнопки действий */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Edit purchase:', purchase.id);
                      }}
                      className="bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:scale-105 transition-all duration-300"
                    >
                      Редактировать
                    </button>
                    
                    {purchase.status === 'draft' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendTelegram(purchase.id);
                        }}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:scale-105 transition-all duration-300"
                      >
                        Отправить
                      </button>
                    )}
                    
                    {purchase.status === 'in_transit' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReceive(purchase);
                        }}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:scale-105 transition-all duration-300"
                      >
                        Оприходовать
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-stroke px-7.5 py-4.5 dark:border-dark-3">
            <p className="text-sm text-dark-5 dark:text-dark-6">
              Показано {startIndex + 1}-{Math.min(startIndex + pageSize, filteredPurchases.length)} из {filteredPurchases.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="rounded border border-stroke px-3 py-1.5 text-sm font-medium text-dark hover:bg-primary hover:text-white dark:border-dark-3 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Предыдущая
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`rounded px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                    currentPage === i
                      ? 'bg-primary text-white'
                      : 'border border-stroke text-dark hover:bg-primary hover:text-white dark:border-dark-3 dark:text-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="rounded border border-stroke px-3 py-1.5 text-sm font-medium text-dark hover:bg-primary hover:text-white dark:border-dark-3 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Следующая
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Purchase Details Modal */}
      {showDetails && selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-4xl rounded-lg bg-white p-6 dark:bg-gray-dark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dark dark:text-white">
                Детали закупки #{selectedPurchase.id}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="rounded-full p-2 text-dark-5 hover:bg-gray-100 dark:text-dark-6 dark:hover:bg-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-dark-5 dark:text-dark-6">Дата создания</p>
                <p className="font-medium text-dark dark:text-white">
                  {formatDate(selectedPurchase.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark-5 dark:text-dark-6">Общая сумма</p>
                <p className="font-medium text-dark dark:text-white">
                  ₺{selectedPurchase.totalAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark-5 dark:text-dark-6">Статус</p>
                {getStatusBadge(selectedPurchase.status)}
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-lg font-semibold text-dark dark:text-white">Товары</h4>
              <div className="overflow-x-auto rounded-lg border border-stroke dark:border-dark-3">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-dark dark:text-white">
                        Товар
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-dark dark:text-white">
                        Количество
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-dark dark:text-white">
                        Цена за единицу
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-dark dark:text-white">
                        Сумма
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurchase.items.map((item) => (
                      <tr key={item.id} className="border-t border-stroke dark:border-dark-3">
                        <td className="px-4 py-3 text-dark dark:text-white">
                          {item.product?.name || 'Товар'}
                        </td>
                        <td className="px-4 py-3 text-dark dark:text-white">
                          {item.quantity} шт.
                        </td>
                        <td className="px-4 py-3 text-dark dark:text-white">
                          ₺{item.costPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-dark dark:text-white">
                          ₺{item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDetails(false)}
                className="rounded-md border border-stroke px-4 py-2 text-dark hover:bg-gray-50 dark:border-dark-3 dark:text-white dark:hover:bg-gray-700"
              >
                Закрыть
              </button>
              <button
                onClick={() => {
                  console.log('Edit purchase:', selectedPurchase.id);
                }}
                className="rounded-md bg-primary px-4 py-2 text-white hover:bg-opacity-90"
              >
                Редактировать
              </button>
            </div>
          </div>
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
          purchaseId={currentReceivingPurchase.id}
          purchaseName={getMainProduct(currentReceivingPurchase.items)}
          onReceived={handleReceiveSuccess}
        />
      )}
    </>
  );
} 