import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Store,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import { useAppSelector } from '../../store';

interface SidebarProps {
  type: 'vendor' | 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ type }) => {
  const auth = useAppSelector((state) => state.auth);

  const vendorLinks = [
    { to: '/vendor/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/vendor/products', label: 'Products', icon: <Package className="w-4 h-4" /> },
    { to: '/vendor/orders', label: 'Orders', icon: <ClipboardList className="w-4 h-4" /> },
    { to: '/vendor/onboarding', label: 'Store & KYC', icon: <Store className="w-4 h-4" /> }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/admin/vendors', label: 'Vendors', icon: <ShieldCheck className="w-4 h-4" /> },
    { to: '/admin/orders', label: 'Orders', icon: <ClipboardList className="w-4 h-4" /> }
  ];

  const links = type === 'vendor' ? vendorLinks : adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-stone-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col flex-shrink-0">
      <div className="mb-6 px-3 py-2 bg-stone-50 rounded-xl border border-stone-100">
        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
          {type === 'vendor' ? 'Vendor Portal' : 'Admin Portal'}
        </p>
        <p className="text-xs font-bold text-stone-900 mt-0.5 truncate">
          {auth.user?.name}
        </p>
      </div>

      <nav className="space-y-1.5 flex-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/vendor/dashboard' || link.to === '/admin/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200/50'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-stone-100">
        <NavLink
          to="/"
          className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-stone-500 hover:text-stone-800 transition rounded-lg hover:bg-stone-50"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Back to Storefront</span>
        </NavLink>
      </div>
    </aside>
  );
};
