import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  productId: string;
  title: string;
  unitPrice: number; // paise
  storeName: string;
  imageUrl: string;
  stock: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
}

const initialCartJson = typeof window !== 'undefined' ? localStorage.getItem('cart') : null;
let initialItems: CartItem[] = [];
try {
  initialItems = initialCartJson ? JSON.parse(initialCartJson) : [];
} catch (e) {
  initialItems = [];
}

const initialState: CartState = {
  items: initialItems
};

function saveCart(items: CartItem[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(items));
  }
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'qty'> & { qty?: number }>) => {
      const { productId, qty = 1 } = action.payload;
      const existing = state.items.find(i => i.productId === productId);
      if (existing) {
        existing.qty = Math.min(existing.stock, existing.qty + qty);
      } else {
        state.items.push({
          ...action.payload,
          qty: Math.min(action.payload.stock, qty)
        });
      }
      saveCart(state.items);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i.productId !== action.payload);
      saveCart(state.items);
    },
    updateQty: (state, action: PayloadAction<{ productId: string; qty: number }>) => {
      const item = state.items.find(i => i.productId === action.payload.productId);
      if (item) {
        if (action.payload.qty <= 0) {
          state.items = state.items.filter(i => i.productId !== action.payload.productId);
        } else {
          item.qty = Math.min(item.stock, action.payload.qty);
        }
      }
      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCart(state.items);
    }
  }
});

export const { addToCart, removeFromCart, updateQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
