import algoliasearch from 'algoliasearch/lite';

// Algolia клиент
const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'YOUR_APP_ID',
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || 'YOUR_SEARCH_KEY'
);

// Названия индексов
export const ALGOLIA_INDEXES = {
  PRODUCTS: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_PRODUCTS || 'nextadmin_products',
} as const;

// Экспорт клиента для использования в компонентах
export { searchClient };

// Интерфейс для продукта в Algolia
export interface AlgoliaProduct {
  objectID: string;
  id: number;
  name: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  image_url?: string;
  category_name?: string;
  category_id?: number;
  ancestry?: string;
  show_in_webapp: boolean;
  description?: string;
  is_in_stock: boolean;
}

// Утилита для синхронизации товаров с Algolia
export class AlgoliaService {
  private static index = searchClient.initIndex(ALGOLIA_INDEXES.PRODUCTS);

  // Синхронизация всех товаров (серверная версия для API)
  static async syncProductsFromDatabase(products: any[]) {
    try {
      console.log('🔄 Starting Algolia products sync from database...');
      
      // Преобразуем в формат Algolia
      const algoliaProducts: AlgoliaProduct[] = products.map((product: any) => ({
        objectID: product.id.toString(),
        id: product.id,
        name: product.name,
        price: Number(product.price),
        old_price: product.old_price ? Number(product.old_price) : undefined,
        stock_quantity: product.stock_quantity,
        image_url: product.image_url,
        category_name: undefined, // Категории пока нет в схеме
        category_id: undefined,
        ancestry: product.ancestry,
        show_in_webapp: product.show_in_webapp || false,
        description: product.description,
        is_in_stock: product.stock_quantity > 0,
      }));

      // Синхронизируем с Algolia
      const result = await (this.index as any).replaceAllObjects(algoliaProducts);
      console.log('✅ Algolia sync completed:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Algolia sync failed:', error);
      throw error;
    }
  }

  // Синхронизация всех товаров (клиентская версия для фронтенда)
  static async syncProducts() {
    try {
      console.log('🔄 Starting Algolia products sync...');
      
      // Для клиентской синхронизации используем внутренний API
      const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : process.env.NEXTAUTH_URL || 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/webapp/products`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      const products = data.products || [];

      // Преобразуем в формат Algolia
      const algoliaProducts: AlgoliaProduct[] = products.map((product: any) => ({
        objectID: product.id.toString(),
        id: product.id,
        name: product.name,
        price: Number(product.price),
        old_price: product.old_price ? Number(product.old_price) : undefined,
        stock_quantity: product.stock_quantity,
        image_url: product.image_url,
        category_name: product.category_name || undefined,
        category_id: product.category_id || undefined,
        ancestry: product.ancestry,
        show_in_webapp: true, // Только товары для WebApp
        description: product.description,
        is_in_stock: product.stock_quantity > 0,
      }));

      // Синхронизируем с Algolia
      const result = await (this.index as any).replaceAllObjects(algoliaProducts);
      console.log('✅ Algolia sync completed:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Algolia sync failed:', error);
      throw error;
    }
  }

  // Добавление/обновление одного товара
  static async saveProduct(product: any) {
    try {
      const algoliaProduct: AlgoliaProduct = {
        objectID: product.id.toString(),
        id: product.id,
        name: product.name,
        price: Number(product.price),
        old_price: product.old_price ? Number(product.old_price) : undefined,
        stock_quantity: product.stock_quantity,
        image_url: product.image_url,
        category_name: product.category_name || undefined,
        category_id: product.category_id || undefined,
        ancestry: product.ancestry,
        show_in_webapp: product.show_in_webapp || false,
        description: product.description,
        is_in_stock: product.stock_quantity > 0,
      };

      const result = await (this.index as any).saveObject(algoliaProduct);
      console.log('✅ Product saved to Algolia:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to save product to Algolia:', error);
      throw error;
    }
  }

  // Удаление товара
  static async deleteProduct(productId: number) {
    try {
      const result = await (this.index as any).deleteObject(productId.toString());
      console.log('✅ Product deleted from Algolia:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to delete product from Algolia:', error);
      throw error;
    }
  }

  // Поиск товаров (fallback для серверного поиска)
  static async searchProducts(query: string, options?: any) {
    try {
      const result = await this.index.search(query, {
        hitsPerPage: options?.limit || 20,
        filters: 'show_in_webapp:true AND is_in_stock:true',
        ...options,
      });
      
      return result.hits as AlgoliaProduct[];
    } catch (error) {
      console.error('❌ Algolia search failed:', error);
      throw error;
    }
  }
} 