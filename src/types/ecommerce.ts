// Основные типы для ecommerce компонентов

export interface Product {
  id: number;
  product_id: number;
  title: string;
  price: number;
  old_price?: number;
  stock_quantity: number;
  is_in_stock: boolean;
  image_url: string;
  created_at: string;
  description?: string;
  category_id?: number;
  brand?: string;
  rating?: number;
  reviews_count?: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  total_amount: number;
  items_count: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  products_count?: number;
}

export interface ProductGridProps {
  products: Product[];
  title?: string;
  onAddToCart?: (productId: number) => void;
  loading?: boolean;
}

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: number) => void;
  loading?: boolean;
  showQuickView?: boolean;
}

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  icon?: React.ComponentType<any>;
}

// Утилиты для работы с ценами
export const formatPrice = (price: number): string => {
  return `${price.toLocaleString('ru-RU')}₽`;
};

export const calculateDiscount = (price: number, oldPrice: number): number => {
  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

// Утилиты для работы с корзиной
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const getCartItemsCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
}; 