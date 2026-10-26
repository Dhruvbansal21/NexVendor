import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  User,
  LogOut,
  LayoutDashboard,
  Package,
  Store,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/authSlice';
import { addToast } from '../../store/toastSlice';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const auth = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((acc, i) => acc + i.qty, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(addToast({ type: 'info', message: 'You have been logged out' }));
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 block leading-tight">
                Nex<span className="text-brand-600">Vendor</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase block leading-none">
                Marketplace
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden sm:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, handmade crafts, tech, fashion..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs rounded-xl border border-transparent focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-hidden text-slate-800 placeholder-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </form>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition active:scale-95"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Navigation */}
            {auth.user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                    {auth.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden md:block pr-1">
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[100px]">
                      {auth.user.name}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {auth.user.role}
                    </p>
                  </div>
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-scale-up"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{auth.user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{auth.user.email}</p>
                    </div>

                    {/* Role-specific Links */}
                    {auth.user.role === 'customer' && (
                      <Link
                        to="/my-orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                      >
                        <ClipboardList className="w-4 h-4 text-slate-400" />
                        <span>My Orders</span>
                      </Link>
                    )}

                    {auth.user.role === 'vendor' && (
                      <>
                        <Link
                          to="/vendor/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <LayoutDashboard className="w-4 h-4 text-brand-600" />
                          <span>Vendor Dashboard</span>
                        </Link>
                        <Link
                          to="/vendor/products"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <Package className="w-4 h-4 text-brand-600" />
                          <span>My Products</span>
                        </Link>
                        <Link
                          to="/vendor/orders"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <ClipboardList className="w-4 h-4 text-brand-600" />
                          <span>Vendor Orders</span>
                        </Link>
                        <Link
                          to="/vendor/onboarding"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <Store className="w-4 h-4 text-brand-600" />
                          <span>Store Settings & KYC</span>
                        </Link>
                      </>
                    )}

                    {auth.user.role === 'admin' && (
                      <>
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                          <span>Admin Dashboard</span>
                        </Link>
                        <Link
                          to="/admin/vendors"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          <span>Vendor Approvals</span>
                        </Link>
                        <Link
                          to="/admin/orders"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <ClipboardList className="w-4 h-4 text-indigo-600" />
                          <span>All Marketplace Orders</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition shadow-xs active:scale-95"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
