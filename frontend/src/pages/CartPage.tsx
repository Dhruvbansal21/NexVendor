import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Store, ArrowLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { updateQty, removeFromCart, clearCart } from '../store/cartSlice';
import { formatPrice } from '../lib/formatters';
import { EmptyState } from '../components/common/EmptyState';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);

  const subtotalPaise = items.reduce((acc, i) => acc + i.unitPrice * i.qty, 0);

  // Group items by vendor storeName for dedicated vendor order packages
  const stores = Array.from(new Set(items.map((i) => i.storeName)));

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="Your shopping cart is empty"
          description="Browse our catalogue and find quality items from verified independent vendors."
          actionText="Explore Catalogue"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">
            {items.length} item type(s) across {stores.length} vendor store(s)
          </p>
        </div>
        <button
          onClick={() => dispatch(clearCart())}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {stores.map((storeName) => {
            const storeItems = items.filter((i) => i.storeName === storeName);
            const storeSubtotal = storeItems.reduce((acc, i) => acc + i.unitPrice * i.qty, 0);

            return (
              <div
                key={storeName}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm"
              >
                {/* Store Header */}
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-brand-600" />
                    <span className="text-xs font-bold text-slate-800">{storeName}</span>
                    <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200/50">
                      Sub-order
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-700">
                    {formatPrice(storeSubtotal)}
                  </span>
                </div>

                {/* Items in this Store */}
                <div className="divide-y divide-slate-100 p-4">
                  {storeItems.map((item) => (
                    <div key={item.productId} className="py-3 first:pt-0 last:pb-0 flex items-center gap-4">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-16 h-16 rounded-xl object-cover bg-slate-100 flex-shrink-0 border border-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.productId}`}
                          className="text-xs font-semibold text-slate-900 hover:text-brand-600 line-clamp-1 mb-1"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs font-bold text-slate-900">
                          {formatPrice(item.unitPrice)}
                        </p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                        <button
                          onClick={() => dispatch(updateQty({ productId: item.productId, qty: item.qty - 1 }))}
                          className="w-6 h-6 flex items-center justify-center font-bold text-xs text-slate-600 hover:bg-white rounded transition"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-900">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => dispatch(updateQty({ productId: item.productId, qty: item.qty + 1 }))}
                          disabled={item.qty >= item.stock}
                          className="w-6 h-6 flex items-center justify-center font-bold text-xs text-slate-600 hover:bg-white rounded transition disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <span className="text-xs font-bold text-slate-900 block">
                          {formatPrice(item.unitPrice * item.qty)}
                        </span>
                      </div>

                      <button
                        onClick={() => dispatch(removeFromCart(item.productId))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Order Summary Box */}
        <div>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm sticky top-24">
            <h2 className="text-base font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotalPaise)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Vendors in Order</span>
                <span className="font-semibold text-slate-900">{stores.length} store{stores.length === 1 ? '' : 's'}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Total Amount</span>
                <span className="text-brand-600">{formatPrice(subtotalPaise)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="mt-4 text-[11px] text-slate-400 text-center leading-relaxed">
              Items from multiple merchants are processed and shipped securely in dedicated packages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
