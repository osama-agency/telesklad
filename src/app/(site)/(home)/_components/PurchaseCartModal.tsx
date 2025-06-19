"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div 
            className="w-full max-w-4xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <motion.div 
              className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3">
                <motion.div 
                  className="p-2 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCartIcon className="w-5 h-5 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Корзина закупки
                  </h2>
                  <motion.p 
                    className="text-sm text-gray-600 dark:text-gray-400"
                    key={cartItems.length}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {cartItems.length} товар(ов) в корзине
                  </motion.p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <XIcon />
              </motion.button>
            </motion.div>

            {/* Exchange Rate Info */}
            {exchangeRate && (
              <motion.div 
                className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalculatorIcon />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Курс лиры на сегодня:
                    </span>
                  </div>
                  <motion.div 
                    className="text-lg font-bold text-blue-900 dark:text-blue-100"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.3 }}
                  >
                    1 ₺ = {exchangeRate?.rate?.toFixed(4) || '0.0000'} ₽ (+5% буфер)
                  </motion.div>
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Обновлено: {exchangeRate?.date ? new Date(exchangeRate.date).toLocaleDateString('ru-RU') : 'Неизвестно'}
                </div>
              </motion.div>
            )}

            {/* Content */}
            <div className="flex flex-col h-full max-h-[calc(90vh-200px)]">
              {cartItems.length === 0 ? (
                <motion.div 
                  className="flex flex-col items-center justify-center py-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCartIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Корзина пуста
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    Добавьте товары для создания закупки
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Items List */}
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <AnimatePresence mode="popLayout">
                        {cartItems.map((item, index) => (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            transition={{ 
                              layout: { type: "spring", bounce: 0.3, duration: 0.6 },
                              opacity: { duration: 0.2 },
                              x: { duration: 0.3 }
                            }}
                            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex items-start gap-4">
                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                  {item.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {item.brand}
                                </p>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2">
                                <motion.button
                                  onClick={() => handleQuantityChange(item.id, -1)}
                                  className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                  disabled={item.quantity <= 1}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <MinusIcon />
                                </motion.button>
                                <motion.span 
                                  className="w-12 text-center font-medium text-gray-900 dark:text-white"
                                  key={item.quantity}
                                  initial={{ scale: 1.2 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500 }}
                                >
                                  {item.quantity}
                                </motion.span>
                                <motion.button
                                  onClick={() => handleQuantityChange(item.id, 1)}
                                  className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <PlusIcon />
                                </motion.button>
                              </div>

                              {/* Price Input */}
                              <div className="w-32">
                                <motion.input
                                  type="number"
                                  value={item.costPrice}
                                  onChange={(e) => handleCostPriceChange(item.id, e.target.value)}
                                  className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1A6DFF] focus:border-[#1A6DFF] transition-all"
                                  placeholder="Цена ₽"
                                  min="0"
                                  step="0.01"
                                  whileFocus={{ scale: 1.02 }}
                                />
                                {exchangeRate && (
                                  <motion.p 
                                    className="text-xs text-gray-500 dark:text-gray-400 mt-1"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                  >
                                    ≈ {(item.costPrice / (exchangeRate.rate * 1.05)).toFixed(2)} ₺
                                  </motion.p>
                                )}
                              </div>

                              {/* Total */}
                              <div className="w-24 text-right">
                                <motion.p 
                                  className="font-medium text-gray-900 dark:text-white"
                                  key={item.costPrice * item.quantity}
                                  initial={{ scale: 1.1 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500 }}
                                >
                                  {(item.costPrice * item.quantity).toFixed(2)} ₽
                                </motion.p>
                                {exchangeRate && (
                                  <motion.p 
                                    className="text-xs text-gray-500 dark:text-gray-400"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                  >
                                    ≈ {((item.costPrice * item.quantity) / (exchangeRate.rate * 1.05)).toFixed(2)} ₺
                                  </motion.p>
                                )}
                              </div>

                              {/* Remove Button */}
                              <motion.button
                                onClick={() => onRemoveItem(item.id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <TrashIcon />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  {/* Supplier and Notes */}
                  <motion.div 
                    className="px-6 py-4 border-t border-gray-200 dark:border-gray-700"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Поставщик
                        </label>
                        <motion.input
                          type="text"
                          value={supplierName}
                          onChange={(e) => setSupplierName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1A6DFF] focus:border-[#1A6DFF] transition-all"
                          placeholder="Название поставщика"
                          whileFocus={{ scale: 1.01 }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Примечания
                        </label>
                        <motion.textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1A6DFF] focus:border-[#1A6DFF] transition-all resize-none"
                          placeholder="Дополнительная информация"
                          rows={2}
                          whileFocus={{ scale: 1.01 }}
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Footer */}
                  <motion.div 
                    className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <motion.p 
                          className="text-lg font-bold text-gray-900 dark:text-white"
                          key={totalRUB}
                          initial={{ scale: 1.1 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          Итого: {totalRUB.toFixed(2)} ₽
                        </motion.p>
                        {exchangeRate && (
                          <motion.p 
                            className="text-sm text-gray-600 dark:text-gray-400"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                          >
                            ≈ {totalTRY.toFixed(2)} ₺
                          </motion.p>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <motion.button
                          onClick={onClose}
                          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Продолжить покупки
                        </motion.button>
                        <motion.button
                          onClick={handleCreatePurchase}
                          disabled={loading || cartItems.length === 0}
                          className="px-6 py-2 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(26, 109, 255, 0.3)" }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {loading ? (
                            <motion.div 
                              className="flex items-center gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <motion.div
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              Создание...
                            </motion.div>
                          ) : (
                            'Создать закупку'
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 