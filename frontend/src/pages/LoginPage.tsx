import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, ShoppingBag, AlertCircle } from 'lucide-react';
import { useLoginMutation } from '../api/authApi';
import { useAppDispatch } from '../store';
import { setCredentials } from '../store/authSlice';
import { addToast } from '../store/toastSlice';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ token: res.data.token, user: res.data.user }));
      dispatch(addToast({ type: 'success', message: `Welcome back, ${res.data.user.name}!` }));

      if (from) {
        navigate(from, { replace: true });
      } else if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (res.data.user.role === 'vendor') {
        navigate('/vendor/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.data?.error?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleQuickFill = (demoEmail: string, roleName: string) => {
    setEmail(demoEmail);
    setPassword('Demo@12345');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-brand-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Sign in to your account</h2>
          <p className="text-xs text-slate-500 mt-1">Access your marketplace dashboard, orders, or store</p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. you@example.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-hidden transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-hidden transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>Sign In</span>
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Pill Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
            Quick Access Test Profiles
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('customer1@demo.test', 'Customer')}
              className="px-2.5 py-2 text-[11px] font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition text-center"
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('vendor1@demo.test', 'Vendor')}
              className="px-2.5 py-2 text-[11px] font-semibold rounded-lg bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 transition text-center"
            >
              Vendor
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@demo.test', 'Admin')}
              className="px-2.5 py-2 text-[11px] font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 transition text-center"
            >
              Admin
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
