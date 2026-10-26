import { baseApi } from './baseApi';

export interface OrderItem {
  productId: string;
  title: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

export interface SubOrder {
  id: string;
  vendorId: string;
  storeName: string;
  items: OrderItem[];
  subtotal: number;
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  statusHistory: Array<{ status: string; timestamp: string; updatedBy: string }>;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  customerId: string;
  idempotencyKey: string;
  subOrders: SubOrder[];
  totalAmount: number;
  currency: string;
  paymentStatus: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
}

export interface VendorSubOrderRecord {
  orderId: string;
  subOrderId: string;
  storeName: string;
  items: OrderItem[];
  subtotal: number;
  status: SubOrder['status'];
  statusHistory: SubOrder['statusHistory'];
  shippingAddress: ShippingAddress;
  paymentStatus: string;
  createdAt: string;
}

export interface OrdersResponse {
  data: Order[];
  page: number;
  limit: number;
  total: number;
}

export interface VendorOrdersResponse {
  data: VendorSubOrderRecord[];
  page: number;
  limit: number;
  total: number;
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<
      { data: Order },
      { idempotencyKey: string; items: Array<{ productId: string; qty: number }>; shippingAddress: ShippingAddress }
    >({
      query: ({ idempotencyKey, ...body }) => ({
        url: '/orders',
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey
        },
        body
      }),
      invalidatesTags: ['Order', 'Product', 'Dashboard']
    }),
    getMyOrders: builder.query<OrdersResponse, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/orders/my-orders',
        params: params || {}
      }),
      providesTags: ['Order']
    }),
    getOrder: builder.query<{ data: Order }, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }]
    }),
    getVendorOrders: builder.query<VendorOrdersResponse, { status?: string; page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/vendors/me/orders',
        params: params || {}
      }),
      providesTags: ['VendorOrder']
    }),
    updateSubOrderStatus: builder.mutation<
      { data: Order },
      { orderId: string; subOrderId: string; status: SubOrder['status'] }
    >({
      query: ({ orderId, subOrderId, status }) => ({
        url: `/orders/${orderId}/status`,
        method: 'PATCH',
        body: { subOrderId, status }
      }),
      invalidatesTags: ['Order', 'VendorOrder', 'Product', 'Dashboard']
    }),
    getAdminOrders: builder.query<OrdersResponse, { status?: string; page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/admin/orders',
        params: params || {}
      }),
      providesTags: ['Order']
    })
  })
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderQuery,
  useGetVendorOrdersQuery,
  useUpdateSubOrderStatusMutation,
  useGetAdminOrdersQuery
} = orderApi;
