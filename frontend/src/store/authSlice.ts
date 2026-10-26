import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
}

interface AuthState {
  token: string | null;
  user: User | null;
}

const initialToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
const initialUserJson = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
let initialUser: User | null = null;
try {
  initialUser = initialUserJson ? JSON.parse(initialUserJson) : null;
} catch (e) {
  initialUser = null;
}

const initialState: AuthState = {
  token: initialToken,
  user: initialUser
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
