"use client";

import React, { useState, useEffect } from "react";

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
  status: "draft" | "ordered" | "received" | "cancelled";
  items: PurchaseItem[];
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: number;
  name: string;
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase?: Purchase | null;
  onSuccess: (updatedPurchase: Purchase) => void;
  products: Product[];
}

type StatusType = "draft" | "ordered" | "received" | "cancelled";

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
    expenses: 0,
    status: "draft" as StatusType,
  });
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [newItem, setNewItem] = useState({
    productId: "",
    quantity: "",
    costPrice: "",
  });

  const exchangeRate = 2.85; // Курс лиры к рублю

  useEffect(() => {
    if (purchase) {
      setFormData({
        totalAmount: purchase.totalAmount,
        isUrgent: purchase.isUrgent,
        expenses: purchase.expenses || 0,
        status: purchase.status,
      });
      setItems(purchase.items);
    } else {
      setFormData({
        totalAmount: 0,
        isUrgent: false,
        expenses: 0,
        status: "draft",
      });
      setItems([]);
    }
  }, [purchase, isOpen]);

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.total, 0);
    setFormData((prev) => ({ ...prev, totalAmount: total }));
  }, [items]);

  const addItem = () => {
    if (!newItem.productId || !newItem.quantity || !newItem.costPrice) {
      return;
    }

    const product = products.find((p) => p.id === parseInt(newItem.productId));
    if (!product) return;

    const quantity = parseInt(newItem.quantity);
    const costPrice = parseFloat(newItem.costPrice);
    const total = quantity * costPrice;

    const item: PurchaseItem = {
      productId: product.id,
      productName: product.name,
      quantity,
      costPrice,
      total,
    };

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
    if (items.length === 0) return;

    setLoading(true);
    try {
      const url = purchase ? `/api/purchases/${purchase.id}` : "/api/purchases";
      const method = purchase ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            costPrice: item.costPrice,
            total: item.total,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save purchase");
      }

      const savedPurchase = await response.json();
      onSuccess(savedPurchase);
      onClose();
    } catch (error) {
      console.error("Error saving purchase:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalInTurkishLira = formData.totalAmount / exchangeRate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-[#1F2937] rounded-[10px] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-[#334155]">
          <h2 className="text-xl font-semibold text-black dark:text-[#F9FAFB] flex items-center gap-2">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5L11 21M7 13L11 21M17 17a2 2 0 100 4 2 2 0 000-4zM9 17a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {purchase ? "Редактировать закупку" : "Создать закупку"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left Column - Items */}
              <div className="lg:col-span-2">
                <h3 className="mb-4 text-lg font-semibold text-black dark:text-[#F9FAFB]">
                  Товары в закупке
                </h3>

                {/* Add New Item */}
                <div className="mb-6 rounded-[10px] border border-stroke bg-gray-50 dark:border-[#334155] dark:bg-[#374151] p-4">
                  <h4 className="mb-3 font-medium text-black dark:text-[#F9FAFB]">
                    Добавить товар
                  </h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <select
                      value={newItem.productId}
                      onChange={(e) =>
                        setNewItem((prev) => ({ ...prev, productId: e.target.value }))
                      }
                      className="w-full appearance-none rounded-[10px] border border-stroke bg-transparent px-3 py-2 outline-none focus:ring-gradient dark:border-[#334155] dark:bg-[#1F2937] text-dark dark:text-[#F9FAFB] text-sm"
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
                      className="w-full rounded-[10px] border border-stroke bg-transparent px-3 py-2 outline-none focus:ring-gradient dark:border-[#334155] dark:bg-[#1F2937] text-dark dark:text-[#F9FAFB] text-sm"
                    />

                    <input
                      type="number"
                      placeholder="Себестоимость"
                      value={newItem.costPrice}
                      onChange={(e) =>
                        setNewItem((prev) => ({ ...prev, costPrice: e.target.value }))
                      }
                      className="w-full rounded-[10px] border border-stroke bg-transparent px-3 py-2 outline-none focus:ring-gradient dark:border-[#334155] dark:bg-[#1F2937] text-dark dark:text-[#F9FAFB] text-sm"
                    />

                    <button
                      type="button"
                      onClick={addItem}
                      className="flex items-center justify-center gap-2 rounded-[10px] bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-opacity-90"
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
                  <div className="rounded-[10px] border border-stroke bg-gray-50 dark:border-[#334155] dark:bg-[#374151] p-8 text-center">
                    <div className="mb-4 text-4xl">📝</div>
                    <p className="text-gray-500 dark:text-[#94A3B8]">
                      Список товаров пуст
                    </p>
                  </div>
                ) : (
                  <div className="rounded-[10px] border border-stroke dark:border-[#334155] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto">
                        <thead>
                          <tr className="bg-gray-2 text-left dark:bg-[#374151]">
                            <th className="px-4 py-3 text-sm font-medium text-black dark:text-[#F9FAFB]">
                              Товар
                            </th>
                            <th className="px-4 py-3 text-sm font-medium text-black dark:text-[#F9FAFB]">
                              Кол-во
                            </th>
                            <th className="px-4 py-3 text-sm font-medium text-black dark:text-[#F9FAFB]">
                              Цена
                            </th>
                            <th className="px-4 py-3 text-sm font-medium text-black dark:text-[#F9FAFB]">
                              Сумма
                            </th>
                            <th className="px-4 py-3 text-sm font-medium text-black dark:text-[#F9FAFB]">
                              
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0
                                  ? "bg-white dark:bg-[#1F2937]"
                                  : "bg-gray-50 dark:bg-[#374151]"
                              }
                            >
                              <td className="px-4 py-3 text-sm text-black dark:text-[#F9FAFB]">
                                {item.productName}
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const newQuantity = parseInt(e.target.value) || 0;
                                    updateItemQuantity(index, newQuantity);
                                  }}
                                  className="w-full rounded-[6px] border border-stroke bg-transparent px-2 py-1 text-sm outline-none focus:ring-gradient dark:border-[#334155] dark:bg-[#1F2937] text-black dark:text-[#F9FAFB]"
                                  min="1"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-500 dark:text-[#94A3B8]">₽</span>
                                  <input
                                    type="number"
                                    value={item.costPrice}
                                    onChange={(e) => {
                                      const newCostPrice = parseFloat(e.target.value) || 0;
                                      updateItemCostPrice(index, newCostPrice);
                                    }}
                                    className="w-full rounded-[6px] border border-stroke bg-transparent px-2 py-1 text-sm outline-none focus:ring-gradient dark:border-[#334155] dark:bg-[#1F2937] text-black dark:text-[#F9FAFB]"
                                    min="0"
                                    step="0.01"
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-success">
                                ₽{item.total.toLocaleString("ru-RU")}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="text-red hover:text-red/80 transition rounded-[4px] p-1 hover:bg-red/10"
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
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-stroke dark:border-[#334155]">
                      <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Вы можете редактировать количество и цену прямо в таблице
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Summary */}
              <div className="rounded-[10px] border border-stroke bg-gray-50 dark:border-[#334155] dark:bg-[#374151] p-6">
                <h3 className="mb-4 text-lg font-semibold text-black dark:text-[#F9FAFB]">
                  Итоги
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-[#94A3B8]">
                      Позиций:
                    </span>
                    <span className="font-medium text-black dark:text-[#F9FAFB]">
                      {items.length}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-[#94A3B8]">
                      Общая сумма:
                    </span>
                    <span className="font-semibold text-success">
                      ₽{formData.totalAmount.toLocaleString("ru-RU")}
                    </span>
                  </div>

                  <div className="border-t border-stroke dark:border-[#334155] pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500 dark:text-[#94A3B8]">
                        Курс лиры:
                      </span>
                      <span className="text-sm text-black dark:text-[#F9FAFB]">
                        1 ₺ = {exchangeRate} ₽
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-[#94A3B8]">
                        В лирах:
                      </span>
                      <span className="font-medium text-warning">
                        ₺{totalInTurkishLira.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="border-t border-stroke dark:border-[#334155] pt-4">
                    <label className="block text-sm font-medium text-black dark:text-[#F9FAFB] mb-2">
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
                      className="w-full appearance-none rounded-[10px] border border-stroke bg-transparent px-3 py-2 outline-none focus:ring-gradient dark:border-[#334155] dark:bg-[#1F2937] text-dark dark:text-[#F9FAFB] text-sm"
                    >
                      <option value="draft">Черновик</option>
                      <option value="ordered">Заказано</option>
                      <option value="received">Получено</option>
                      <option value="cancelled">Отменено</option>
                    </select>
                  </div>

                  {/* Expenses */}
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-[#F9FAFB] mb-2">
                      Расходы (₽)
                    </label>
                    <input
                      type="number"
                      value={formData.expenses}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          expenses: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full rounded-[10px] border border-stroke bg-transparent px-3 py-2 outline-none focus:ring-gradient dark:border-[#334155] dark:bg-[#1F2937] text-dark dark:text-[#F9FAFB] text-sm"
                      placeholder="0"
                    />
                  </div>

                  {/* Urgent */}
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isUrgent}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isUrgent: e.target.checked,
                          }))
                        }
                        className="sr-only"
                      />
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-[4px] border ${
                          formData.isUrgent
                            ? "border-primary bg-primary"
                            : "border-stroke dark:border-[#334155]"
                        }`}
                      >
                        {formData.isUrgent && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-black dark:text-[#F9FAFB]">
                        Срочная закупка
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-4 border-t border-stroke pt-6 dark:border-[#334155]">
              <button
                type="button"
                onClick={onClose}
                className="rounded-[10px] border border-stroke px-6 py-2 font-medium text-black transition hover:bg-gray-50 dark:border-[#334155] dark:text-[#F9FAFB] dark:hover:bg-[#374151]"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="rounded-[10px] bg-primary px-6 py-2 font-medium text-white transition hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600"
              >
                {loading
                  ? "Сохранение..."
                  : purchase
                  ? "Обновить закупку"
                  : "Создать закупку"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal; 