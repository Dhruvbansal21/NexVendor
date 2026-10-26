import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, SlidersHorizontal, Layers, ShoppingBag, ArrowUpDown } from 'lucide-react';
import { useGetProductsQuery, useGetCategoriesQuery } from '../api/catalogueApi';
import { ProductCard } from '../components/common/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = Number(searchParams.get('page')) || 1;
  const currentSort = searchParams.get('sort') || '-createdAt';

  const { data: categoriesData } = useGetCategoriesQuery();
  const {
    data: productsData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch
  } = useGetProductsQuery({
    category: currentCategory || undefined,
    search: currentSearch || undefined,
    page: currentPage,
    limit: 8,
    sort: currentSort
  });

  const handleCategorySelect = (category: string) => {
    const next = new URLSearchParams(searchParams);
    if (category) {
      next.set('category', category);
    } else {
      next.delete('category');
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', e.target.value);
    next.set('page', '1');
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = categoriesData?.data || [];
  const products = productsData?.data || [];
  const total = productsData?.total || 0;
  const totalPages = Math.ceil(total / 8) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-900 via-indigo-900 to-slate-900 text-white p-8 md:p-12 mb-10 shadow-lg">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BEE-II Evaluation Live Demonstration</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            A Multi-Vendor Marketplace on Microservices.
          </h1>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-6">
            Shop directly from verified independent vendors. Every product comes live from MongoDB through our API Gateway with real-time stock reservation and sub-order splitting.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 backdrop-blur-sm">
              ✨ 4 Separate MongoDB Databases
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 backdrop-blur-sm">
              🛡️ Verified Vendors Only
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 backdrop-blur-sm">
              ⚡ Idempotent Checkout Mini-Saga
            </span>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => handleCategorySelect('')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              !currentCategory
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.category}
              onClick={() => handleCategorySelect(c.category)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                currentCategory === c.category
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{c.category}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  currentCategory === c.category
                    ? 'bg-brand-700 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {c.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={currentSort}
            onChange={handleSortChange}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:border-brand-500"
          >
            <option value="-createdAt">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Search Header if active */}
      {currentSearch && (
        <div className="mb-6 p-3 rounded-xl bg-slate-100 flex items-center justify-between text-xs text-slate-700">
          <span>
            Search results for: <strong className="font-bold">"{currentSearch}"</strong>
          </span>
          <button
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.delete('search');
              setSearchParams(next);
            }}
            className="text-brand-600 font-semibold hover:underline"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Products Grid */}
      {isLoading || isFetching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Unable to load products from Catalogue Service"
          message={(error as any)?.data?.error?.message || 'Check if the backend services are running'}
          code={(error as any)?.data?.error?.code}
          onRetry={refetch}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="There are currently no verified active products matching your selection."
          actionText="Clear all filters"
          onAction={() => setSearchParams({})}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                      currentPage === pageNum
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
