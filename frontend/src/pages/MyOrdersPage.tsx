import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Store, Calendar, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { useGetMyOrdersQuery } from '../api/orderApi';
import { formatPrice, formatDate } from '../lib/formatters';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

export const MyOrdersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useGetMyOrdersQuery({ page, limit: 10 });

  const orders = data?.data || [];
  const total = data?.total || 0;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-4 animate-pulse">
        <div className="h-6 bg-stone-200 rounded w-48 mb-6" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-44 bg-stone-200 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <ErrorState
          title="Could not load your orders"
          message={(error as any)?.data?.error?.message || 'Check if the order service is running'}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          title="No orders placed yet"
          description="When you buy from one of our stores, the order will show up here."
          actionText="Start Shopping"
          onAction={() => window.location.assign('/')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">My Orders</h1>
        <p className="text-xs text-stone-500 mt-1">
          Review your purchase history and track individual vendor sub-orders
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-md transition"
          >
            {/* Order Master Header */}
            <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Order ID
                  </span>
                  <span className="font-mono font-bold text-stone-900">
                    #{order.id.slice(-8).toUpperCase()}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Placed On
                  </span>
                  <span className="font-semibold text-stone-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Total Amount
                  </span>
                  <span className="font-extrabold text-brand-600">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {order.paymentStatus === 'demo_paid' ? 'Paid' : order.paymentStatus}
                </span>
              </div>
            </div>

            {/* One section per store */}
            <div className="p-6 divide-y divide-stone-100 space-y-6">
              {order.subOrders.map((subOrder) => (
                <div key={subOrder.id} className="first:pt-0 pt-6">
                  {/* Vendor Sub-Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs">
                      <Store className="w-4 h-4 text-brand-600" />
                      <span className="font-bold text-stone-900">{subOrder.storeName}</span>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-500">{subOrder.items.length} item(s)</span>
                    </div>

                    <StatusBadge status={subOrder.status} />
                  </div>

                  {/* Items in this sub-order */}
                  <div className="space-y-3">
                    {subOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-stone-50/60 p-3 rounded-xl border border-stone-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center font-bold text-stone-500 text-[11px]">
                            {item.qty}×
                          </div>
                          <div>
                            <p className="font-semibold text-stone-900">{item.title}</p>
                            <p className="text-[11px] text-stone-500">
                              {formatPrice(item.unitPrice)} each
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-stone-900">
                          {formatPrice(item.lineTotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Subtotal */}
                  <div className="mt-3 flex justify-between text-xs font-semibold text-stone-700 px-1">
                    <span className="text-stone-500">Sub-Order Subtotal</span>
                    <span>{formatPrice(subOrder.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping Address Footer */}
            <div className="bg-stone-50/50 px-6 py-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>
                  Delivering to: <strong className="font-semibold text-stone-700">{order.shippingAddress.fullName}</strong> ({order.shippingAddress.city}, {order.shippingAddress.postalCode})
                </span>
              </div>
              <span className="font-mono text-[10px] text-stone-400">
                Ref #{order.id.slice(-8).toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
