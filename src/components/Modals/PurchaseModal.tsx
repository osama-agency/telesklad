"use client";

import React, { useState, useEffect } from "react";
import { logger } from '@/lib/logger';

interface PurchaseItem {
  id?: number;
  productId: number;
  productName: string;
  quantity: number;
  costPrice: number;
  total: number;
}

interface Purchase {
  id: number;
  totalAmount: number;
  isUrgent: boolean;
  expenses?: number;
  status: "draft" | "sent" | "awaiting_payment" | "paid" | "in_transit" | "received" | "cancelled";
  items: PurchaseItem[];
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: number;
  name: string;
  prime_cost?: number;
  avgPurchasePriceRub?: number;
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase?: Purchase | null;
  onSuccess: (updatedPurchase: Purchase) => void;
  products: Product[];
}

type StatusType = "draft" | "sent" | "awaiting_payment" | "paid" | "in_transit" | "received" | "cancelled";

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  purchase,
  onSuccess,
  products,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    totalAmount: 0,
    isUrgent: false,
    status: "draft" as StatusType,
  });
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [newItem, setNewItem] = useState({
    productId: "",
    quantity: "",
    costPrice: "",
  });

  // Курс лиры к рублю - загружается из базы данных
  const [exchangeRate, setExchangeRate] = useState<number>(2.85); // Значение по умолчанию

  // Загрузка актуального курса лиры из базы данных
  useEffect(() => {
    const loadExchangeRate = async () => {
      try {
        const response = await fetch('/api/rates/latest?currency=TRY');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setExchangeRate(result.data.rate);
            logger.debug(`Модальное окно: загружен курс TRY: 1 ₺ = ${result.data.rate} ₽`, undefined, 'PurchaseModal');
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке курса TRY в модальном окне:', error);
      }
    };

    if (isOpen) {
      loadExchangeRate();
    }
  }, [isOpen]);

  useEffect(() => {
    logger.debug('PurchaseModal useEffect', { isOpen, hasPurchase: !!purchase }, 'PurchaseModal');
    if (purchase) {
      logger.debug('Setting form data from purchase', { purchaseId: purchase.id }, 'PurchaseModal');
      setFormData({
        totalAmount: purchase.totalAmount,
        isUrgent: purchase.isUrgent,
        status: purchase.status,
      });
      setItems(purchase.items);
    } else {
      logger.debug('No purchase, setting default form data', undefined, 'PurchaseModal');
      setFormData({
        totalAmount: 0,
        isUrgent: false,
        status: "draft",
      });
      setItems([]);
    }
  }, [purchase, isOpen]);

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.total, 0);
    setFormData((prev) => ({ ...prev, totalAmount: total }));
  }, [items]);

  // Обработчик изменения выбранного товара в модальном окне
  const handleModalProductChange = (productId: string) => {
    setNewItem(prev => ({ ...prev, productId }));
    
    if (productId) {
      const product = products.find((p) => p.id === parseInt(productId));
      if (product) {
        // Автоматически проставляем себестоимость
        const costPrice = product.avgPurchasePriceRub || product.prime_cost;
        if (costPrice) {
          setNewItem(prev => ({ ...prev, costPrice: costPrice.toString() }));
          logger.debug(`Auto-fill cost price for product`, { productName: product.name, costPrice }, 'PurchaseModal');
        } else {
          setNewItem(prev => ({ ...prev, costPrice: "" }));
        }
      }
    } else {
      setNewItem(prev => ({ ...prev, costPrice: "" }));
    }
  };

  const addItem = () => {
    if (!newItem.productId || !newItem.quantity || !newItem.costPrice) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    const product = products.find((p) => p.id === parseInt(newItem.productId));
    if (!product) {
      alert("Товар не найден");
      return;
    }

    const quantity = parseInt(newItem.quantity);
    const costPrice = parseFloat(newItem.costPrice);
    
    // Проверяем что значения корректные
    if (isNaN(quantity) || quantity <= 0) {
      alert("Количество должно быть больше 0");
      return;
    }
    
    if (isNaN(costPrice) || costPrice <= 0) {
      alert("Себестоимость должна быть больше 0");
      return;
    }
    
    // Считаем total в рублях (costPrice уже в рублях)
    const total = quantity * costPrice;

    const item: PurchaseItem = {
      productId: product.id,
      productName: product.name,
      quantity,
      costPrice,
      total,
    };

    logger.debug('Adding purchase item', { productName: item.productName, quantity: item.quantity }, 'PurchaseModal');
    setItems((prev) => [...prev, item]);
    setNewItem({ productId: "", quantity: "", costPrice: "" });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Новые функции для inline редактирования
  const updateItemQuantity = (index: number, newQuantity: number) => {
    setItems((prev) => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = {
          ...item,
          quantity: newQuantity,
          total: newQuantity * item.costPrice,
        };
        return updatedItem;
      }
      return item;
    }));
  };

  const updateItemCostPrice = (index: number, newCostPrice: number) => {
    setItems((prev) => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = {
          ...item,
          costPrice: newCostPrice,
          total: item.quantity * newCostPrice,
        };
        return updatedItem;
      }
      return item;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Добавьте хотя бы один товар в закупку");
      return;
    }

    setLoading(true);
    try {
      const url = purchase ? `/api/purchases/${purchase.id}` : "/api/purchases";
      const method = purchase ? "PUT" : "POST";

      const requestData = {
        totalAmount: formData.totalAmount,
        isUrgent: formData.isUrgent,
        status: formData.status,
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          costPrice: item.costPrice,
          total: item.total,
        })),
      };

      logger.debug('Sending purchase data', { itemsCount: requestData.items.length, totalAmount: requestData.totalAmount }, 'PurchaseModal');

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save purchase");
      }

      const savedPurchase = await response.json();
      onSuccess(savedPurchase);
      onClose();
    } catch (error) {
      console.error("Error saving purchase:", error);
      alert(`Ошибка при сохранении: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  logger.debug('PurchaseModal render', { isOpen, hasPurchase: !!purchase, productsCount: products.length }, 'PurchaseModal');

  if (!isOpen) return null;

  const totalInTurkishLira = formData.totalAmount / exchangeRate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-6 py-4">
          <h2 className="text-xl font-semibold text-[#1E293B] dark:text-white flex items-center gap-2">
            <svg className="h-6 w-6 text-[#1A6DFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5L11 21M7 13L11 21M17 17a2 2 0 100 4 2 2 0 000-4zM9 17a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {purchase ? "Редактировать закупку" : "Создать закупку"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] bg-[#F8FAFC] dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left Column - Items */}
              <div className="lg:col-span-2">
                <h3 className="mb-4 text-lg font-semibold text-[#1E293B] dark:text-white">
                  Товары в закупке
                </h3>

                {/* Add New Item */}
                <div className="mb-6 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                  <h4 className="mb-3 font-medium text-[#1E293B] dark:text-white">
                    Добавить товар
                  </h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <select
                      value={newItem.productId}
                      onChange={(e) => handleModalProductChange(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                    >
                      <option value="">Выберите товар</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Количество"
                      value={newItem.quantity}
                      onChange={(e) =>
                        setNewItem((prev) => ({ ...prev, quantity: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                    />

                    <input
                      type="number"
                      placeholder="Себестоимость (₽)"
                      value={newItem.costPrice}
                      onChange={(e) =>
                        setNewItem((prev) => ({ ...prev, costPrice: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                      step="0.01"
                      min="0"
                    />

                    <button
                      type="button"
                      onClick={addItem}
                      className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] px-3 py-2 text-sm font-medium text-white transition-all hover:shadow-md hover:scale-105"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Добавить
                    </button>
                  </div>
                </div>

                {/* Items List with Inline Editing */}
                {items.length === 0 ? (
                  <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 text-center">
                    <div className="mb-4 text-4xl">📝</div>
                    <p className="text-[#64748B] dark:text-gray-400">
                      Список товаров пуст
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                            <th className="px-4 py-3 text-sm font-medium text-[#1E293B] dark:text-gray-300">
                              Товар
                            </th>
                            <th className="px-4 py-3 text-sm font-medium text-[#1E293B] dark:text-gray-300">
                              Кол-во
                            </th>
                            <th className="px-4 py-3 text-sm font-medium text-[#1E293B] dark:text-gray-300">
                              Цена
                            </th>
                            <th className="px-4 py-3 text-sm font-medium text-[#1E293B] dark:text-gray-300">
                              Сумма
                            </th>
                            <th className="px-4 py-3 text-sm font-medium text-[#1E293B] dark:text-gray-300">
                              
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0
                                  ? "bg-white dark:bg-gray-900"
                                  : "bg-gray-50 dark:bg-gray-800"
                              }
                            >
                              <td className="px-4 py-3">
                                <select
                                  value={item.productId}
                                  onChange={(e) => {
                                    const newProductId = parseInt(e.target.value);
                                    const product = products.find(p => p.id === newProductId);
                                    if (product) {
                                      setItems(prev => prev.map((prevItem, i) => {
                                        if (i === index) {
                                          const newCostPrice = product.avgPurchasePriceRub || product.prime_cost || prevItem.costPrice;
                                          return {
                                            ...prevItem,
                                            productId: newProductId,
                                            productName: product.name,
                                            costPrice: newCostPrice,
                                            total: prevItem.quantity * newCostPrice
                                          };
                                        }
                                        return prevItem;
                                      }));
                                    }
                                  }}
                                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                                >
                                  {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                      {product.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newQuantity = parseInt(e.target.value) || 0;
                                    updateItemQuantity(index, newQuantity);
                                  }}
                                  className="w-20 rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent px-2 py-1 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                                  min="1"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-[#64748B] dark:text-gray-400">₽</span>
                                  <input
                                    type="number"
                                    value={item.costPrice}
                                    onChange={(e) => {
                                      const newCostPrice = parseFloat(e.target.value) || 0;
                                      updateItemCostPrice(index, newCostPrice);
                                    }}
                                    className="w-24 rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent px-2 py-1 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-[#1A6DFF]">
                                ₽{item.total.toLocaleString("ru-RU")}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="rounded-lg p-1 text-gray-400 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600"
                                  title="Удалить товар"
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
                    
                    {/* Hint for editing */}
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Вы можете редактировать товар, количество и цену прямо в таблице
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Summary */}
              <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
                <h3 className="mb-4 text-lg font-semibold text-[#1E293B] dark:text-white">
                  Итоги
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#64748B] dark:text-gray-400">
                      Позиций:
                    </span>
                    <span className="font-medium text-[#1E293B] dark:text-white">
                      {items.length}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#64748B] dark:text-gray-400">
                      Общая сумма:
                    </span>
                    <span className="font-semibold text-[#1A6DFF]">
                      ₽{formData.totalAmount.toLocaleString("ru-RU")}
                    </span>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[#64748B] dark:text-gray-400">
                        Курс лиры:
                      </span>
                      <span className="text-sm text-[#1E293B] dark:text-white">
                        1 ₺ = {exchangeRate} ₽
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#64748B] dark:text-gray-400">
                        В лирах:
                      </span>
                      <span className="font-medium text-amber-600">
                        ₺{totalInTurkishLira.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                    <label className="block text-sm font-medium text-[#1E293B] dark:text-gray-300 mb-2">
                      Статус
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.value as StatusType,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-[#1E293B] dark:text-white transition-all focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
                    >
                      <option value="draft">🗒️ Черновик</option>
                      <option value="sent">📤 Отправлено</option>
                      <option value="awaiting_payment">💳 Ожидает оплату</option>
                      <option value="paid">💰 Оплачено</option>
                      <option value="in_transit">🚚 В пути</option>
                      <option value="received">✅ Получено</option>
                      <option value="cancelled">❌ Отменено</option>
                    </select>
                  </div>

                  {/* Urgent */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="urgent"
                      checked={formData.isUrgent}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, isUrgent: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-[#1A6DFF] focus:ring-2 focus:ring-[#1A6DFF]/20"
                    />
                    <label htmlFor="urgent" className="ml-2 text-sm font-medium text-[#1E293B] dark:text-gray-300">
                      Срочная закупка
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-medium text-[#64748B] dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="rounded-lg bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Сохранение...</span>
                  </div>
                ) : (
                  <span>{purchase ? "Обновить" : "Создать"} закупку</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal; 