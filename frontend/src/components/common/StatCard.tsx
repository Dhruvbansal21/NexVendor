import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: 'brand' | 'emerald' | 'amber' | 'sky' | 'teal';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'brand'
}) => {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
    teal: 'bg-teal-50 text-teal-600'
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200/80 p-5 shadow-sm card-hover">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</p>
        {icon && (
          <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-stone-900 tracking-tight">{value}</h3>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trend.positive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-stone-500">{subtitle}</p>}
    </div>
  );
};
