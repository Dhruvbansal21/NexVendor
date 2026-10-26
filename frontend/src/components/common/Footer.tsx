import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 text-white inline-flex">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight">NexVendor</span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The premier multi-vendor commerce platform connecting discerning customers with verified independent merchants, artisan creators, and brand storefronts worldwide.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                <span>Verified Merchants</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <Truck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Direct Fulfillment</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Buyer Protection</span>
              </div>
            </div>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Customer Care
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>
                <Link to="/my-orders" className="hover:text-white transition">
                  Track Your Orders
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-white transition">
                  Browse All Categories
                </Link>
              </li>
              <li>
                <span className="text-slate-500">
                  Returns & Refunds Policy
                </span>
              </li>
              <li>
                <span className="text-slate-500">
                  Help Center & FAQs
                </span>
              </li>
            </ul>
          </div>

          {/* Merchant Solutions */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Merchant Solutions
            </h4>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li>
                <Link to="/register" className="hover:text-white transition">
                  Open a Storefront
                </Link>
              </li>
              <li>
                <Link to="/vendor/onboarding" className="hover:text-white transition">
                  Merchant KYC & Onboarding
                </Link>
              </li>
              <li>
                <Link to="/vendor/dashboard" className="hover:text-white transition">
                  Vendor Dashboard
                </Link>
              </li>
              <li>
                <Link to="/vendor/products" className="hover:text-white transition">
                  Product Inventory
                </Link>
              </li>
              <li>
                <span className="text-slate-500">
                  Merchant Guidelines
                </span>
              </li>
            </ul>
          </div>

          {/* Sell on NexVendor Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800/90 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-2">
                Merchant Community
              </span>
              <h5 className="font-bold text-white text-xs">Sell on NexVendor</h5>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                Reach thousands of active shoppers and scale your independent business with direct store tools.
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition shadow-sm"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 NexVendor Marketplace Inc. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="hover:text-slate-300">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-300">Merchant Agreement</span>
            <span>•</span>
            <span className="hover:text-slate-300">Security Overview</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
