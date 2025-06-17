"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import usePurchaseCartStore from "@/lib/stores/purchaseCartStore";
import PurchaseModal from "@/components/Modals/PurchaseModal";

// Интерфейсы для работы с базой данных
interface Product {
  id: number;
  name: string;
  prime_cost?: number;
  avgPurchasePriceRub?: number;
}

interface PurchaseItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  costPrice: number;
  total: number;
}

interface Purchase {
  id: number;
  createdAt: string;
  updatedAt: string;
  items: PurchaseItem[];
  totalAmount: number;
  status: "draft" | "sent" | "awaiting_payment" | "paid" | "in_transit" | "received" | "cancelled";
  isUrgent: boolean;
  expenses?: number;
}

// Интерфейсы для модального окна (совместимость)
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

export default function PurchasesPage() {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [draftItems, setDraftItems] = useState<PurchaseItem[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<ModalPurchase | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [sendingToTelegram, setSendingToTelegram] = useState<number | null>(null);

  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [modalProducts, setModalProducts] = useState<ModalProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const { items: cartItems, clearCart } = usePurchaseCartStore();

  // Отладочная информация
  console.log('Products for modal:', modalProducts.length, modalProducts.slice(0, 3));

  const removeItemFromDraft = useCallback((id: number) => {
    setDraftItems(prev => prev.filter(item => item.id !== id));
  }, []);
  
  const loadCartItemsToDraft = useCallback(() => {
    if (cartItems.length === 0 || exchangeRate === 0) {
      if (cartItems.length > 0) {
        console.log("Ожидание загрузки курса валют для добавления товаров из корзины...");
      }
      return;
    }

    setDraftItems(currentDraftItems => {
      const existingDraftProductIds = new Set(currentDraftItems.map(item => item.productId));
      const newCartItems = cartItems.filter(cartItem => !existingDraftProductIds.has(cartItem.id));

      if (newCartItems.length === 0) {
        console.log("Все товары из корзины уже находятся в черновике.");
        return currentDraftItems;
      }

      const cartDraftItems: PurchaseItem[] = newCartItems.map((item, index) => ({
        id: Date.now() + index, // Временный ID для новых элементов
        productId: item.id,
        productName: item.name,
        quantity: item.purchaseQuantity,
        costPrice: item.prime_cost || 0,
        total: (item.prime_cost || 0) * item.purchaseQuantity * exchangeRate,
      }));
      
      console.log(`Добавлено ${newCartItems.length} новых товаров из корзины в черновик.`);
      return [...currentDraftItems, ...cartDraftItems];
    });

    console.log("Корзина обработана и будет очищена.");
    clearCart();
  }, [cartItems, exchangeRate, clearCart]);

  const updateDraftItemQuantity = useCallback((itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemFromDraft(itemId);
      return;
    }
    setDraftItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity: newQuantity, total: item.costPrice * newQuantity * exchangeRate }
        : item
    ));
  }, [exchangeRate, removeItemFromDraft]);
  
  useEffect(() => {
    document.title = "Закупки | Telesklad";
  }, []);

  useEffect(() => {
    loadPurchases();
    loadExchangeRate();
    loadProducts();
  }, []);

  useEffect(() => {
    if (cartItems.length > 0 && exchangeRate > 0) {
      loadCartItemsToDraft();
    }
  }, [cartItems, exchangeRate, loadCartItemsToDraft]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading purchases...');
      const response = await fetch('/api/purchases');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Purchases loaded:', data.length, 'items');
        console.log('📦 First purchase:', data[0]);
        setPurchases(data);
      } else {
        console.error('Failed to load purchases:', response.statusText);
        setPurchases([]);
      }
    } catch (error) {
      console.error("Error loading purchases:", error);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };
  
  const loadExchangeRate = async () => {
    try {
      const response = await fetch('/api/rates/latest?currency=TRY');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setExchangeRate(result.data.rate);
          console.log(`Загружен курс TRY: 1 ₺ = ${result.data.rate} ₽`);
        }
      } else { console.warn('Не удалось загрузить курс TRY'); }
    } catch (error) { console.error("Error loading exchange rate:", error); }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      console.log('🔄 Начинаем загрузку товаров...');
      const response = await fetch('/api/products/simple');
      const data = await response.json();
      console.log('📦 API response:', data);
      
      if (response.status === 401) {
        console.error('❌ Пользователь не авторизован');
        setProducts([]);
        setModalProducts([]);
        return;
      }
      
      if (data.success && data.data && data.data.products) {
        // Преобразуем товары для основной страницы
        const productsForPage = data.data.products.map((p: any) => ({
          id: parseInt(p.id),
          name: p.name,
          prime_cost: p.prime_cost,
          avgPurchasePriceRub: p.avgpurchasepricerub
        }));
        
        // Преобразуем товары для модального окна
        const productsForModal = data.data.products.map((p: any) => ({
          id: parseInt(p.id),
          name: p.name,
          prime_cost: p.prime_cost,
          avgPurchasePriceRub: p.avgpurchasepricerub
        }));
        
        setProducts(productsForPage);
        setModalProducts(productsForModal);
        console.log('✅ Products loaded:', productsForPage.length);
        console.log('✅ Modal products loaded:', productsForModal.length);
        console.log('📋 Первые 3 товара:', productsForPage.slice(0, 3));
      } else {
        console.error('❌ API returned error:', data);
        setProducts([]);
        setModalProducts([]);
      }
    } catch (error) { 
      console.error("❌ Ошибка загрузки товаров:", error); 
      setProducts([]);
      setModalProducts([]);
    } finally { 
      setLoadingProducts(false); 
    }
  };
  
  const handleProductChange = (productId: string) => {
    console.log('handleProductChange вызван с productId:', productId, typeof productId);
    console.log('Доступные товары:', products.length);
    console.log('Первые 3 товара с ID:', products.slice(0, 3).map(p => ({ id: p.id, type: typeof p.id, name: p.name })));
    
    // Преобразуем productId в число для поиска
    const numericProductId = parseInt(productId);
    const product = products.find(p => p.id === numericProductId);
    console.log('Найденный товар:', product);
    
    setSelectedProduct(productId);
    if (product) {
        // Используем avgPurchasePriceRub (средняя закупочная цена) или prime_cost как fallback
        const price = product.avgPurchasePriceRub ?? product.prime_cost ?? 0;
        setCostPrice(price.toString());
        console.log(`✅ Автозаполнение себестоимости для ${product.name}: ${price} ₽`);
        console.log('Данные товара:', { 
          avgPurchasePriceRub: product.avgPurchasePriceRub, 
          prime_cost: product.prime_cost 
        });
    } else {
        console.log('❌ Товар не найден в списке products');
    }
  };

  const addItemToDraft = () => {
    if (!selectedProduct || !quantity || !costPrice) {
      alert("Пожалуйста, выберите товар, укажите количество и себестоимость.");
      return;
    }
    const numericProductId = parseInt(selectedProduct);
    const product = products.find(p => p.id === numericProductId);
    if (!product) return;

    const newItem: PurchaseItem = {
      id: Date.now(), // Временный ID
      productId: numericProductId,
      productName: product.name,
      quantity: parseInt(quantity),
      costPrice: parseFloat(costPrice),
      total: parseFloat(costPrice) * parseInt(quantity) * exchangeRate,
    };

    setDraftItems(prev => [...prev, newItem]);
    setSelectedProduct("");
    setQuantity("");
    setCostPrice("");
  };

  const savePurchase = async () => {
    if (draftItems.length === 0) {
      alert("Добавьте товары в закупку");
      return;
    }

    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: draftItems.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            costPrice: item.costPrice,
            total: item.total
          })),
          totalAmount: totalCostLira,
          isUrgent,
          expenses: 0,
          currency: 'TRY'
        }),
      });

      if (response.ok) {
        const newPurchase = await response.json();
        setPurchases(prev => [newPurchase, ...prev]);
        setDraftItems([]);
        setIsUrgent(false);
        alert("✅ Закупка успешно сохранена!");
      } else {
        const error = await response.json();
        alert("❌ Ошибка при сохранении: " + error.error);
      }
    } catch (error) {
      console.error("Error saving purchase:", error);
      alert("❌ Произошла ошибка при сохранении");
    }
  };

  const convertToModalPurchase = (purchase: Purchase): ModalPurchase => {
    return {
      id: purchase.id,
      totalAmount: purchase.totalAmount,
      isUrgent: purchase.isUrgent,
      expenses: purchase.expenses,
      status: purchase.status,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
      items: purchase.items.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
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
    setIsModalOpen(true);
    console.log('🔧 Modal should be open now');
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

  const handleSendToTelegram = async (purchase: Purchase) => {
    if (!confirm("Отправить закупку закупщику в Telegram?")) {
      return;
    }

    setSendingToTelegram(purchase.id);
    try {
      const response = await fetch(`/api/purchases/${purchase.id}/send-telegram`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        alert("✅ Закупка успешно отправлена закупщику в Telegram!");
        console.log("Purchase sent to Telegram:", result);
        
        // Обновляем статус закупки локально
        setPurchases(prev => prev.map(p => 
          p.id === purchase.id 
            ? { ...p, status: 'sent' as Purchase['status'] }
            : p
        ));
      } else {
        const error = await response.json();
        console.error("Ошибка при отправке в Telegram:", error);
        alert("❌ Не удалось отправить закупку в Telegram: " + error.error);
      }
    } catch (error) {
      console.error("Error sending to Telegram:", error);
      alert("❌ Произошла ошибка при отправке в Telegram");
    } finally {
      setSendingToTelegram(null);
    }
  };

  const handleModalSuccess = (updatedPurchase: ModalPurchase) => {
    const convertedPurchase: Purchase = {
      id: updatedPurchase.id,
      totalAmount: updatedPurchase.totalAmount,
      isUrgent: updatedPurchase.isUrgent,
      expenses: updatedPurchase.expenses,
      status: updatedPurchase.status,
      createdAt: updatedPurchase.createdAt,
      updatedAt: updatedPurchase.updatedAt,
      items: updatedPurchase.items.map(item => ({
        id: item.id || 0,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        costPrice: item.costPrice,
        total: item.total,
      })),
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
    setIsModalOpen(false);
    setEditingPurchase(null);
  };

  const getStatusBadge = (status: Purchase['status']) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "draft":
        return `${baseClasses} bg-gray-500/10 text-gray-500 border border-gray-500/20`;
      case "sent":
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

  const getStatusText = (status: Purchase['status']) => {
    switch (status) {
      case "draft": return "🗒️ Черновик";
      case "sent": return "📤 Отправлено";

      case "awaiting_payment": return "💳 Ожидает оплату";
      case "paid": return "💰 Оплачено";
      case "in_transit": return "🚚 В пути";
      case "received": return "✅ Получено";
      case "cancelled": return "❌ Отменено";
      default: return status;
    }
  };
  
  const totalItems = draftItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCostLira = draftItems.reduce((sum, item) => sum + item.quantity * item.costPrice, 0);
  const totalCostRub = draftItems.reduce((sum, item) => sum + item.total, 0);

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = searchQuery === "" || 
      purchase.id.toString().includes(searchQuery.toLowerCase()) ||
      purchase.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Отладочная информация
  console.log('🔍 Purchases state:', purchases.length, 'total');
  console.log('🔍 Filtered purchases:', filteredPurchases.length, 'visible');
  console.log('🔍 Search query:', searchQuery);
  console.log('🔍 Status filter:', statusFilter);

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 bg-[#F8FAFC] dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] bg-clip-text text-transparent">
              Закупки
            </h1>
            <p className="mt-1 text-sm text-[#64748B] dark:text-gray-400">
              Управление закупками товаров
            </p>
          </div>
          <button
            onClick={() => {
              setEditingPurchase(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Новая закупка
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column - Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          {/* Quick Add Form */}
          <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
            <div className="border-b border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white flex items-center gap-2">
                <svg className="h-5 w-5 text-[#1A6DFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Быстрое добавление товара
              </h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                    Товар
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                  >
                    <option value="">
                      {loadingProducts ? "Загрузка товаров..." : "Выберите товар"}
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                    Количество
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                    Себестоимость (₺)
                  </label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={addItemToDraft}
                    className="w-full rounded-lg bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg hover:scale-105"
                  >
                    Добавить
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Draft Items */}
          <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
            <div className="border-b border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white flex items-center gap-2">
                <svg className="h-5 w-5 text-[#1A6DFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Черновик закупки ({draftItems.length})
              </h3>
            </div>

            <div className="p-6">
              {draftItems.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-[#64748B] dark:text-gray-400">
                    Добавьте товары в закупку
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {draftItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-4"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-[#1E293B] dark:text-white">
                            {item.productName}
                          </h4>
                          <div className="mt-1 flex items-center gap-4 text-sm text-[#64748B] dark:text-gray-400">
                            <span>Количество: {item.quantity}</span>
                            <span>Цена: ₺{item.costPrice.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}</span>
                            <span>Итого: ₺{(item.quantity * item.costPrice).toLocaleString('ru-RU', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateDraftItemQuantity(item.id, item.quantity - 1)}
                              className="rounded-lg p-1 text-gray-400 transition-all hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-[#1A6DFF]"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="mx-2 min-w-[2rem] text-center text-sm font-medium text-[#1E293B] dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateDraftItemQuantity(item.id, item.quantity + 1)}
                              className="rounded-lg p-1 text-gray-400 transition-all hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-[#1A6DFF]"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                          <button
                            onClick={() => removeItemFromDraft(item.id)}
                            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Recent Purchases */}
          <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="border-b border-gray-100 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white flex items-center gap-2">
                  <svg className="h-5 w-5 text-[#1A6DFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  История закупок
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                  >
                    <option value="all">Все статусы</option>
                    <option value="draft">🗒️ Черновик</option>
                    <option value="sent">📤 Отправлено</option>

                    <option value="awaiting_payment">💳 Ожидает оплату</option>
                    <option value="paid">💰 Оплачено</option>
                    <option value="in_transit">🚚 В пути</option>
                    <option value="received">✅ Получено</option>
                    <option value="cancelled">❌ Отменено</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A6DFF] border-t-transparent"></div>
                </div>
              ) : filteredPurchases.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-[#64748B] dark:text-gray-400">
                    Закупки не найдены
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPurchases.map((purchase) => (
                    <motion.div
                      key={purchase.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="group rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-4 transition-all hover:border-[#1A6DFF]/30 hover:bg-white dark:hover:bg-gray-600 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
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
                          <div className="mt-2 text-sm text-[#64748B] dark:text-gray-400">
                            <p>
                              {purchase.items.length} позиций • 
                              ₺{purchase.totalAmount.toLocaleString('ru-RU')} • 
                              {new Date(purchase.createdAt).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => handleSendToTelegram(purchase)}
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
                            onClick={() => handleEdit(purchase)}
                            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#1A6DFF]"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(purchase)}
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
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Summary */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <div className="sticky top-24 rounded-xl bg-gradient-to-br from-[#1A6DFF] to-[#00C5FF] p-6 text-white shadow-lg">
            <h3 className="mb-6 text-xl font-semibold flex items-center gap-2">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Итоги закупки
            </h3>

            <div className="space-y-4">
              <div className="rounded-lg bg-white/10 p-4 backdrop-blur">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-white/80">Позиций:</p>
                  <p className="text-2xl font-bold">{totalItems}</p>
                </div>
              </div>

              <div className="rounded-lg bg-white/10 p-4 backdrop-blur">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-white/80">В лирах:</p>
                  <p className="text-2xl font-bold">
                    ₺{totalCostLira.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="mt-1 text-right text-xs text-white/60">
                  Курс: 1 ₺ = {exchangeRate > 0 ? exchangeRate.toFixed(4) : "..."} ₽
                </div>
              </div>

              <div className="rounded-lg bg-white/20 p-4 backdrop-blur">
                <p className="text-sm text-white/80">Общая сумма:</p>
                <p className="mt-1 text-3xl font-bold">
                  ₽{totalCostRub.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="h-5 w-5 rounded border-white/30 bg-white/20 text-white focus:ring-2 focus:ring-white/50"
                  />
                  <span className="text-sm font-medium">Срочная закупка</span>
                </label>
              </div>

              <button
                onClick={savePurchase}
                disabled={draftItems.length === 0}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-white/20 px-5 py-3 text-base font-bold backdrop-blur transition-all hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Сохранить закупку
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <PurchaseModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        purchase={editingPurchase}
        onSuccess={handleModalSuccess}
        products={modalProducts}
      />
    </div>
  );
} 