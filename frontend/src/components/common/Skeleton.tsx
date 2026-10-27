import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-stone-200/80 p-4 animate-pulse">
      <div className="w-full aspect-[4/3] bg-stone-200 rounded-lg mb-4" />
      <div className="h-3.5 bg-stone-200 rounded w-1/3 mb-3" />
      <div className="h-4 bg-stone-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-stone-200 rounded w-full mb-4" />
      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
        <div className="h-5 bg-stone-200 rounded w-1/4" />
        <div className="h-8 bg-stone-200 rounded-lg w-20" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-stone-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-stone-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
};

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-stone-200/80 p-5 animate-pulse">
      <div className="flex justify-between items-center mb-3">
        <div className="h-3 bg-stone-200 rounded w-1/3" />
        <div className="w-9 h-9 bg-stone-200 rounded-lg" />
      </div>
      <div className="h-7 bg-stone-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-stone-200 rounded w-1/4" />
    </div>
  );
};
