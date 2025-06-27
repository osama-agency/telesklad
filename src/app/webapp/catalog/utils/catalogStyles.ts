import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const catalogStyles = {
  // Container styles
  container: 'webapp-container catalog-page pt-[max(env(safe-area-inset-top),0)] pb-[calc(60px+env(safe-area-inset-bottom))]',
  
  // Content wrapper
  contentWrapper: 'px-4',
  
  // Grid styles
  grid: {
    base: 'product-grid grid grid-cols-2 gap-2 mt-0 pt-0 px-2',
    skeleton: 'product-grid-skeleton grid grid-cols-2 gap-2 p-0',
  },
  
  // Card styles
  card: {
    base: 'product-wrapper bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 p-2',
    image: 'relative h-[140px] bg-white overflow-hidden',
    content: 'mt-2',
    title: 'font-normal text-gray-800 line-clamp-2 text-sm mb-2',
    price: 'text-base font-semibold text-gray-900',
    oldPrice: 'text-sm text-gray-400 line-through',
    button: 'bg-[#48C928] hover:bg-[#3AA120] text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium w-full mt-2 active:translate-y-0 hover:-translate-y-0.5',
  },
  
  // Category navigation
  categoryNav: {
    wrapper: 'category-navigation-wrapper mt-2 mb-3 px-2',
    list: 'catalog-nav flex gap-1.5 pt-0 pb-0 overflow-x-auto whitespace-nowrap',
    button: 'min-h-[34px] px-3.5 py-1.5 text-[13px] rounded-[14px] border-0 bg-gray-100 hover:bg-gray-200 transition-colors',
    activeButton: 'bg-[#48C928] text-white hover:bg-[#3AA120]',
  },
  
  // Empty state styles
  emptyState: {
    wrapper: 'no-items-wrapper flex items-center justify-center min-h-[40vh] p-5',
    content: 'no-items-content text-center',
    icon: 'no-items-icon text-5xl text-[#e0e0e0] mb-3 opacity-80',
    title: 'no-items-title text-base font-semibold text-[#6B7280] mb-1.5',
    subtitle: 'no-items-subtitle text-sm text-[#9CA3AF] leading-relaxed',
  },
  
  // Error state styles
  errorState: {
    wrapper: 'catalog-error-state text-center py-[30px] px-5',
    icon: 'error-icon text-[40px] text-[#ef4444] mb-3 opacity-80',
    message: 'error-message text-[15px] text-[#6B7280] mb-4',
    button: 'retry-button bg-[#48C928] text-white border-0 rounded-xl px-6 py-2.5 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-[#3AA120] hover:-translate-y-px active:translate-y-0',
  },
  
  // Skeleton styles
  skeleton: {
    card: 'product-skeleton',
    wrapper: 'product-wrapper p-2.5',
    image: 'product-img-skeleton h-[140px] mb-2 bg-shimmer-gradient bg-[length:200%_100%] animate-shimmer rounded',
    text: 'h-4 bg-[#f0f0f0] rounded mb-2',
    price: 'h-5 w-20 bg-[#f0f0f0] rounded',
  },
  
  // Search styles
  search: {
    wrapper: 'header-search-wrapper px-3 py-2',
    field: 'search-field min-h-[36px] px-2.5 py-1 text-sm',
  },
  
  // Pull to refresh styles
  pullRefresh: {
    indicator: 'catalog-pull-refresh absolute -top-[50px] left-1/2 -translate-x-1/2 w-10 h-10 bg-[#48C928] rounded-full flex items-center justify-center transition-all duration-300 opacity-0',
    pulling: 'pulling opacity-100 top-2.5',
    spinner: 'spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin',
  },
};

// Медиа-запросы для маленьких экранов
export const smallScreenStyles = {
  categoryNav: {
    wrapper: 'mt-1 !mb-2',
    button: 'min-h-[30px] px-3 py-1 text-xs',
  },
  grid: {
    base: 'gap-1.5',
  },
  emptyState: {
    wrapper: 'min-h-[30vh] p-4',
  },
};