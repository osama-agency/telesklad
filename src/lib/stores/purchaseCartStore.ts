import { create } from 'zustand';
import { Product } from '@/hooks/useProducts';

export interface PurchaseCartItem extends Product {
  purchaseQuantity: number;
}

interface PurchaseCartState {
  items: PurchaseCartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: number) => void;
  updateItemQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
}

const usePurchaseCartStore = create<PurchaseCartState>((set, get) => ({
  items: [],
  totalItems: 0,

  addItem: (product, quantity) => {
    set(state => {
      const existingItem = state.items.find((item) => item.id === product.id);
      let newItems;
      
      if (existingItem) {
        newItems = state.items.map((item) =>
          item.id === product.id
            ? { ...item, purchaseQuantity: item.purchaseQuantity + quantity }
            : item
        );
      } else {
        const newItem: PurchaseCartItem = { ...product, purchaseQuantity: quantity };
        newItems = [...state.items, newItem];
      }
      
      const newTotalItems = newItems.reduce((total, item) => total + item.purchaseQuantity, 0);
      return { items: newItems, totalItems: newTotalItems };
    });
  },

  removeItem: (productId) => {
    set(state => {
      const newItems = state.items.filter((item) => item.id !== productId);
      const newTotalItems = newItems.reduce((total, item) => total + item.purchaseQuantity, 0);
      return { items: newItems, totalItems: newTotalItems };
    });
  },

  updateItemQuantity: (productId, quantity) => {
    set(state => {
      let newItems;
      if (quantity <= 0) {
        newItems = state.items.filter((item) => item.id !== productId);
      } else {
        newItems = state.items.map((item) =>
          item.id === productId ? { ...item, purchaseQuantity: quantity } : item
        );
      }
      const newTotalItems = newItems.reduce((total, item) => total + item.purchaseQuantity, 0);
      return { items: newItems, totalItems: newTotalItems };
    });
  },

  clearCart: () => {
    set({ items: [], totalItems: 0 });
  },
}));

export default usePurchaseCartStore;
