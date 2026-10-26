import { baseApi } from './baseApi';

export interface KycDoc {
  docId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface Vendor {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  commissionPct?: number;
  kycDocs?: KycDoc[];
  verifiedAt?: string;
  createdAt: string;
}

export interface VendorsResponse {
  data: Vendor[];
  page: number;
  limit: number;
  total: number;
}

export const vendorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    onboardVendor: builder.mutation<{ data: Vendor }, FormData>({
      query: (formData) => ({
        url: '/vendors/onboard',
        method: 'POST',
        body: formData
      }),
      invalidatesTags: ['Vendor', 'Dashboard']
    }),
    getMyVendor: builder.query<{ data: Vendor }, void>({
      query: () => '/vendors/me',
      providesTags: ['Vendor']
    }),
    getVendors: builder.query<VendorsResponse, { status?: string; page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/vendors',
        params: params || {}
      }),
      providesTags: ['Vendor']
    }),
    getVendor: builder.query<{ data: Vendor }, string>({
      query: (id) => `/vendors/${id}`,
      providesTags: (result, error, id) => [{ type: 'Vendor', id }]
    }),
    verifyVendor: builder.mutation<{ data: Vendor }, string>({
      query: (id) => ({
        url: `/admin/vendors/${id}/verify`,
        method: 'PATCH'
      }),
      invalidatesTags: ['Vendor', 'Product', 'Dashboard']
    }),
    rejectVendor: builder.mutation<{ data: Vendor }, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/vendors/${id}/reject`,
        method: 'PATCH',
        body: { reason }
      }),
      invalidatesTags: ['Vendor', 'Product', 'Dashboard']
    })
  })
});

export const {
  useOnboardVendorMutation,
  useGetMyVendorQuery,
  useGetVendorsQuery,
  useGetVendorQuery,
  useVerifyVendorMutation,
  useRejectVendorMutation
} = vendorApi;
