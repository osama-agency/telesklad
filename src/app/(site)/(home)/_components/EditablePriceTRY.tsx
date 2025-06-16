'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface EditablePriceTRYProps {
  productId: number;
  productName: string;
  avgpurchasepricetry?: number;
  prime_cost?: number;
  exchangeRate?: number;
  onUpdate?: (newPriceTRY: number) => void;
}

export function EditablePriceTRY({ 
  productId, 
  productName,
  avgpurchasepricetry, 
  prime_cost, 
  exchangeRate,
  onUpdate 
}: EditablePriceTRYProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Определяем текущую цену для отображения
  const getCurrentPriceTRY = () => {
    if (avgpurchasepricetry && avgpurchasepricetry > 0) {
      return avgpurchasepricetry;
    }
    
    if (prime_cost && exchangeRate && exchangeRate > 0) {
      return prime_cost / (exchangeRate * 1.05); // с учетом 5% буфера
    }
    
    return 0;
  };

  const currentPriceTRY = getCurrentPriceTRY();
  const isUsingAvgPrice = avgpurchasepricetry && avgpurchasepricetry > 0;

  const handleEdit = () => {
    setIsEditing(true);
    setValue(currentPriceTRY.toFixed(2));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValue('');
  };

  const handleSave = async () => {
    const newPrice = parseFloat(value);
    
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error('Введите корректную цену');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`/api/products/${productId}/price-try`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceTRY: newPrice }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении цены');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Цена обновлена');
        setIsEditing(false);
        setValue('');
        
        // Вызываем callback для обновления родительского компонента
        if (onUpdate) {
          onUpdate(newPrice);
        }
      } else {
        throw new Error(result.message || 'Ошибка при обновлении');
      }
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error('Ошибка при обновлении цены');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyPress}
          step="0.01"
          min="0"
          className="w-20 px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          autoFocus
          disabled={loading}
        />
        <button
          onClick={handleSave}
          disabled={loading}
          className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
          title="Сохранить"
        >
          {loading ? (
            <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
          title="Отменить"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 group">
      <div className="flex flex-col">
        <div 
          className={`text-xs font-medium cursor-pointer transition-colors ${
            isUsingAvgPrice 
              ? 'text-orange-600 dark:text-orange-400' 
              : 'text-gray-600 dark:text-gray-400'
          } hover:text-orange-700 dark:hover:text-orange-300`}
          onClick={handleEdit}
          title={isUsingAvgPrice ? 'Средняя цена в лирах (нажмите для редактирования)' : 'Фиксированная цена из себестоимости (нажмите для редактирования)'}
        >
          💰 {currentPriceTRY.toFixed(2)} ₺
        </div>
        <div className="text-xs text-gray-400">
          {isUsingAvgPrice ? 'средняя' : 'фиксир.'}
        </div>
      </div>
      <button
        onClick={handleEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600 ml-1"
        title="Редактировать цену в лирах"
      >
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </button>
    </div>
  );
} 