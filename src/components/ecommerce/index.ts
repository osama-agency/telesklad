// Tailwind CSS Plus ecommerce components for NEXTADMIN
// Адаптированные компоненты для Telegram WebApp с зеленой цветовой схемой

export { default as ProductGrid } from './ProductGrid';
export { default as ProductCard } from './ProductCard'; 
export { default as EmptyCart } from './EmptyCart';

// Re-export types for convenience
export type {
  Product,
  ProductGridProps,
  ProductCardProps,
  EmptyStateProps,
  Cart,
  CartItem,
  Category
} from '@/types/ecommerce';

// Re-export utilities
export {
  formatPrice,
  calculateDiscount,
  calculateCartTotal,
  getCartItemsCount
} from '@/types/ecommerce'; 