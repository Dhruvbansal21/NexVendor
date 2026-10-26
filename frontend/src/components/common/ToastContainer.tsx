import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { removeToast, ToastItem } from '../../store/toastSlice';

const ToastSingle: React.FC<{ toast: ToastItem }> = ({ toast }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, 4000);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    info: <Info className="w-4 h-4 text-blue-500" />
  };

  const borderColors = {
    success: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
    error: 'border-rose-200 bg-rose-50/90 text-rose-900',
    warning: 'border-amber-200 bg-amber-50/90 text-amber-900',
    info: 'border-blue-200 bg-blue-50/90 text-blue-900'
  };

  return (
    <div
      className={`flex items-start gap-2.5 p-3.5 rounded-xl border shadow-lg backdrop-blur-md max-w-sm w-full transition-all animate-slide-in ${
        borderColors[toast.type]
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <p className="text-xs font-medium leading-relaxed flex-grow">{toast.message}</p>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="p-1 -mr-1 -mt-1 text-slate-400 hover:text-slate-600 rounded transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useAppSelector((state) => state.toast.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastSingle toast={toast} />
        </div>
      ))}
    </div>
  );
};
