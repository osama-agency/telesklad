import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const headerStyles = {
  // Main header
  header: 'webapp-header fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 transition-shadow',
  headerScrolled: 'shadow-sm',
  container: 'webapp-header-container flex items-center gap-3 px-4 py-3 max-w-7xl mx-auto',
  
  // Search
  search: 'webapp-header-search flex-1 max-w-xl',
  searchInput: 'w-full px-4 py-2.5 bg-gray-50 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-catalog-primary focus:bg-white transition-all',
  
  // Action buttons
  actions: 'webapp-header-actions flex items-center gap-1',
  actionButton: 'header-action-button relative p-2.5 rounded-full hover:bg-gray-100 transition-colors',
  actionButtonActive: 'active text-catalog-primary bg-gray-50',
  actionIcon: 'header-action-icon relative',
  
  // Badge
  badge: 'header-action-badge absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] bg-catalog-primary text-white text-[11px] font-medium rounded-full flex items-center justify-center px-1',
  
  // Cart button (floating)
  cartButton: 'fixed bottom-20 right-4 z-50 bg-catalog-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105',
  cartButtonContent: 'flex items-center gap-2 px-5 py-3',
  cartBadge: 'bg-white text-catalog-primary text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1',
};