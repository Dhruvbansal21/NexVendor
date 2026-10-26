import { baseApi } from './baseApi';

export interface Product {
  id: string;
  vendorId: string;
  storeName: string;
  vendorStatus: 'pending' | 'verified' | 'rejected';
  title: string;
  description: string;
  price: number; // paise
  category: string;
  stock: number;
  imageUrl: string;
  status: 'draft' | 'active';
  createdAt: string;
}

export interface ProductsResponse {
  data: Product[];
  page: number;
  limit: number;
  total: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export const catalogueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, { search?: string; category?: string; vendorId?: string; page?: number; limit?: number; sort?: string }>({
      query: (params) => ({
        url: '/catalogue/products',
        params
      }),
      providesTags: ['Product']
    }),
    getProduct: builder.query<{ data: Product }, string>({
      query: (id) => `/catalogue/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }]
    }),
    getCategories: builder.query<{ data: CategoryCount[] }, void>({
      query: () => '/catalogue/categories',
      providesTags: ['Category']
    }),
    getMyProducts: builder.query<ProductsResponse, { search?: string; status?: string; page?: number; limit?: number }>({
      query: (params) => ({
        url: '/catalogue/my-products',
        params
      }),
      providesTags: ['MyProduct']
    }),
    createProduct: builder.mutation<{ data: Product }, Partial<Product>>({
      query: (body) => ({
        url: '/catalogue/products',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Product', 'MyProduct', 'Category', 'Dashboard']
    }),
    updateProduct: builder.mutation<{ data: Product }, { id: string; body: Partial<Product> }>({
      query: ({ id, body }) => ({
        url: `/catalogue/products/${id}`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        'Product',
        'MyProduct',
        'Category',
        'Dashboard'
      ]
    }),
    deleteProduct: builder.mutation<{ data: { message: string } }, string>({
      query: (id) => ({
        url: `/catalogue/products/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Product', 'MyProduct', 'Category', 'Dashboard']
    })
  })
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetCategoriesQuery,
  useGetMyProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation
} = catalogueApi;
