import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';
import { addToast } from '../store/toastSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const status = result.error.status;
    const errorData = result.error.data as { error?: { message?: string; code?: string } } | undefined;
    const message = errorData?.error?.message || 'A network error occurred';

    if (status === 401) {
      // Automatic logout on unauthorized
      api.dispatch(logout());
      api.dispatch(addToast({ type: 'error', message: 'Session expired. Please log in again.' }));
    } else if (status === 403) {
      api.dispatch(addToast({ type: 'error', message: message || 'Forbidden: Insufficient permissions.' }));
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Product', 'MyProduct', 'Category', 'Vendor', 'Order', 'VendorOrder', 'Dashboard'],
  endpoints: () => ({})
});
