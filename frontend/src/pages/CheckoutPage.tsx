import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Store,
  Lock
} from 'lucide-react';
import { useCreateOrderMutation } from '../api/orderApi';
import { useAppDispatch, useAppSelector } from '../store';
import { clearCart } from '../store/cartSlice';
import { addToast } from '../store/toastSlice';
import { formatPrice } from '../lib/formatters';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const auth = useAppSelector((state) => state.auth);
  const cartItems = useAppSelector((state) => state.cart.items);

  // Generate Idempotency-Key with crypto.randomUUID() when page opens; reuse on retry!
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  useEffect(() => {
    setIdempotencyKey(crypto.randomUUID());
  }, []);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: auth.user?.name || '',
    street: '',
    city: 'Bangalore',
    state: 'Karnataka',
    postalCode: '560001',
    country: 'India',
    phone: '+919876543210'
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [conflictDetails, setConflictDetails] = useState<any[]>([]);

  const subtotalPaise = cartItems.reduce((acc, i) => acc + i.unitPrice * i.qty, 0);
  const stores = Array.from(new Set(cartItems.map((i) => i.storeName)));

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold text-slate-800 mb-2">Your cart is empty</h2>
        <p className="text-xs text-slate-500 mb-6">Add products to your cart before proceeding to checkout.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Catalogue</span>
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setConflictDetails([]);

    try {
      const payload = {
        idempotencyKey,
        items: cartItems.map((item) => ({
          productId: item.productId,
          qty: item.qty
        })),
        shippingAddress
      };

      const res = await createOrder(payload).unwrap();
      dispatch(clearCart());
      dispatch(
        addToast({
          type: 'success',
          message: `Order #${res.data.id.slice(-6).toUpperCase()} placed successfully!`
        })
      );

      navigate('/my-orders');
    } catch (err: any) {
      const errInfo = err.data?.error || {};
      setErrorMsg(errInfo.message || 'Order creation failed. Please try again.');
      if (errInfo.code === 'STOCK_UNAVAILABLE') {
        setConflictDetails(errInfo.details || []);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Demo Checkout Banner Required by Part 8 */}
      <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3.5 text-amber-900 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <strong className="font-bold block text-sm text-amber-950 mb-0.5">
            Demo checkout — no real payment is processed.
          </strong>
          <p className="text-amber-800 leading-relaxed">
            PaymentStatus will be recorded as <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[11px]">demo_paid</code>.
            Real stock will be reserved conditionally and grouped by vendor. Double-clicks and network retries are protected by Idempotency-Key.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 text-xs text-slate-500">
        <Link to="/cart" className="hover:text-slate-800 flex items-center gap-1 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">Checkout</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping & Payment Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* Error / Conflict Alert */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                <strong className="font-bold block mb-1">Could not complete order:</strong>
                <p>{errorMsg}</p>
                {conflictDetails.length > 0 && (
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    {conflictDetails.map((d, i) => (
                      <li key={i}>
                        Product ID {d.productId}: Requested {d.requestedQty} unit(s) exceeds available stock.
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Shipping Address Box */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                1. Shipping Address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 outline-hidden"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    placeholder="House / Flat No., Street, Landmark"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    disabled
                    value={shippingAddress.country}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Box */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                2. Demo Payment Simulation
              </h2>

              <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Demo Instant Payment Provider</h3>
                    <p className="text-[11px] text-slate-500">Simulates verified electronic payment settlement</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready</span>
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-98 transition shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>Place Demo Order ({formatPrice(subtotalPaise)})</span>
            </button>
          </form>
        </div>

        {/* Order Breakdown Sidebar */}
        <div>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm sticky top-24">
            <h2 className="text-base font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Order Items ({cartItems.length})
            </h2>

            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {item.qty} × {formatPrice(item.unitPrice)}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                      <Store className="w-3 h-3 text-brand-600" />
                      <span className="truncate">{item.storeName}</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 flex-shrink-0">
                    {formatPrice(item.unitPrice * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-2 text-xs mb-6">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatPrice(subtotalPaise)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Total Due</span>
                <span className="text-brand-600">{formatPrice(subtotalPaise)}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1 font-semibold text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                <span>Idempotency Key Attached</span>
              </div>
              <p className="font-mono text-[10px] text-slate-400 truncate">
                {idempotencyKey || 'Generating...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
