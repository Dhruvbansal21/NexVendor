import React, { useState } from 'react';
import {
  ClipboardList,
  Calendar,
  Store,
  MapPin,
  Search
} from 'lucide-react';
import { useGetAdminOrdersQuery } from '../../api/orderApi';
import { Sidebar } from '../../components/common/Sidebar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatPrice, formatDate } from '../../lib/formatters';

export const AdminOrdersPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetAdminOrdersQuery({
    status: statusFilter || undefined,
    page,
    limit: 10
  });

  const orders = data?.data || [];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-6 md:p-10 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              All Platform Orders
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Global order logs across all vendors and customers on the marketplace
            </p>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:border-indigo-500 outline-hidden"
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Vendors Involved</th>
                  <th className="py-3.5 px-4">Sub-Orders Status</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">Loading orders...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No orders found under this filter.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 block">
                          #{o.id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(o.createdAt)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">
                          {o.shippingAddress?.fullName}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                          {o.shippingAddress?.city}, {o.shippingAddress?.state}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {o.subOrders?.map((sub) => (
                            <span
                              key={sub.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-700"
                            >
                              <Store className="w-3 h-3 text-brand-600" />
                              <span>{sub.storeName}</span>
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {o.subOrders?.map((sub) => (
                            <StatusBadge key={sub.id} status={sub.status} />
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatPrice(o.totalAmount)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {o.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
