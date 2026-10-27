import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  IndianRupee,
  Clock,
  ClipboardList,
  Store,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useGetVendorDashboardQuery } from '../../api/dashboardApi';
import { Sidebar } from '../../components/common/Sidebar';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatPrice, formatDate } from '../../lib/formatters';

export const VendorDashboardPage: React.FC = () => {
  const { data, isLoading } = useGetVendorDashboardQuery();
  const dashboard = data?.data;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <Sidebar type="vendor" />

      <main className="flex-1 p-6 md:p-10 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              Vendor Dashboard
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Store performance overview, product inventory, and customer orders
            </p>
          </div>

          <Link
            to="/vendor/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition shadow-sm active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Manage Products</span>
          </Link>
        </div>

        {/* Store Verification Notice if pending */}
        {dashboard?.status === 'pending' && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
            <div>
              <strong className="font-bold block">Store Verification Pending</strong>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Admin review is currently pending. Your products remain saved as drafts.
              </p>
            </div>
            <Link
              to="/vendor/onboarding"
              className="text-xs font-bold text-amber-900 underline"
            >
              View KYC Status
            </Link>
          </div>
        )}

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatPrice(dashboard?.totalSalesPaise || 0)}
            subtitle="Calculated server-side"
            color="brand"
            icon={<IndianRupee className="w-5 h-5" />}
          />
          <StatCard
            title="Total Products"
            value={dashboard?.totalProducts ?? 0}
            subtitle="In your inventory"
            color="teal"
            icon={<Package className="w-5 h-5" />}
          />
          <StatCard
            title="Pending Orders"
            value={dashboard?.pendingOrders ?? 0}
            subtitle="Awaiting fulfillment"
            color="amber"
            icon={<Clock className="w-5 h-5" />}
          />
          <StatCard
            title="Total Sub-Orders"
            value={dashboard?.totalSubOrders ?? 0}
            subtitle="Completed & active"
            color="emerald"
            icon={<ClipboardList className="w-5 h-5" />}
          />
        </div>

        {/* Recent Orders Preview */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-sm font-bold text-stone-900">Recent Customer Sub-Orders</h2>
              <p className="text-xs text-stone-500">Orders containing items from your store</p>
            </div>
            <Link
              to="/vendor/orders"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {(!dashboard?.recentOrders || dashboard.recentOrders.length === 0) ? (
            <div className="text-center py-8 text-xs text-stone-500">
              No orders received yet. Items purchased by customers will appear here.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {dashboard.recentOrders.map((ord) => (
                <div key={ord.subOrderId} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-stone-800">
                      Sub-Order #{ord.subOrderId.slice(-6).toUpperCase()}
                    </span>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {formatDate(ord.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-stone-900">
                      {formatPrice(ord.subtotal)}
                    </span>
                    <StatusBadge status={ord.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
