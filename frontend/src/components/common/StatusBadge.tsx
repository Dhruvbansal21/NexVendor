import React from 'react';

export type StatusType =
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'draft'
  | 'active';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  verified: { label: 'Verified', bg: 'bg-emerald-50', text: 'text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  rejected: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  confirmed: { label: 'Confirmed', bg: 'bg-blue-50', text: 'text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  packed: { label: 'Packed', bg: 'bg-purple-50', text: 'text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  shipped: { label: 'Shipped', bg: 'bg-indigo-50', text: 'text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  delivered: { label: 'Delivered', bg: 'bg-emerald-50', text: 'text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  draft: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-700 border-slate-200', dot: 'bg-slate-500' },
  active: { label: 'Active', bg: 'bg-teal-50', text: 'text-teal-700 border-teal-200', dot: 'bg-teal-500' }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = (status || '').toLowerCase();
  const config = statusConfig[normalized] || {
    label: status,
    bg: 'bg-slate-50',
    text: 'text-slate-700 border-slate-200',
    dot: 'bg-slate-400'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
