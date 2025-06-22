'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toastNotification';

interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  prime_cost?: number;
}

interface PurchaseItem {
  productId: number;
  productName: string;
  quantity: number;
  costPrice: number;
  total: number;
}

interface ExchangeRate {
  currency: string;
  rate: number;
  rateWithBuffer: number;
}

interface CreatePurchaseFormProps {
  onSubmit: (purchaseData: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const CreatePurchaseForm: React.FC<CreatePurchaseFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const { error } = useToast();
  
  // Состояние формы
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('RUB');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [expenses, setExpenses] = useState<number>(0);
  const [supplierName, setSupplierName] = useState<string>('');
  const [supplierPhone, setSupplierPhone] = useState<string>('');
  const [supplierAddress, setSupplierAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Загрузка данных
  useEffect(() => {
    loadProducts();
    loadExchangeRates();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const loadExchangeRates = async () => {
    try {
      const response = await fetch('/api/exchange-rates/latest?currency=TRY');
      if (response.ok) {
        const data = await response.json();
        setExchangeRates([data]);
      }
    } catch (err) {
      console.error('Failed to load exchange rates:', err);
    }
  };

  // Добавление товара в закупку
  const addItem = () => {
    if (!selectedProduct || quantity <= 0 || costPrice <= 0) {
      error('Заполните все поля для добавления товара');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) {
      error('Товар не найден');
      return;
    }

    // Проверяем, не добавлен ли уже этот товар
    const existingItemIndex = items.findIndex(item => item.productId === selectedProduct);
    
    if (existingItemIndex >= 0) {
      // Обновляем существующий товар
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].quantity * costPrice;
      setItems(updatedItems);
    } else {
      // Добавляем новый товар
      const newItem: PurchaseItem = {
        productId: selectedProduct,
        productName: product.name,
        quantity,
        costPrice,
        total: quantity * costPrice
      };
      setItems([...items, newItem]);
    }

    // Сбрасываем форму добавления
    setSelectedProduct(0);
    setQuantity(1);
    setCostPrice(0);
  };

  // Удаление товара из закупки
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Обновление количества товара
  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(index);
      return;
    }

    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: newQuantity,
      total: newQuantity * updatedItems[index].costPrice
    };
    setItems(updatedItems);
  };

  // Обновление цены товара
  const updateItemPrice = (index: number, newPrice: number) => {
    if (newPrice < 0) return;

    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      costPrice: newPrice,
      total: updatedItems[index].quantity * newPrice
    };
    setItems(updatedItems);
  };

  // Расчет общей суммы
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0) + expenses;
  };

  // Конвертация в рубли (для отображения)
  const convertToRub = (amount: number) => {
    const rate = exchangeRates.find(r => r.currency === currency);
    if (!rate) return amount;
    return amount * rate.rate;
  };

  // Отправка формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      error('Добавьте хотя бы один товар');
      return;
    }

    const purchaseData = {
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        costPrice: item.costPrice,
        total: item.total
      })),
      totalAmount: calculateTotal(),
      isUrgent,
      currency,
      expenses: expenses > 0 ? expenses : undefined,
      supplierName: supplierName.trim() || undefined,
      supplierPhone: supplierPhone.trim() || undefined,
      supplierAddress: supplierAddress.trim() || undefined,
      notes: notes.trim() || undefined
    };

    onSubmit(purchaseData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#1E293B] dark:text-white">
          Создание новой закупки
        </h2>
        <button
          onClick={onCancel}
          className="text-[#64748B] dark:text-gray-400 hover:text-[#1E293B] dark:hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Добавление товаров */}
        <div className="bg-[#F8FAFC] dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white mb-4">
            Добавить товар
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Товар
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => {
                  const productId = parseInt(e.target.value);
                  setSelectedProduct(productId);
                  
                  // Автозаполнение цены из prime_cost
                  const product = products.find(p => p.id === productId);
                  if (product && product.prime_cost) {
                    setCostPrice(product.prime_cost);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
              >
                <option value="">Выберите товар</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (остаток: {product.stock_quantity})
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
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Цена за шт. ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={addItem}
                className="w-full bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 font-medium"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>

        {/* Список добавленных товаров */}
        {items.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white">
              Товары в закупке ({items.length})
            </h3>
            
            {items.map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-[#1E293B] dark:text-white">
                      {item.productName}
                    </h4>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-[#64748B] dark:text-gray-400">
                          Количество:
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                          className="w-20 px-2 py-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-[#64748B] dark:text-gray-400">
                          Цена:
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.costPrice}
                          onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white text-sm"
                        />
                        <span className="text-sm text-[#64748B] dark:text-gray-400">{currency}</span>
                      </div>
                      <div className="text-sm font-medium text-[#1E293B] dark:text-white">
                        Итого: {item.total.toFixed(2)} {currency}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-500 hover:text-red-700 transition-colors ml-4"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Дополнительные поля */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
              Поставщик
            </label>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Название поставщика"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
              Телефон поставщика
            </label>
            <input
              type="tel"
              value={supplierPhone}
              onChange={(e) => setSupplierPhone(e.target.value)}
              placeholder="+90 xxx xxx xx xx"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
              Адрес поставщика
            </label>
            <input
              type="text"
              value={supplierAddress}
              onChange={(e) => setSupplierAddress(e.target.value)}
              placeholder="Адрес поставщика"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
              Дополнительные расходы ({currency})
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={expenses}
              onChange={(e) => setExpenses(parseFloat(e.target.value) || 0)}
              placeholder="Доставка, комиссии и т.д."
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
              Валюта
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
            >
              <option value="RUB">Рубль (₽)</option>
              <option value="TRY">Турецкая лира (₺)</option>
              <option value="USD">Доллар США ($)</option>
              <option value="EUR">Евро (€)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
              Примечания
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Дополнительная информация о закупке"
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20"
            />
          </div>
        </div>

        {/* Чекбокс срочности */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isUrgent"
            checked={isUrgent}
            onChange={(e) => setIsUrgent(e.target.checked)}
            className="w-4 h-4 text-[#1A6DFF] border-gray-300 dark:border-gray-600 rounded focus:ring-[#1A6DFF]/20"
          />
          <label htmlFor="isUrgent" className="text-sm font-medium text-[#374151] dark:text-gray-300">
            Срочная закупка
          </label>
        </div>

        {/* Итоговая сумма */}
        {items.length > 0 && (
          <div className="bg-[#F8FAFC] dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-[#1E293B] dark:text-white">
                Итого:
              </span>
              <div className="text-right">
                <div className="text-xl font-bold text-[#1A6DFF]">
                  {calculateTotal().toFixed(2)} {currency}
                </div>
                {exchangeRates.length > 0 && (
                  <div className="text-sm text-[#64748B] dark:text-gray-400">
                    ≈ {convertToRub(calculateTotal()).toFixed(2)} ₽
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Кнопки действий */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-[#64748B] dark:text-gray-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isLoading || items.length === 0}
            className="flex-1 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white px-4 py-2 rounded-lg hover:scale-105 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? 'Создание...' : 'Создать закупку'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchaseForm; 