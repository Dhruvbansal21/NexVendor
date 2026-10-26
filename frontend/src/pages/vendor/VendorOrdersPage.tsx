import React, { useState } from 'react';
import {
  ClipboardList,
  CheckCircle,
  Package,
  Truck,
  CheckCheck,
  XCircle,
  MapPin,
  Calendar
} from 'lucide-react';
import {
  useGetVendorOrdersQuery,
  useUpdateSubOrderStatusMutation,
  SubOrder
} from '../../api/orderApi';
import { Sidebar } from '../../components/common/Sidebar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatPrice, formatDate } from '../../lib/formatters';
import { useAppDispatch } from '../../store';
import { addToast } from '../../store/toastSlice';

export const VendorOrdersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useGetVendorOrdersQuery({
    status: statusFilter || undefined,
    page,
    limit: 10
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateSubOrderStatusMutation();

  const handleTransition = async (orderId: string, subOrderId: string, nextStatus: SubOrder['status']) => {
    try {
      await updateStatus({
        orderId,
        subOrderId,
        status: nextStatus
      }).unwrap();
      dispatch(
        addToast({
          type: 'success',
          message: `Sub-order transitioned to "${nextStatus}"`
        })
      );
      refetch();
    } catch (err: any) {
      dispatch(
        addToast({
          type: 'error',
          message: err.data?.error?.message || 'Failed to update order status'
        })
      );
    }
  };

  const orders = data?.data || [];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <Sidebar type="vendor" />

      <main className="flex-1 p-6 md:p-10 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Customer Sub-Orders
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Fulfill customer purchases. Each sub-order follows strict multi-vendor lifecycle state transitions.
            </p>
          </div>

          {/* Status Filter Tabs */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:border-brand-500 outline-hidden"
          >
            <option value="">All Sub-Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 bg-white rounded-3xl border border-slate-200" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-xs text-slate-500">
            No customer sub-orders found in this category.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((record) => (
              <div
                key={record.subOrderId}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Sub-Order ID</span>
                      <span className="font-mono font-bold text-slate-900">
                        #{record.subOrderId.slice(-8).toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Parent Order</span>
                      <span className="font-mono text-slate-600">
                        #{record.orderId.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(record.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={record.status} />
                  </div>
                </div>

                {/* Items */}
                <div className="py-4 space-y-2">
                  {record.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          {item.qty}×
                        </span>
                        <span className="font-semibold text-slate-800">{item.title}</span>
                      </div>
                      <span className="font-bold text-slate-900">{formatPrice(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Shipping Info */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Deliver to: <strong>{record.shippingAddress.fullName}</strong> ({record.shippingAddress.city}, {record.shippingAddress.state} - {record.shippingAddress.postalCode}) | Phone: {record.shippingAddress.phone}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Subtotal</span>
                    <span className="text-sm font-extrabold text-brand-600">
                      {formatPrice(record.subtotal)}
                    </span>
                  </div>
                </div>

                {/* State Machine Action Buttons (ONLY VALID TRANSITIONS AS REQUIRED BY SPEC) */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2 text-xs">
                  {record.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleTransition(record.orderId, record.subOrderId, 'confirmed')}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition active:scale-95"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Confirm Order</span>
                      </button>
                      <button
                        onClick={() => handleTransition(record.orderId, record.subOrderId, 'cancelled')}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel (Release Stock)</span>
                      </button>
                    </>
                  )}

                  {record.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleTransition(record.orderId, record.subOrderId, 'packed')}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition active:scale-95"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Mark Packed</span>
                      </button>
                      <button
                        onClick={() => handleTransition(record.orderId, record.subOrderId, 'cancelled')}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel (Release Stock)</span>
                      </button>
                    </>
                  )}

                  {record.status === 'packed' && (
                    <button
                      onClick={() => handleTransition(record.orderId, record.subOrderId, 'shipped')}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition active:scale-95"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Ship Package</span>
                    </button>
                  )}

                  {record.status === 'shipped' && (
                    <button
                      onClick={() => handleTransition(record.orderId, record.subOrderId, 'delivered')}
                      disabled={isUpdating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition active:scale-95"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark Delivered</span>
                    </button>
                  )}

                  {(record.status === 'delivered' || record.status === 'cancelled') && (
                    <span className="text-[11px] font-semibold text-slate-400 italic">
                      Terminal state: no further transitions allowed.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
