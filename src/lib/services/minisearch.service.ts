import MiniSearch from 'minisearch';

// Интерфейс для продукта в поиске
export interface SearchProduct {
  id: number;
  title: string;
  description?: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  is_in_stock: boolean;
  image_url?: string;
  category_name?: string;
  category_id?: number;
  brand?: string;
  tags?: string[];
}

// Конфигурация MiniSearch
const searchOptions = {
  fields: ['title', 'description', 'category_name', 'brand', 'tags'], // поля для поиска
  storeFields: ['title', 'description', 'price', 'old_price', 'stock_quantity', 'is_in_stock', 'image_url', 'category_name', 'category_id'], // поля для возврата
  searchOptions: {
    boost: { title: 2, brand: 1.5 }, // бустинг для более важных полей
    fuzzy: 0.2, // нечеткий поиск
    prefix: true, // поиск по префиксу
  }
};

// Сервис поиска с MiniSearch
export class MiniSearchService {
  private static instance: MiniSearch<SearchProduct>;
  private static products: SearchProduct[] = [];

  // Инициализация поискового индекса
  static initialize(products: SearchProduct[] = []) {
    this.instance = new MiniSearch(searchOptions);
    this.products = products;
    
    if (products.length > 0) {
      this.instance.addAll(products);
      console.log(`🔍 MiniSearch initialized with ${products.length} products`);
    }
  }

  // Получение инстанса (ленивая инициализация)
  static getInstance(): MiniSearch<SearchProduct> {
    if (!this.instance) {
      this.initialize();
    }
    return this.instance;
  }

  // Обновление индекса с новыми продуктами
  static updateIndex(products: SearchProduct[]) {
    this.products = products;
    this.instance = new MiniSearch(searchOptions);
    this.instance.addAll(products);
    console.log(`🔄 MiniSearch index updated with ${products.length} products`);
  }

  // Добавление одного продукта
  static addProduct(product: SearchProduct) {
    const instance = this.getInstance();
    instance.add(product);
    this.products.push(product);
    console.log(`➕ Product added to search index: ${product.title}`);
  }

  // Обновление продукта
  static updateProduct(product: SearchProduct) {
    const instance = this.getInstance();
    instance.discard(product.id);
    instance.add(product);
    
    // Обновляем в локальном массиве
    const index = this.products.findIndex(p => p.id === product.id);
    if (index !== -1) {
      this.products[index] = product;
    }
    console.log(`🔄 Product updated in search index: ${product.title}`);
  }

  // Удаление продукта
  static removeProduct(productId: number) {
    const instance = this.getInstance();
    instance.discard(productId);
    this.products = this.products.filter(p => p.id !== productId);
    console.log(`🗑️ Product removed from search index: ${productId}`);
  }

  // Поиск продуктов
  static search(query: string, options: {
    limit?: number;
    categoryId?: number;
    inStockOnly?: boolean;
    minPrice?: number;
    maxPrice?: number;
  } = {}): SearchProduct[] {
    if (!query.trim()) {
      return this.getFilteredProducts(options);
    }

    const instance = this.getInstance();
    const {
      limit = 20,
      categoryId,
      inStockOnly = false,
      minPrice,
      maxPrice
    } = options;

    try {
      // Выполняем поиск
      const results = instance.search(query, {
        ...searchOptions.searchOptions
      });

      // Получаем полные данные продуктов
      let products = results.map(result => {
        const product = this.products.find(p => p.id === result.id);
        return product ? { ...product, score: result.score } : null;
      }).filter(Boolean) as (SearchProduct & { score: number })[];

      // Берем больше результатов для фильтрации
      products = products.slice(0, limit * 2);

      // Применяем фильтры
      const filteredProducts = this.applyFilters(products, {
        categoryId,
        inStockOnly,
        minPrice,
        maxPrice
      });

      // Ограничиваем результат
      return filteredProducts.slice(0, limit);

    } catch (error) {
      console.error('❌ MiniSearch search failed:', error);
      return this.getFilteredProducts(options);
    }
  }

  // Получение отфильтрованных продуктов без поиска
  private static getFilteredProducts(options: {
    limit?: number;
    categoryId?: number;
    inStockOnly?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }): SearchProduct[] {
    const { limit = 20 } = options;
    
    let products = [...this.products];
    products = this.applyFilters(products, options);
    
    return products.slice(0, limit);
  }

  // Применение фильтров
  private static applyFilters(
    products: SearchProduct[],
    filters: {
      categoryId?: number;
      inStockOnly?: boolean;
      minPrice?: number;
      maxPrice?: number;
    }
  ): SearchProduct[] {
    const { categoryId, inStockOnly, minPrice, maxPrice } = filters;

    return products.filter(product => {
      // Фильтр по категории
      if (categoryId && product.category_id !== categoryId) {
        return false;
      }

      // Фильтр по наличию
      if (inStockOnly && !product.is_in_stock) {
        return false;
      }

      // Фильтр по цене
      if (minPrice && product.price < minPrice) {
        return false;
      }

      if (maxPrice && product.price > maxPrice) {
        return false;
      }

      return true;
    });
  }

  // Получение предложений для автодополнения
  static getSuggestions(query: string, limit: number = 5): string[] {
    if (!query.trim()) return [];

    const instance = this.getInstance();
    
    try {
      const results = instance.search(query, {
        prefix: true,
        fuzzy: 0.1
      });

      // Извлекаем уникальные предложения из названий
      const suggestions = new Set<string>();
      
      results.forEach(result => {
        const product = this.products.find(p => p.id === result.id);
        if (product) {
          // Добавляем полное название
          suggestions.add(product.title);
          
          // Добавляем слова из названия
          const words = product.title.toLowerCase().split(/\s+/);
          words.forEach(word => {
            if (word.length > 2 && word.startsWith(query.toLowerCase())) {
              suggestions.add(word);
            }
          });
        }
      });

      return Array.from(suggestions).slice(0, limit);
    } catch (error) {
      console.error('❌ MiniSearch suggestions failed:', error);
      return [];
    }
  }

  // Получение статистики поиска
  static getStats() {
    return {
      totalProducts: this.products.length,
      indexSize: this.instance ? this.instance.documentCount : 0,
      isInitialized: !!this.instance
    };
  }
}

// Утилитарные функции для конвертации данных
export const convertProductToSearchFormat = (product: any): SearchProduct => {
  return {
    id: product.id,
    title: product.title || product.name || '',
    description: product.description || '',
    price: Number(product.price) || 0,
    old_price: product.old_price ? Number(product.old_price) : undefined,
    stock_quantity: Number(product.stock_quantity) || 0,
    is_in_stock: Boolean(product.is_in_stock),
    image_url: product.image_url || undefined,
    category_name: product.category?.name || product.category_name || undefined,
    category_id: product.category_id || product.category?.id || undefined,
    brand: product.brand || undefined,
    tags: product.tags || []
  };
};

export default MiniSearchService; 