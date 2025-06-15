"use client";

import React, { useState, useEffect } from "react";
import InputGroup from "@/components/FormElements/InputGroup";
import PurchaseModal from "@/components/Modals/PurchaseModal";

interface Product {
  id: string;
  name: string;
}

interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  total: number;
}

interface Purchase {
  id: string;
  createdAt: string;
  updatedAt: string;
  items: PurchaseItem[];
  totalAmount: number;
  status: "draft" | "ordered" | "received" | "cancelled";
  isUrgent: boolean;
  expenses?: number;
}

// Типы для модального окна (используют number для id)
interface ModalPurchase {
  id: number;
  totalAmount: number;
  isUrgent: boolean;
  expenses?: number;
  status: "draft" | "ordered" | "received" | "cancelled";
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
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<ModalPurchase | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const exchangeRate = 2.85; // Курс лиры к рублю

  // Mock products data
  const mockProducts: Product[] = [
    { id: "1", name: "iPhone 15 Pro Max" },
    { id: "2", name: "MacBook Pro M3" },
    { id: "3", name: "iPad Air" },
    { id: "4", name: "AirPods Pro" },
  ];

  // Mock products for modal (with number ids)
  const modalProducts: ModalProduct[] = mockProducts.map(p => ({ 
    id: parseInt(p.id), 
    name: p.name 
  }));

  // Set document title
  useEffect(() => {
    document.title = "Закупки | NextAdmin - Next.js Dashboard Kit";
  }, []);

  // Load purchases from server or use mock data
  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      // For now, using mock data. Replace with actual API call when backend is ready
      const mockPurchases: Purchase[] = [
        {
          id: "PUR-2024-001",
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-16T10:00:00Z",
          totalAmount: 1050000,
          status: "received",
          isUrgent: false,
          expenses: 15000,
          items: [
            {
              id: "1",
              productId: "1",
              productName: "iPhone 15 Pro Max",
              quantity: 10,
              costPrice: 105000,
              total: 1050000,
            },
            {
              id: "2",
              productId: "3",
              productName: "iPad Air",
              quantity: 5,
              costPrice: 50000,
              total: 250000,
            },
          ],
        },
        {
          id: "PUR-2024-002",
          createdAt: "2024-01-10T10:00:00Z",
          updatedAt: "2024-01-12T10:00:00Z",
          totalAmount: 540000,
          status: "ordered",
          isUrgent: true,
          expenses: 8000,
          items: [
            {
              id: "3",
              productId: "2",
              productName: "MacBook Pro M3",
              quantity: 3,
              costPrice: 180000,
              total: 540000,
            },
          ],
        },
      ];
      setPurchases(mockPurchases);
    } catch (error) {
      console.error("Error loading purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  // Функция добавления товара в черновик
  const addItemToDraft = () => {
    if (!selectedProduct || !quantity || !costPrice) {
      return;
    }

    const product = mockProducts.find(p => p.id === selectedProduct);
    if (!product) return;

    const newItem: PurchaseItem = {
      id: Date.now().toString(),
      productId: selectedProduct,
      productName: product.name,
      quantity: parseInt(quantity),
      costPrice: parseFloat(costPrice),
      total: parseInt(quantity) * parseFloat(costPrice),
    };

    setDraftItems([...draftItems, newItem]);
    setSelectedProduct("");
    setQuantity("");
    setCostPrice("");
  };

  const removeItemFromDraft = (id: string) => {
    setDraftItems(draftItems.filter(item => item.id !== id));
  };

  const savePurchase = () => {
    // Implementation for saving new purchase
    console.log("Saving purchase...");
  };

  // Helper function to convert Purchase to ModalPurchase
  const convertToModalPurchase = (purchase: Purchase): ModalPurchase => {
    return {
      id: parseInt(purchase.id.replace(/\D/g, '') || '0'), // Extract numbers from ID
      totalAmount: purchase.totalAmount,
      isUrgent: purchase.isUrgent,
      expenses: purchase.expenses,
      status: purchase.status,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
      items: purchase.items.map(item => ({
        id: parseInt(item.id),
        productId: parseInt(item.productId),
        productName: item.productName,
        quantity: item.quantity,
        costPrice: item.costPrice,
        total: item.total,
      })),
    };
  };

  // New functions for edit and delete
  const handleEdit = (purchase: Purchase) => {
    const modalPurchase = convertToModalPurchase(purchase);
    setEditingPurchase(modalPurchase);
    setIsModalOpen(true);
  };

  const handleDelete = async (purchase: Purchase) => {
    if (!confirm(`Вы уверены, что хотите удалить закупку ${purchase.id}?`)) {
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

      // Update local state
      setPurchases(prev => prev.filter(p => p.id !== purchase.id));
    } catch (error) {
      console.error('Error deleting purchase:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleModalSuccess = (updatedPurchase: ModalPurchase) => {
    // Convert ModalPurchase back to Purchase for local state
    const convertedPurchase: Purchase = {
      id: editingPurchase ? `PUR-2024-${updatedPurchase.id.toString().padStart(3, '0')}` : `PUR-2024-${Date.now()}`,
      totalAmount: updatedPurchase.totalAmount,
      isUrgent: updatedPurchase.isUrgent,
      expenses: updatedPurchase.expenses,
      status: updatedPurchase.status,
      createdAt: updatedPurchase.createdAt,
      updatedAt: updatedPurchase.updatedAt,
      items: updatedPurchase.items.map(item => ({
        id: item.id?.toString() || Date.now().toString(),
        productId: item.productId.toString(),
        productName: item.productName,
        quantity: item.quantity,
        costPrice: item.costPrice,
        total: item.total,
      })),
    };

    if (editingPurchase) {
      // Update existing purchase
      setPurchases(prev => prev.map(p => {
        const editingId = `PUR-2024-${editingPurchase.id.toString().padStart(3, '0')}`;
        return p.id === editingId ? convertedPurchase : p;
      }));
    } else {
      // Add new purchase
      setPurchases(prev => [convertedPurchase, ...prev]);
    }
    setEditingPurchase(null);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingPurchase(null);
  };

  // Получение цвета статуса
  const getStatusBadge = (status: Purchase['status']) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "draft":
        return `${baseClasses} bg-gray-500/10 text-gray-500 border border-gray-500/20`;
      case "ordered":
        return `${baseClasses} bg-warning/10 text-warning border border-warning/20`;
      case "received":
        return `${baseClasses} bg-success/10 text-success border border-success/20`;
      case "cancelled":
        return `${baseClasses} bg-red/10 text-red border border-red/20`;
      default:
        return `${baseClasses} bg-gray-500/10 text-gray-500 border border-gray-500/20`;
    }
  };

  const getStatusText = (status: Purchase['status']) => {
    switch (status) {
      case "draft": return "Черновик";
      case "ordered": return "Заказано";
      case "received": return "Получено";
      case "cancelled": return "Отменено";
      default: return status;
    }
  };

  // Calculate totals for draft items
  const draftTotalItems = draftItems.length;
  const draftTotalAmount = draftItems.reduce((sum, item) => sum + item.total, 0);
  const draftTotalInTurkishLira = draftTotalAmount / exchangeRate;

  // Фильтрация закупок
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = searchQuery === "" || 
      purchase.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 rounded-[10px] border border-stroke bg-white shadow-default dark:border-[#334155] dark:bg-[#1F2937]">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-[#334155]">
          <h3 className="font-semibold text-black dark:text-[#F9FAFB] flex items-center gap-2">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Создание закупки
          </h3>
        </div>

        <div className="p-6.5">
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="block text-body-sm font-medium text-dark dark:text-[#F9FAFB] mb-3">
                Выберите товар
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full appearance-none rounded-[10px] border border-stroke bg-transparent px-5 py-3 outline-none focus:ring-gradient dark:border-[#334155] dark:bg-[#374151] text-dark dark:text-[#F9FAFB]"
              >
                <option value="">Выберите товар</option>
                {mockProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <InputGroup
              label="Количество"
              type="number"
              placeholder="Введите количество"
              value={quantity}
              handleChange={(e) => setQuantity(e.target.value)}
            />

            <InputGroup
              label="Себестоимость (₽)"
              type="number"
              placeholder="Введите себестоимость"
              value={costPrice}
              handleChange={(e) => setCostPrice(e.target.value)}
            />

            <div className="flex items-end">
              <button
                onClick={addItemToDraft}
                className="w-full rounded-[10px] bg-primary px-5 py-3 font-medium text-white transition hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Добавить в список
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h4 className="mb-4 font-semibold text-black dark:text-[#F9FAFB]">
                Черновой список товаров
              </h4>
              
              {draftItems.length === 0 ? (
                <div className="rounded-[10px] border border-stroke bg-gray-50 dark:border-[#334155] dark:bg-[#374151] p-8 text-center">
                  <div className="mb-4">📝</div>
                  <p className="text-gray-500 dark:text-[#94A3B8]">
                    Список товаров пуст. Добавьте товары используя форму выше.
                  </p>
                </div>
              ) : (
                <div className="rounded-[10px] border border-stroke dark:border-[#334155] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-gray-2 text-left dark:bg-[#374151]">
                          <th className="px-4 py-3 font-medium text-black dark:text-[#F9FAFB]">
                            Товар
                          </th>
                          <th className="px-4 py-3 font-medium text-black dark:text-[#F9FAFB]">
                            Кол-во
                          </th>
                          <th className="px-4 py-3 font-medium text-black dark:text-[#F9FAFB]">
                            Цена
                          </th>
                          <th className="px-4 py-3 font-medium text-black dark:text-[#F9FAFB]">
                            Сумма
                          </th>
                          <th className="px-4 py-3 font-medium text-black dark:text-[#F9FAFB]">
                            
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {draftItems.map((item, index) => (
                          <tr key={item.id} className={index % 2 === 0 ? "bg-white dark:bg-[#1F2937]" : "bg-gray-50 dark:bg-[#374151]"}>
                            <td className="px-4 py-3 text-black dark:text-[#F9FAFB]">
                              {item.productName}
                            </td>
                            <td className="px-4 py-3 text-black dark:text-[#F9FAFB]">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-black dark:text-[#F9FAFB]">
                              ₽{item.costPrice.toLocaleString('ru-RU')}
                            </td>
                            <td className="px-4 py-3 font-semibold text-success">
                              ₽{item.total.toLocaleString('ru-RU')}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeItemFromDraft(item.id)}
                                className="text-red hover:text-red/80 transition"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[10px] border border-stroke bg-gray-50 dark:border-[#334155] dark:bg-[#374151] p-6">
              <h4 className="mb-4 font-semibold text-black dark:text-[#F9FAFB] flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Итоги закупки
              </h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-[#94A3B8]">Позиций:</span>
                  <span className="font-medium text-black dark:text-[#F9FAFB]">{draftTotalItems}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-[#94A3B8]">Общая сумма:</span>
                  <span className="font-semibold text-success">₽{draftTotalAmount.toLocaleString('ru-RU')}</span>
                </div>
                
                <div className="border-t border-stroke dark:border-[#334155] pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-500 dark:text-[#94A3B8]">Курс лиры:</span>
                    <span className="text-black dark:text-[#F9FAFB]">1 ₺ = {exchangeRate} ₽</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-[#94A3B8]">В лирах:</span>
                    <span className="font-medium text-warning">₺{draftTotalInTurkishLira.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="border-t border-stroke dark:border-[#334155] pt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`flex h-5 w-5 items-center justify-center rounded-[4px] border ${
                      isUrgent 
                        ? "border-primary bg-primary" 
                        : "border-stroke dark:border-[#334155]"
                    }`}>
                      {isUrgent && (
                        <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-black dark:text-[#F9FAFB]">Срочная закупка</span>
                  </label>
                </div>
                
                <button
                  onClick={savePurchase}
                  disabled={draftItems.length === 0}
                  className="w-full mt-6 rounded-[10px] bg-success px-5 py-3 font-medium text-white transition hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-success disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600"
                >
                  <svg className="inline h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Сохранить закупку
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[10px] border border-stroke bg-white shadow-default dark:border-[#334155] dark:bg-[#1F2937]">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-[#334155]">
          <h3 className="font-semibold text-black dark:text-[#F9FAFB] flex items-center gap-2">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.78 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
            </svg>
            История закупок
          </h3>
        </div>

        <div className="border-b border-stroke px-6.5 py-4 dark:border-[#334155]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Поиск по ID или товару..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-[10px] border border-stroke bg-transparent px-5 py-3 pl-12 outline-none focus:ring-gradient dark:border-[#334155] dark:bg-[#374151] text-dark dark:text-[#F9FAFB]"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="w-full max-w-[200px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-[10px] border border-stroke bg-transparent px-5 py-3 outline-none focus:ring-gradient dark:border-[#334155] dark:bg-[#374151] text-dark dark:text-[#F9FAFB]"
              >
                <option value="all">Все статусы</option>
                <option value="draft">Черновик</option>
                <option value="ordered">Заказано</option>
                <option value="received">Получено</option>
                <option value="cancelled">Отменено</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6.5">
          {loading ? (
            <div className="rounded-[10px] border border-stroke bg-gray-50 dark:border-[#334155] dark:bg-[#374151] p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-[#94A3B8]">Загрузка закупок...</p>
            </div>
          ) : filteredPurchases.length === 0 ? (
            <div className="rounded-[10px] border border-stroke bg-gray-50 dark:border-[#334155] dark:bg-[#374151] p-8 text-center">
              <div className="mb-4 text-6xl">📋</div>
              <h3 className="mb-2 text-xl font-semibold text-black dark:text-[#F9FAFB]">
                {searchQuery || statusFilter !== "all" ? "Закупки не найдены" : "История закупок пуста"}
              </h3>
              <p className="text-center text-gray-500 dark:text-[#94A3B8]">
                {searchQuery || statusFilter !== "all" 
                  ? "Попробуйте изменить критерии поиска" 
                  : "Создайте первую закупку используя форму выше"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[10px] border border-stroke dark:border-[#334155] overflow-hidden">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-[#374151]">
                    <th className="px-4 py-4 font-medium text-black dark:text-[#F9FAFB]">
                      ID
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-[#F9FAFB]">
                      Создано
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-[#F9FAFB]">
                      Обновлено
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-[#F9FAFB]">
                      Товары
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-[#F9FAFB]">
                      Сумма
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-[#F9FAFB]">
                      Статус
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-[#F9FAFB]">
                      Расходы
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-[#F9FAFB]">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((purchase, index) => (
                    <tr key={purchase.id} className={`border-b border-stroke dark:border-[#334155] ${
                      index % 2 === 0 ? "bg-white dark:bg-[#1F2937]" : "bg-gray-50 dark:bg-[#374151]"
                    }`}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-primary">{purchase.id}</span>
                          {purchase.isUrgent && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-xs font-medium bg-red/10 text-red">
                              Срочно
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-black dark:text-[#F9FAFB]">
                        {new Date(purchase.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-4 py-4 text-black dark:text-[#F9FAFB]">
                        {new Date(purchase.updatedAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-4 py-4">
                        <div className="max-w-xs">
                          {purchase.items.length === 1 ? (
                            <span className="text-black dark:text-[#F9FAFB]">
                              {purchase.items[0].productName} ({purchase.items[0].quantity} шт.)
                            </span>
                          ) : (
                            <div>
                              <span className="text-black dark:text-[#F9FAFB]">
                                {purchase.items[0].productName} ({purchase.items[0].quantity} шт.)
                              </span>
                              <div className="text-xs text-gray-500 dark:text-[#94A3B8]">
                                и ещё {purchase.items.length - 1} товаров
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-success">
                        ₽{purchase.totalAmount.toLocaleString('ru-RU')}
                      </td>
                      <td className="px-4 py-4">
                        <span className={getStatusBadge(purchase.status)}>
                          {getStatusText(purchase.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-black dark:text-[#F9FAFB]">
                        {purchase.expenses ? `₽${purchase.expenses.toLocaleString('ru-RU')}` : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEdit(purchase)}
                            className="text-primary hover:text-primary/80 transition"
                            title="Редактировать"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(purchase)}
                            disabled={deleting === purchase.id}
                            className="text-red hover:text-red/80 transition disabled:opacity-50"
                            title="Удалить"
                          >
                            {deleting === purchase.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-red border-t-transparent"></div>
                            ) : (
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Purchase Modal */}
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