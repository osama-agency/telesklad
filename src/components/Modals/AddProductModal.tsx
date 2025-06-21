import React, { useState, useRef } from 'react';
import { X, Upload, Package, Eye, EyeOff, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCategories } from '@/hooks/useCategories';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

interface ProductData {
  name: string;
  description: string;
  price: number | null;
  old_price: number | null;
  stock_quantity: number;
  weight: string;
  dosage_form: string;
  package_quantity: number | null;
  main_ingredient: string;
  brand: string;
  ancestry: string;
  is_visible: boolean;
  show_in_webapp: boolean;
  image_url?: string;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onProductAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Состояние для добавления новой категории
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Загружаем категории
  const { categories, isLoading: categoriesLoading } = useCategories();

  const [formData, setFormData] = useState<ProductData>({
    name: '',
    description: '',
    price: null,
    old_price: null,
    stock_quantity: 0,
    weight: '',
    dosage_form: '',
    package_quantity: null,
    main_ingredient: '',
    brand: '',
    ancestry: '',
    is_visible: true,
    show_in_webapp: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: ['price', 'old_price', 'stock_quantity', 'package_quantity'].includes(name) 
          ? (value === '' ? null : Number(value))
          : value
      }));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Создаем превью
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToS3 = async (file: File): Promise<string> => {
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      return result.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setIsUploadingImage(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Название товара обязательно');
      return;
    }
    
    if (!formData.brand.trim()) {
      toast.error('Производитель обязателен');
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = '';
      
      // Создаем ancestry для товара (для теста используем категорию Лекарства)
      const productData = {
        ...formData,
        ancestry: formData.ancestry || '1/2', // По умолчанию категория
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Ошибка при создании товара');
      }

      const result = await response.json();

      // Загружаем изображение после создания товара, если оно выбрано
      if (imageFile && result.product?.id) {
        try {
          const formData = new FormData();
          formData.append('file', imageFile);

          const uploadResponse = await fetch('/api/upload/image', {
            method: 'POST',
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            
            // Привязываем изображение к товару
            await fetch(`/api/products/${result.product.id}/attach-image`, {
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

            toast.success('Изображение успешно загружено!', {
              icon: '📸',
              style: {
                borderRadius: '8px',
                background: '#1A6DFF',
                color: '#fff',
                fontSize: '14px',
              },
            });
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Товар создан, но ошибка при загрузке изображения');
        }
      }

      toast.success('Товар успешно создан!', {
        icon: '✅',
        style: {
          borderRadius: '8px',
          background: '#1A6DFF',
          color: '#fff',
          fontSize: '14px',
        },
      });

      // Сбрасываем форму
      setFormData({
        name: '',
        description: '',
        price: null,
        old_price: null,
        stock_quantity: 0,
        weight: '',
        dosage_form: '',
        package_quantity: null,
        main_ingredient: '',
        brand: '',
        ancestry: '',
        is_visible: true,
        show_in_webapp: true,
      });
      setImageFile(null);
      setImagePreview(null);
      setShowNewCategoryInput(false);
      setNewCategoryName('');

      onProductAdded();
      onClose();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Ошибка при создании товара');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#1E293B] dark:text-white">
              Добавить товар
            </h2>
          </div>
          <button
            onClick={() => {
              setShowNewCategoryInput(false);
              setNewCategoryName('');
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Название товара *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Введите название товара"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-[#F8FAFC] dark:bg-gray-900 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Производитель *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="Введите производителя"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-[#F8FAFC] dark:bg-gray-900 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                required
              />
            </div>
          </div>

          {/* Описание */}
          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
              Описание
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Введите описание товара"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-[#F8FAFC] dark:bg-gray-900 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
            />
          </div>

          {/* Цены и остаток */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Цена (₽)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price || ''}
                onChange={handleInputChange}
                placeholder="0"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-[#F8FAFC] dark:bg-gray-900 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Старая цена (₽)
              </label>
              <input
                type="number"
                name="old_price"
                value={formData.old_price || ''}
                onChange={handleInputChange}
                placeholder="0"
                step="0.01"
                min="0"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-[#F8FAFC] dark:bg-gray-900 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Остаток на складе
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-[#F8FAFC] dark:bg-gray-900 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
              />
            </div>
          </div>

          {/* Дополнительные характеристики */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Вес
              </label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="Например: 500г"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-[#F8FAFC] dark:bg-gray-900 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Количество в упаковке
              </label>
              <input
                type="number"
                name="package_quantity"
                value={formData.package_quantity || ''}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-[#F8FAFC] dark:bg-gray-900 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Форма выпуска
              </label>
              <input
                type="text"
                name="dosage_form"
                value={formData.dosage_form}
                onChange={handleInputChange}
                placeholder="Например: таблетки"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-[#F8FAFC] dark:bg-gray-900 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
                Основной компонент
              </label>
              <input
                type="text"
                name="main_ingredient"
                value={formData.main_ingredient}
                onChange={handleInputChange}
                placeholder="Введите основной компонент"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-[#F8FAFC] dark:bg-gray-900 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
              />
            </div>
          </div>

          {/* Категория */}
          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
              Категория
            </label>
            <div className="space-y-3">
              <select
                name="ancestry"
                value={formData.ancestry}
                onChange={handleInputChange}
                disabled={categoriesLoading}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-[#F8FAFC] dark:bg-gray-900 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all disabled:opacity-50"
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
                    className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-[#F8FAFC] dark:bg-gray-900 text-[#1E293B] dark:text-white focus:border-[#1A6DFF] focus:outline-none focus:ring-2 focus:ring-[#1A6DFF]/20 transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNewCategory()}
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="px-4 py-3 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white rounded-lg hover:scale-105 transition-all"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setNewCategoryName('');
                    }}
                    className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {categoriesLoading && (
                <div className="text-sm text-[#64748B] dark:text-gray-400 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#1A6DFF] border-t-transparent rounded-full animate-spin"></div>
                  Загрузка категорий...
                </div>
              )}
            </div>
          </div>

          {/* Загрузка изображения */}
          <div>
            <label className="block text-sm font-medium text-[#374151] dark:text-gray-300 mb-2">
              Картинка товара
            </label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isUploadingImage}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-[#F8FAFC] dark:bg-gray-900 text-[#374151] dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingImage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#1A6DFF] border-t-transparent rounded-full animate-spin"></div>
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Выберите файл
                  </>
                )}
              </button>
              {imagePreview && (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    disabled={isUploadingImage}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-[#64748B] dark:text-gray-400">
              Поддерживаются форматы: JPEG, PNG, WebP. Максимальный размер: 5MB
            </div>
          </div>

          {/* Настройки видимости */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-[#374151] dark:text-gray-300">Настройки показа</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_visible"
                  name="is_visible"
                  checked={formData.is_visible}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#1A6DFF] bg-gray-100 border-gray-300 rounded focus:ring-[#1A6DFF] dark:focus:ring-[#1A6DFF] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="is_visible" className="text-sm text-[#64748B] dark:text-gray-400 flex items-center gap-2">
                  {formData.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span className="font-medium">Товар в каталоге админки</span>
                </label>
              </div>
              <div className="text-xs text-[#64748B] dark:text-gray-400 ml-7">
                Показывать товар в общем каталоге администратора
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="show_in_webapp"
                  name="show_in_webapp"
                  checked={formData.show_in_webapp}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#1A6DFF] bg-gray-100 border-gray-300 rounded focus:ring-[#1A6DFF] dark:focus:ring-[#1A6DFF] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="show_in_webapp" className="text-sm text-[#64748B] dark:text-gray-400 flex items-center gap-2">
                  <span className="text-lg">📱</span>
                  <span className="font-medium">Товар в WebApp</span>
                </label>
              </div>
              <div className="text-xs text-[#64748B] dark:text-gray-400 ml-7">
                Показывать товар на сайте для клиентов (webapp)
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                setShowNewCategoryInput(false);
                setNewCategoryName('');
                onClose();
              }}
              className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-lg text-[#64748B] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-[#1A6DFF] to-[#00C5FF] text-white rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Создание...' : 'Создать товар'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal; 