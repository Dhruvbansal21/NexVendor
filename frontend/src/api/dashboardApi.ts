import { baseApi } from './baseApi';
import type { Order } from './orderApi';

export interface CustomerDashboardData {
  totalOrders: number;
  activeOrders: number;
  recentOrders: Order[];
}

export interface VendorDashboardData {
  storeName: string | null;
  status: 'pending' | 'verified' | 'rejected' | 'not_onboarded';
  rejectionReason?: string;
  totalProducts: number;
  totalSalesPaise: number;
  totalSubOrders: number;
  pendingOrders: number;
  recentOrders: Array<{
    orderId: string;
    subOrderId: string;
    subtotal: number;
    status: string;
    createdAt: string;
  }>;
}

export interface AdminDashboardData {
  users: {
    totalUsers: number;
    customersCount: number;
    vendorsCount: number;
    adminsCount: number;
  };
  vendors: {
    totalVendors: number;
    pendingVendors: number;
    verifiedVendors: number;
    rejectedVendors: number;
  };
  catalogue: {
    totalProducts: number;
    activeProducts: number;
    draftProducts: number;
    outOfStockProducts: number;
    categoriesCount: number;
  };
  orders: {
    totalOrders: number;
    totalSubOrders: number;
    totalRevenuePaise: number;
    statusCounts: Record<string, number>;
    recentOrders: Order[];
  };
  summary: {
    totalUsers: number;
    totalVendors: number;
    pendingVendors: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenuePaise: number;
  };
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerDashboard: builder.query<{ data: CustomerDashboardData }, void>({
      query: () => '/dashboard/customer',
      providesTags: ['Dashboard']
    }),
    getVendorDashboard: builder.query<{ data: VendorDashboardData }, void>({
      query: () => '/dashboard/vendor',
      providesTags: ['Dashboard']
    }),
    getAdminDashboard: builder.query<{ data: AdminDashboardData }, void>({
      query: () => '/dashboard/admin',
      providesTags: ['Dashboard']
    })
  })
});

export const {
  useGetCustomerDashboardQuery,
  useGetVendorDashboardQuery,
  useGetAdminDashboardQuery
} = dashboardApi;
