"use client";

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useCategories } from '@/hooks/useCategories';
import { Plus } from 'lucide-react';
// Заменяем lucide-react иконки на простые SVG
const X = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Upload = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const Trash2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const Save = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const AlertTriangle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

interface Product {
  id: number;
  name: string | null;
  description: string | null;
  price: number | null;
  stock_quantity: number;
  ancestry: string | null;
  weight: string | null;
  dosage_form: string | null;
  package_quantity: number | null;
  main_ingredient: string | null;
  brand: string | null;
  old_price: number | null;
  prime_cost: number | null;
  is_visible: boolean | null;
  show_in_webapp?: boolean | null;
  avgpurchasepricerub: number | null;
  avgpurchasepricetry: number | null;
  quantity_in_transit: number | null;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSave: (updatedProduct: Product) => void;
  onDelete?: (productId: number) => void;
}



// Формы выпуска
const DOSAGE_FORMS = [
  'Таблетки',
  'Капсулы',
  'Сироп',
  'Капли',
  'Порошок',
  'Раствор',
  'Мазь',
  'Крем',
  'Спрей',
  'Другое'
];

export function EditProductModal({ isOpen, onClose, product, onSave, onDelete }: EditProductModalProps) {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Состояния для управления категориями
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Загружаем категории
  const { categories, isLoading: categoriesLoading } = useCategories();

  // Функция загрузки изображения товара
  const uploadProductImage = async (productId: number, file: File) => {
    try {
      // Загружаем изображение через общий API
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Ошибка при загрузке файла');
      }

      const uploadResult = await uploadResponse.json();
      
      // Создаем запись в базе данных для связи изображения с товаром
      const attachResponse = await fetch(`/api/products/${productId}/attach-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: uploadResult.imageUrl,
          fileName: uploadResult.fileName,
          fileSize: uploadResult.optimizedSize,
          contentType: 'image/jpeg'
        }),
      });

      if (!attachResponse.ok) {
        throw new Error('Ошибка при привязке изображения к товару');
      }

      toast.success('Изображение успешно загружено');
      return uploadResult.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка при загрузке изображения');
      throw error;
    }
  };

  useEffect(() => {
    if (product && isOpen) {
      console.log('EditProductModal: Received product data:', product);
      setIsDataLoading(true);
      
      // Небольшая задержка чтобы показать индикатор загрузки
      setTimeout(async () => {
        setFormData({
          ...product,
          price: product.price || 0,
          old_price: product.old_price || 0,
          prime_cost: product.prime_cost || 0,
          stock_quantity: product.stock_quantity || 0,
          package_quantity: product.package_quantity || 0,
          quantity_in_transit: product.quantity_in_transit || 0,
          is_visible: product.is_visible ?? true,
          show_in_webapp: product.show_in_webapp ?? true,
        });
        
        console.log('EditProductModal: FormData set to:', {
          ...product,
          price: product.price || 0,
          old_price: product.old_price || 0,
          prime_cost: product.prime_cost || 0,
          stock_quantity: product.stock_quantity || 0,
          package_quantity: product.package_quantity || 0,
          quantity_in_transit: product.quantity_in_transit || 0,
          is_visible: product.is_visible ?? true,
          show_in_webapp: product.show_in_webapp ?? true,
        });
        
        // Загружаем существующее изображение товара
        try {
          const response = await fetch(`/api/products/${product.id}/image`);
          if (response.ok) {
            const imageData = await response.json();
            if (imageData.imageUrl) {
              setImagePreview(imageData.imageUrl);
            }
          }
        } catch (error) {
          console.log('No existing image found for product:', product.id);
        }
        
        setImageFile(null);
        setIsDataLoading(false);
      }, 100);
    } else if (!isOpen) {
      // Сбрасываем состояния при закрытии модального окна
      setShowNewCategoryInput(false);
      setNewCategoryName('');
      setImageFile(null);
      setImagePreview(null);
      setShowDeleteConfirm(false);
    }
  }, [product, isOpen]);

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        toast.error('Можно загружать только изображения');
        return;
      }

      // Проверка размера файла (максимум 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 2MB');
        return;
      }

      setImageFile(file);
      
      // Создаем превью
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product) return;

    setIsLoading(true);

    try {
      // Подготавливаем данные для отправки
      const updateData = {
        ...formData,
        price: formData.price ? Number(formData.price) : null,
        old_price: formData.old_price ? Number(formData.old_price) : null,
        prime_cost: formData.prime_cost ? Number(formData.prime_cost) : null,
        stock_quantity: Number(formData.stock_quantity) || 0,
        package_quantity: formData.package_quantity ? Number(formData.package_quantity) : null,
        quantity_in_transit: Number(formData.quantity_in_transit) || 0,
      };

      // Обновляем товар
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...updateData, id: product.id }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении товара');
      }

      const updatedProduct = await response.json();

      // Загружаем изображение если есть
      if (imageFile) {
        await uploadProductImage(product.id, imageFile);
      }

      toast.success('Товар успешно обновлен');
      onSave(updatedProduct);
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Ошибка при обновлении товара');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !onDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении товара');
      }

      toast.success('Товар успешно удален');
      onDelete(product.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Ошибка при удалении товара');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddNewCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Введите название категории');
      return;
    }
    
    // Генерируем новый ID категории (безопасная логика)
    const existingIds = categories.map(cat => parseInt(cat.id)).filter(id => !isNaN(id));
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 36;
    const newId = maxId + 1;
    const newAncestry = `23/${newId}`; // Используем 23 как родительскую категорию
    
    // Проверяем, что такой категории еще нет
    const existingCategory = categories.find(cat => cat.value === newAncestry);
    if (existingCategory) {
      toast.error('Категория с таким ID уже существует');
      return;
    }
    
    // Добавляем новую категорию в форму
    setFormData(prev => ({
      ...prev,
      ancestry: newAncestry
    }));
    
    // Скрываем поле ввода
    setShowNewCategoryInput(false);
    setNewCategoryName('');
    
    toast.success(`Категория "${newCategoryName}" будет создана с ID ${newId}`, {
      icon: '📁',
      style: {
        borderRadius: '8px',
        background: '#1A6DFF',
        color: '#fff',
        fontSize: '14px',
      },
    });
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 m-4">
        {/* Заголовок */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-xl">
          <h2 className="text-2xl font-bold text-[#1E293B] dark:text-white">
            Редактировать товар
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {isDataLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A6DFF]"></div>
              <span className="ml-3 text-[#1E293B] dark:text-white">Загрузка данных товара...</span>
            </div>
          ) : (
            <>
              {/* Основная информация */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Левая колонка */}
                <div className="space-y-4">
                  {/* Название товара */}
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-2">
                      Название товара *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#1E293B] dark:text-white placeholder-gray-500 focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                      placeholder="Введите название товара"
                      required
                    />
                  </div>

                  {/* Бренд */}
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-2">
                      Бренд
                    </label>
                    <input
                      type="text"
                      value={formData.brand || ''}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#1E293B] dark:text-white placeholder-gray-500 focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                      placeholder="Введите бренд"
                    />
                  </div>

                  {/* Категория */}
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-2">
                      Категория
                    </label>
                    <div className="space-y-3">
                      <select
                        value={formData.ancestry || ''}
                        onChange={(e) => handleInputChange('ancestry', e.target.value)}
                        disabled={categoriesLoading}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all disabled:opacity-50"
                      >
                        <option value="">Без категории</option>
                        {categories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                      
                      {/* Кнопка добавления новой категории */}
                      {!showNewCategoryInput && (
                        <button
                          type="button"
                          onClick={() => setShowNewCategoryInput(true)}
                          className="w-full px-4 py-3 border border-dashed border-[#1A6DFF] rounded-lg text-[#1A6DFF] hover:bg-[#1A6DFF]/5 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Добавить новую категорию
                        </button>
                      )}
                      
                      {/* Поле ввода новой категории */}
                      {showNewCategoryInput && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Название новой категории"
                            className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#1E293B] dark:text-white placeholder-gray-500 focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddNewCategory();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddNewCategory}
                            className="px-4 py-3 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white rounded-lg hover:scale-105 transition-all duration-300"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewCategoryInput(false);
                              setNewCategoryName('');
                            }}
                            className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Форма выпуска */}
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-2">
                      Форма выпуска
                    </label>
                    <select
                      value={formData.dosage_form || ''}
                      onChange={(e) => handleInputChange('dosage_form', e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                    >
                      <option value="">Выберите форму выпуска</option>
                      {DOSAGE_FORMS.map(form => (
                        <option key={form} value={form}>{form}</option>
                      ))}
                    </select>
                  </div>

                  {/* Основной компонент */}
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-2">
                      Основной компонент
                    </label>
                    <input
                      type="text"
                      value={formData.main_ingredient || ''}
                      onChange={(e) => handleInputChange('main_ingredient', e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#1E293B] dark:text-white placeholder-gray-500 focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                      placeholder="Введите основной компонент"
                    />
                  </div>

                  {/* Вес */}
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-2">
                      Вес/Объем
                    </label>
                    <input
                      type="text"
                      value={formData.weight || ''}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#1E293B] dark:text-white placeholder-gray-500 focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                      placeholder="Например: 10 мг, 100 мл"
                    />
                  </div>
                </div>

                {/* Правая колонка */}
                <div className="space-y-4">
                  {/* Цены */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-2">
                        Цена продажи (₽) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price || ''}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#1E293B] dark:text-white placeholder-gray-500 focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-2">
                        Старая цена (₽)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.old_price || ''}
                        onChange={(e) => handleInputChange('old_price', e.target.value)}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#1E293B] dark:text-white placeholder-gray-500 focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Себестоимость */}
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-2">
                      Себестоимость (₺)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.prime_cost || ''}
                      onChange={(e) => handleInputChange('prime_cost', e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#1E293B] dark:text-white placeholder-gray-500 focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Количество */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-2">
                        Остаток на складе
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stock_quantity || 0}
                        onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#1E293B] dark:text-white placeholder-gray-500 focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-2">
                        В пути
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.quantity_in_transit || 0}
                        onChange={(e) => handleInputChange('quantity_in_transit', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#1E293B] dark:text-white placeholder-gray-500 focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Количество в упаковке */}
                  <div>
                    <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-2">
                      Количество в упаковке
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.package_quantity || ''}
                      onChange={(e) => handleInputChange('package_quantity', parseInt(e.target.value) || null)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#1E293B] dark:text-white placeholder-gray-500 focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                      placeholder="Например: 30 таблеток"
                    />
                  </div>

                  {/* Настройки видимости */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                    <h3 className="font-medium text-[#374151] dark:text-gray-300">Настройки показа</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="edit_is_visible"
                          checked={formData.is_visible ?? true}
                          onChange={(e) => handleInputChange('is_visible', e.target.checked)}
                          className="w-4 h-4 text-[#1A6DFF] bg-gray-100 border-gray-300 rounded focus:ring-[#1A6DFF] dark:focus:ring-[#1A6DFF] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="edit_is_visible" className="text-sm text-[#64748B] dark:text-gray-400 flex items-center gap-2">
                          <span className="text-lg">👁️</span>
                          <span className="font-medium">Товар в каталоге админки</span>
                        </label>
                      </div>
                      <div className="text-xs text-[#64748B] dark:text-gray-400 ml-7">
                        Показывать товар в общем каталоге администратора
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="edit_show_in_webapp"
                          checked={formData.show_in_webapp ?? true}
                          onChange={(e) => handleInputChange('show_in_webapp', e.target.checked)}
                          className="w-4 h-4 text-[#1A6DFF] bg-gray-100 border-gray-300 rounded focus:ring-[#1A6DFF] dark:focus:ring-[#1A6DFF] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="edit_show_in_webapp" className="text-sm text-[#64748B] dark:text-gray-400 flex items-center gap-2">
                          <span className="text-lg">📱</span>
                          <span className="font-medium">Товар в WebApp</span>
                        </label>
                      </div>
                      <div className="text-xs text-[#64748B] dark:text-gray-400 ml-7">
                        Показывать товар на сайте для клиентов (webapp)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Описание */}
              <div>
                <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-2">
                  Описание товара
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-[#1E293B] dark:text-white placeholder-gray-500 focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all resize-none"
                  placeholder="Введите подробное описание товара..."
                />
              </div>

              {/* Загрузка изображения */}
              <div>
                <label className="block text-sm font-medium text-[#1E293B] dark:text-white mb-2">
                  Фото товара
                </label>
                
                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#1A6DFF] hover:bg-[#1A6DFF]/5 transition-all"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Нажмите для загрузки изображения
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG до 2MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              {/* Кнопки действий */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <div>
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isLoading || isDeleting}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Удалить товар</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 text-[#64748B] dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || isDeleting}
                    className="px-6 py-3 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Сохранение...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Сохранить изменения</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>

      {/* Модальное окно подтверждения удаления */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1E293B] dark:text-white">
                  Подтвердите удаление
                </h3>
                <p className="text-[#64748B] dark:text-gray-400 mt-1">
                  Это действие нельзя отменить
                </p>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 dark:text-red-200">
                Вы действительно хотите удалить товар <strong>&ldquo;{product?.name}&rdquo;</strong>?
                <br />
                <span className="text-red-600 dark:text-red-300">
                  Все данные о товаре будут безвозвратно удалены.
                </span>
              </p>
            </div>

            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-[#64748B] dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Удаление...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Да, удалить</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 