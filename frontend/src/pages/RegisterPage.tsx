import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ShoppingBag, AlertCircle, ShoppingCart, Store } from 'lucide-react';
import { useRegisterMutation } from '../api/authApi';
import { useAppDispatch } from '../store';
import { setCredentials } from '../store/authSlice';
import { addToast } from '../store/toastSlice';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'vendor'>('customer');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      const res = await registerUser({ name, email, password, role }).unwrap();
      dispatch(setCredentials({ token: res.data.token, user: res.data.user }));
      dispatch(addToast({ type: 'success', message: `Welcome to NexVendor, ${res.data.user.name}!` }));

      if (res.data.user.role === 'vendor') {
        navigate('/vendor/onboarding');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setErrorMsg(err.data?.error?.message || 'Registration failed. Please check the form.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200/80 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-brand-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">Create your account</h2>
          <p className="text-xs text-stone-500 mt-1">Join as a marketplace customer or store vendor</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. you@example.com"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">Select Account Role</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center cursor-pointer transition ${
                  role === 'customer'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={role === 'customer'}
                  onChange={() => setRole('customer')}
                  className="sr-only"
                />
                <ShoppingCart className="w-5 h-5 mb-1 text-brand-600" />
                <span className="text-xs font-bold">Customer</span>
                <span className="text-[10px] text-stone-400 mt-0.5">Shop & place orders</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center cursor-pointer transition ${
                  role === 'vendor'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value="vendor"
                  checked={role === 'vendor'}
                  onChange={() => setRole('vendor')}
                  className="sr-only"
                />
                <Store className="w-5 h-5 mb-1 text-teal-600" />
                <span className="text-xs font-bold">Vendor</span>
                <span className="text-[10px] text-stone-400 mt-0.5">Sell & manage products</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>Create Account</span>
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
