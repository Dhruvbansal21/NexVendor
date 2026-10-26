import { baseApi } from './baseApi';
import type { User } from '../store/authSlice';

export interface AuthResponse {
  data: {
    token: string;
    user: User;
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, { name: string; email: string; password: string; role: 'customer' | 'vendor' }>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials
      })
    }),
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials
      })
    }),
    getMe: builder.query<{ data: User }, void>({
      query: () => '/auth/me'
    })
  })
});

export const { useRegisterMutation, useLoginMutation, useGetMeQuery } = authApi;
