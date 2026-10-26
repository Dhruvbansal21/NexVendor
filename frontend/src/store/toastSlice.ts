import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
}

const initialState: ToastState = {
  toasts: []
};

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<{ type: ToastItem['type']; message: string }>) => {
      const id = Date.now().toString() + Math.random().toString().slice(2, 6);
      state.toasts.push({
        id,
        type: action.payload.type,
        message: action.payload.message
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    }
  }
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
