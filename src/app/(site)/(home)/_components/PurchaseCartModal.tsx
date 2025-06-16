"use client";

import { useState, useEffect } from "react";
// SVG иконки
const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const MinusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const ShoppingCartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L6 5H4m1 8v5a2 2 0 002 2h10a2 2 0 002-2v-5m-12 0h12" />
  </svg>
);

const CalculatorIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth={2} />
    <line x1="8" y1="6" x2="16" y2="6" strokeWidth={2} />
    <line x1="8" y1="10" x2="8" y2="10" strokeWidth={2} />
    <line x1="12" y1="10" x2="12" y2="10" strokeWidth={2} />
    <line x1="16" y1="10" x2="16" y2="10" strokeWidth={2} />
    <line x1="8" y1="14" x2="8" y2="14" strokeWidth={2} />
    <line x1="12" y1="14" x2="12" y2="14" strokeWidth={2} />
    <line x1="16" y1="14" x2="16" y2="14" strokeWidth={2} />
    <line x1="8" y1="18" x2="8" y2="18" strokeWidth={2} />
    <line x1="12" y1="18" x2="12" y2="18" strokeWidth={2} />
    <line x1="16" y1="18" x2="16" y2="18" strokeWidth={2} />
  </svg>
);

interface CartItem {
  id: number;
  name: string;
  brand: string;
  quantity: number;
  costPrice: number; // себестоимость в рублях
  costPriceTRY: number; // себестоимость в лирах
}

interface ExchangeRate {
  currency: string;
  rate: number;
  date: string;
}

interface PurchaseCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onUpdateCostPrice: (id: number, costPrice: number) => void;
  onRemoveItem: (id: number) => void;
  onCreatePurchase: (items: CartItem[], totalTRY: number, totalRUB: number, supplierName?: string, notes?: string) => void;
}

export function PurchaseCartModal({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onUpdateCostPrice,
  onRemoveItem,
  onCreatePurchase
}: PurchaseCartModalProps) {
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [supplierName, setSupplierName] = useState("Поставщик Турция");
  const [notes, setNotes] = useState("");

  // Загружаем курс лиры
  useEffect(() => {
    const loadExchangeRate = async () => {
      try {
        const response = await fetch('/api/rates/latest?currency=TRY');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            // Правильная структура из API
            setExchangeRate({
              currency: result.data.currency,
              rate: result.data.rate,
              date: result.data.effectiveDate
            });
            console.log('💱 Loaded exchange rate:', result.data.rate, 'TRY = 1 RUB // With 5% buffer:', (result.data.rate * 1.05).toFixed(4));
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки курса:', error);
        // Устанавливаем дефолтный курс
        setExchangeRate({
          currency: 'TRY',
          rate: 2.02,
          date: new Date().toISOString()
        });
      }
    };

    if (isOpen) {
      loadExchangeRate();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Расчеты (без доставки при создании закупки)
  const totalRUB = cartItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
  // Цена в лирах рассчитывается по текущему курсу с буфером 5%
  const totalTRY = exchangeRate?.rate ? totalRUB / (exchangeRate.rate * 1.05) : 0;
  // Доставка учитывается только при оприходовании товара

  const handleQuantityChange = (id: number, delta: number) => {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + delta);
      onUpdateQuantity(id, newQuantity);
    }
  };

  const handleCostPriceChange = (id: number, value: string) => {
    const costPrice = parseFloat(value) || 0;
    console.log('🏷️ Cost price changed:', { id, costPrice, exchangeRate: exchangeRate?.rate });
    onUpdateCostPrice(id, costPrice);
    // Цена в лирах рассчитывается автоматически по текущему курсу при отображении
  };

  const handleCreatePurchase = async () => {
    if (cartItems.length === 0) return;

    setLoading(true);
    try {
      await onCreatePurchase(cartItems, totalTRY, totalRUB, supplierName, notes);
      onClose();
    } catch (error) {
      console.error('Ошибка создания закупки:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] rounded-lg">
              <ShoppingCartIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Корзина закупки
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {cartItems.length} товар(ов) в корзине
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Exchange Rate Info */}
        {exchangeRate && (
          <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                 <CalculatorIcon />
                 <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                   Курс лиры на сегодня:
                 </span>
               </div>
              <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                1 ₺ = {exchangeRate?.rate?.toFixed(4) || '0.0000'} ₽ (+5% буфер)
              </div>
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Обновлено: {exchangeRate?.date ? new Date(exchangeRate.date).toLocaleDateString('ru-RU') : 'Неизвестно'}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[60vh]">
          {cartItems.length === 0 ? (
                         <div className="flex flex-col items-center justify-center py-12">
               <ShoppingCartIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
               <p className="text-gray-500 dark:text-gray-400">Корзина пуста</p>
             </div>
          ) : (
            <div className="p-6 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.brand}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                                         <button
                       onClick={() => handleQuantityChange(item.id, -1)}
                       className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                     >
                       <MinusIcon />
                     </button>
                     <span className="w-12 text-center font-medium">
                       {item.quantity}
                     </span>
                     <button
                       onClick={() => handleQuantityChange(item.id, 1)}
                       className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                     >
                       <PlusIcon />
                     </button>
                  </div>

                  {/* Cost Price Input */}
                  <div className="w-32">
                    <input
                      type="number"
                      value={item.costPrice}
                      onChange={(e) => handleCostPriceChange(item.id, e.target.value)}
                      className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Цена ₽"
                      step="0.01"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      ≈ {exchangeRate?.rate && item.costPrice > 0 ? (item.costPrice / (exchangeRate.rate * 1.05)).toFixed(2) : '0'} ₺
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="w-24 text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {(item.costPrice * item.quantity).toLocaleString()} ₽
                    </div>
                    <div className="text-xs text-gray-500">
                      {exchangeRate?.rate && item.costPrice > 0 ? ((item.costPrice * item.quantity) / (exchangeRate.rate * 1.05)).toFixed(2) : '0'} ₺
                    </div>
                  </div>

                  {/* Remove Button */}
                                     <button
                     onClick={() => onRemoveItem(item.id)}
                     className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                   >
                     <XIcon />
                   </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Supplier and Notes */}
        {cartItems.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Поставщик
                </label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Название поставщика"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Примечания
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Дополнительная информация"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer with Totals */}
        {cartItems.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="space-y-3">
              {/* Calculation Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Товары в лирах:</span>
                    <span className="font-medium">{totalTRY.toFixed(2)} ₺</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Товары в рублях:</span>
                    <span className="font-medium">{totalRUB.toLocaleString()} ₽</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Доставка указывается при оприходовании</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Итого:</span>
                    <span>{totalRUB.toLocaleString()} ₽</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleCreatePurchase}
                  disabled={loading || cartItems.length === 0}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white rounded-lg hover:opacity-90 transition-all duration-200 hover:shadow-md disabled:opacity-50"
                >
                  {loading ? 'Создание...' : `Создать закупку на ${totalRUB.toLocaleString()} ₽`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 