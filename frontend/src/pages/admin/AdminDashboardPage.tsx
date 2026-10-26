import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Store,
  Package,
  ClipboardList,
  IndianRupee,
  Clock,
  ArrowRight,
  ShieldCheck,
  Server
} from 'lucide-react';
import { useGetAdminDashboardQuery } from '../../api/dashboardApi';
import { Sidebar } from '../../components/common/Sidebar';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatPrice, formatDate } from '../../lib/formatters';

export const AdminDashboardPage: React.FC = () => {
  const { data, isLoading } = useGetAdminDashboardQuery();
  const dash = data?.data;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-6 md:p-10 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Admin Platform Overview
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Aggregated system metrics composed from Gateway across all 4 independent microservices
            </p>
          </div>

          <Link
            to="/admin/vendors"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm active:scale-95 self-start sm:self-auto"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Review Pending Vendors</span>
          </Link>
        </div>

        {/* Pending Vendors Action Notice */}
        {(dash?.summary?.pendingVendors ?? 0) > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>{dash?.summary?.pendingVendors} vendor(s)</strong> awaiting KYC verification.
              </span>
            </div>
            <Link
              to="/admin/vendors"
              className="text-xs font-bold text-amber-950 underline hover:text-amber-800"
            >
              Verify Now
            </Link>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatPrice(dash?.summary?.totalRevenuePaise || 0)}
            subtitle="Platform gross"
            color="brand"
            icon={<IndianRupee className="w-4 h-4" />}
          />
          <StatCard
            title="Total Orders"
            value={dash?.summary?.totalOrders ?? 0}
            subtitle="Processed orders"
            color="blue"
            icon={<ClipboardList className="w-4 h-4" />}
          />
          <StatCard
            title="Total Vendors"
            value={dash?.summary?.totalVendors ?? 0}
            subtitle={`${dash?.vendors?.pendingVendors ?? 0} pending`}
            color="amber"
            icon={<Store className="w-4 h-4" />}
          />
          <StatCard
            title="Total Products"
            value={dash?.summary?.totalProducts ?? 0}
            subtitle={`${dash?.catalogue?.activeProducts ?? 0} active`}
            color="purple"
            icon={<Package className="w-4 h-4" />}
          />
          <StatCard
            title="Total Users"
            value={dash?.summary?.totalUsers ?? 0}
            subtitle={`${dash?.users?.customersCount ?? 0} customers`}
            color="emerald"
            icon={<Users className="w-4 h-4" />}
          />
        </div>

        {/* Microservices Health Composition Box */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm lg:col-span-1">
            <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-600" />
              <span>Backend Microservices</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Auth Service :4001</p>
                  <p className="text-[10px] text-slate-400">DB: marketplace_auth</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Healthy
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Vendor Service :4002</p>
                  <p className="text-[10px] text-slate-400">DB: marketplace_vendor</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Healthy
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Catalogue Service :4003</p>
                  <p className="text-[10px] text-slate-400">DB: marketplace_catalogue</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Healthy
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Order Service :4004</p>
                  <p className="text-[10px] text-slate-400">DB: marketplace_orders</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Healthy
                </span>
              </div>
            </div>
          </div>

          {/* Recent Orders in Platform */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent Marketplace Orders</h2>
                <p className="text-xs text-slate-500">Global transaction stream across all vendors</p>
              </div>
              <Link
                to="/admin/orders"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {(!dash?.orders?.recentOrders || dash.orders.recentOrders.length === 0) ? (
              <div className="text-center py-8 text-xs text-slate-400">No orders recorded in system yet</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {dash.orders.recentOrders.map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-800">
                        Order #{ord.id.slice(-8).toUpperCase()}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(ord.createdAt)} • {ord.subOrders?.length || 0} sub-orders
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">
                        {formatPrice(ord.totalAmount)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {ord.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
