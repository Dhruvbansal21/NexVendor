import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, HeartHandshake } from 'lucide-react';

const shopLinks = [
  { label: 'All products', to: '/' },
  { label: 'Handicrafts', to: '/?category=Handicrafts' },
  { label: 'Home & living', to: '/?category=Home%20%26%20Living' },
  { label: 'Your cart', to: '/cart' }
];

const accountLinks = [
  { label: 'Sign in', to: '/login' },
  { label: 'Create an account', to: '/register' },
  { label: 'Your orders', to: '/my-orders' }
];

const vendorLinks = [
  { label: 'Open a store', to: '/register' },
  { label: 'Seller dashboard', to: '/vendor/dashboard' },
  { label: 'Store & verification', to: '/vendor/onboarding' }
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-400 text-xs">
      {/* Reassurance strip */}
      <div className="border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-stone-100 font-semibold text-sm">Every seller is checked</p>
              <p className="mt-1 leading-relaxed">
                Stores are reviewed before a single product goes live.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-stone-100 font-semibold text-sm">Packed by the maker</p>
              <p className="mt-1 leading-relaxed">
                Orders are split per store, so each parcel comes straight from the person who made it.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-brand-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-stone-100 font-semibold text-sm">Fair for small shops</p>
              <p className="mt-1 leading-relaxed">
                No shelf fees, no paid placement. Sellers keep what they earn.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-display font-semibold text-base tracking-tight">NexVendor</span>
            </div>
            <p className="leading-relaxed">
              A marketplace for independent makers, growers and small shops — the kind of
              places you'd walk into on a Saturday morning, gathered in one basket.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-semibold text-stone-200 uppercase tracking-wider text-[11px]">Shop</h4>
            <ul className="space-y-2">
              {shopLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-brand-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-semibold text-stone-200 uppercase tracking-wider text-[11px]">Your account</h4>
            <ul className="space-y-2">
              {accountLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-brand-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-semibold text-stone-200 uppercase tracking-wider text-[11px]">Sell with us</h4>
            <ul className="space-y-2">
              {vendorLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-brand-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
          <p>© {new Date().getFullYear()} NexVendor. Made for small shops and the people who love them.</p>
          <p>Prices shown in Indian rupees, inclusive of taxes.</p>
        </div>
      </div>
    </footer>
  );
};
