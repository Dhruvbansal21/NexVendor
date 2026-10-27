import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowUpDown,
  ArrowRight,
  Store,
  PackageCheck,
  HandHeart,
  Leaf,
  Hammer,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
  Tag,
  Search
} from 'lucide-react';
import { useGetProductsQuery, useGetCategoriesQuery } from '../api/catalogueApi';
import { ProductCard } from '../components/common/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Handicrafts: Hammer,
  'Home & Living': Sofa,
  'Fashion & Apparel': Shirt,
  Electronics: Smartphone,
  'Beauty & Wellness': Leaf
};

const CATEGORY_BLURBS: Record<string, string> = {
  Handicrafts: 'Hand-thrown, hand-carved, hand-finished.',
  'Home & Living': 'Pieces that make a room feel lived in.',
  'Fashion & Apparel': 'Small-batch cuts and natural fabrics.',
  Electronics: 'Carefully chosen gear, honestly described.',
  'Beauty & Wellness': 'Short ingredient lists, kind formulas.'
};

const HOW_IT_WORKS = [
  {
    icon: Search,
    title: 'Find the shop, not just the product',
    body: 'Every listing carries the name of the store behind it, so you always know whose work you are buying.'
  },
  {
    icon: PackageCheck,
    title: 'One basket, many sellers',
    body: 'Mix items from several stores. We split your order per shop so each seller packs their own parcel.'
  },
  {
    icon: HandHeart,
    title: 'Your money reaches the maker',
    body: 'No paid placement and no shelf fees. The sellers you see are the ones whose work fits what you searched for.'
  }
];

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

  const scrollToCatalogue = () => {
    document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCategorySelect = (category: string) => {
    const next = new URLSearchParams(searchParams);
    if (category) {
      next.set('category', category);
    } else {
      next.delete('category');
    }
    next.set('page', '1');
    setSearchParams(next);
    scrollToCatalogue();
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
    scrollToCatalogue();
  };

  const categories = categoriesData?.data || [];
  const products = productsData?.data || [];
  const total = productsData?.total || 0;
  const totalPages = Math.ceil(total / 8) || 1;
  const isBrowsingAll = !currentCategory && !currentSearch;

  return (
    <div>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-sand-100 paper-texture border-b border-sand-200">
        <div className="absolute -top-24 -right-24 w-[26rem] h-[26rem] rounded-full bg-brand-200/40 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-sand-300 text-[11px] font-semibold text-brand-700 tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              Independent shops, one checkout
            </span>

            <h1 className="mt-5 font-display text-4xl md:text-5xl lg:text-[3.4rem] leading-[1.08] tracking-tight text-stone-900">
              Things made by people,
              <br className="hidden sm:block" />
              <span className="ink-underline relative z-0 text-brand-700">sold by people.</span>
            </h1>

            <p className="mt-5 text-sm md:text-base text-stone-600 leading-relaxed max-w-xl">
              NexVendor gathers small studios, growers and family-run shops in one place.
              You browse their shelves side by side, fill a single basket, and every store
              you bought from packs your parcel themselves.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={scrollToCatalogue}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold shadow-soft hover:bg-brand-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-sand-100"
              >
                Start browsing
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-stone-800 text-sm font-semibold border border-sand-300 hover:border-stone-400 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150"
              >
                <Store className="w-4 h-4 text-brand-600" />
                Open your own store
              </Link>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-6 max-w-md border-t border-sand-300 pt-6">
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                  On the shelves
                </dt>
                <dd className="mt-1 font-display text-2xl text-stone-900">{total || '—'}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                  Categories
                </dt>
                <dd className="mt-1 font-display text-2xl text-stone-900">
                  {categories.length || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                  Verified stores
                </dt>
                <dd className="mt-1 font-display text-2xl text-stone-900">Only</dd>
              </div>
            </dl>
          </div>

          {/* Image collage */}
          <div className="relative hidden sm:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-8">
                <img
                  src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80"
                  alt="Hand-made ceramic vases on a shelf"
                  className="w-full h-44 object-cover rounded-2xl shadow-lift border border-white/60"
                  loading="lazy"
                />
                <img
                  src="https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=600&auto=format&fit=crop&q=80"
                  alt="A customer carrying a paper shopping bag from a small shop"
                  className="w-full h-56 object-cover rounded-2xl shadow-lift border border-white/60"
                  loading="lazy"
                />
              </div>
              <div className="space-y-4">
                <img
                  src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80"
                  alt="A wall of framed prints from independent artists"
                  className="w-full h-56 object-cover rounded-2xl shadow-lift border border-white/60"
                  loading="lazy"
                />
                <img
                  src="https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&auto=format&fit=crop&q=80"
                  alt="Craft tools and tape laid out on a maker's workbench"
                  className="w-full h-44 object-cover rounded-2xl shadow-lift border border-white/60"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="absolute -bottom-5 left-4 bg-white rounded-xl border border-sand-200 shadow-lift px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-900">Packed by the seller</p>
                <p className="text-[11px] text-stone-500">One parcel per store, every time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Category rail */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="font-display text-2xl text-stone-900 tracking-tight">
                Browse the aisles
              </h2>
              <p className="mt-1 text-xs text-stone-500">
                Each shelf is kept by a different kind of maker.
              </p>
            </div>
            <button
              onClick={scrollToCatalogue}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:gap-2.5 transition-all"
            >
              See everything
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((c) => {
              const Icon = CATEGORY_ICONS[c.category] || Tag;
              const isActive = currentCategory === c.category;
              return (
                <button
                  key={c.category}
                  onClick={() => handleCategorySelect(isActive ? '' : c.category)}
                  className={`group text-left p-4 rounded-2xl border transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.99] ${
                    isActive
                      ? 'bg-brand-600 border-brand-600 shadow-lift'
                      : 'bg-white border-sand-200 hover:border-brand-300 shadow-soft'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-sand-100 text-brand-700 group-hover:bg-brand-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <p
                    className={`text-sm font-semibold tracking-tight ${
                      isActive ? 'text-white' : 'text-stone-900'
                    }`}
                  >
                    {c.category}
                  </p>
                  <p
                    className={`mt-1 text-[11px] leading-relaxed ${
                      isActive ? 'text-white/80' : 'text-stone-500'
                    }`}
                  >
                    {CATEGORY_BLURBS[c.category] || 'A shelf worth a slow look.'}
                  </p>
                  <p
                    className={`mt-3 text-[11px] font-semibold ${
                      isActive ? 'text-white/90' : 'text-brand-700'
                    }`}
                  >
                    {c.count} {c.count === 1 ? 'item' : 'items'}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------- Catalogue */}
      <section id="catalogue" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 scroll-mt-20">
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-sand-200 pb-5">
          <div>
            <h2 className="font-display text-2xl text-stone-900 tracking-tight">
              {currentSearch
                ? `Results for "${currentSearch}"`
                : currentCategory || 'Fresh on the shelves'}
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              {total > 0
                ? `${total} ${total === 1 ? 'item' : 'items'} from verified stores`
                : 'Everything here comes from a store we have checked.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={currentSort}
              onChange={handleSortChange}
              className="text-xs bg-white border border-sand-200 rounded-lg px-2.5 py-2 font-medium text-stone-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="-createdAt">Newest first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="title">A to Z</option>
            </select>
          </div>
        </div>

        {/* Active filters */}
        {(currentCategory || currentSearch) && (
          <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium">Filtered by</span>
            {currentCategory && (
              <button
                onClick={() => handleCategorySelect('')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 font-semibold hover:bg-brand-100 transition"
              >
                {currentCategory}
                <span aria-hidden="true">&times;</span>
              </button>
            )}
            {currentSearch && (
              <button
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.delete('search');
                  setSearchParams(next);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-sand-300 text-stone-700 font-semibold hover:bg-sand-100 transition"
              >
                {currentSearch}
                <span aria-hidden="true">&times;</span>
              </button>
            )}
          </div>
        )}

        {isLoading || isFetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="We could not load the catalogue"
            message={
              (error as any)?.data?.error?.message ||
              'Something went wrong on our side. Give it a moment and try again.'
            }
            code={(error as any)?.data?.error?.code}
            onRetry={refetch}
          />
        ) : products.length === 0 ? (
          <EmptyState
            title="Nothing on this shelf yet"
            description="No products match what you are looking for right now. Try another category, or clear your filters."
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

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3 py-1.5 rounded-lg border border-sand-300 bg-white text-xs font-semibold text-stone-600 hover:bg-sand-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
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
                          ? 'bg-brand-600 text-white shadow-soft'
                          : 'border border-sand-300 bg-white text-stone-600 hover:bg-sand-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 rounded-lg border border-sand-300 bg-white text-xs font-semibold text-stone-600 hover:bg-sand-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* -------------------------------------------------------- How it works */}
      <section className="bg-white border-y border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl md:text-3xl text-stone-900 tracking-tight">
              A marketplace that stays out of the way
            </h2>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">
              Buying from five small shops usually means five carts, five logins and five
              delivery fees. Here it is one basket, and the shops stay the shops.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.title}
                className="relative p-6 rounded-2xl bg-sand-50 border border-sand-200 hover:border-brand-200 transition-colors duration-200"
              >
                <span className="absolute top-5 right-6 font-display text-3xl text-sand-300 select-none">
                  {i + 1}
                </span>
                <div className="w-10 h-10 rounded-xl bg-brand-600/10 text-brand-700 flex items-center justify-center">
                  <step.icon className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-stone-900 tracking-tight pr-8">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs text-stone-600 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Seller invite */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-stone-900 text-white">
          <div className="absolute inset-y-0 right-0 w-1/2 hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&auto=format&fit=crop&q=80"
              alt="An illuminated Open Shop sign in a storefront window"
              className="w-full h-full object-cover opacity-45"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-stone-900/80 to-transparent" />
          </div>

          <div className="relative px-6 sm:px-10 py-12 lg:py-16 max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-300">
              <Store className="w-3.5 h-3.5" />
              For sellers
            </span>
            <h2 className="mt-4 font-display text-2xl md:text-3xl leading-snug tracking-tight">
              If you make it, grow it or restore it, there is a shelf here for you.
            </h2>
            <p className="mt-3 text-sm text-stone-300 leading-relaxed">
              Register your store, send your details in once, and start listing as soon as
              you are verified. You keep your own storefront name, your own prices, and your
              own relationship with the people who buy from you.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-400 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-150"
              >
                Open a store
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 border border-white/15 text-white text-sm font-semibold hover:bg-white/15 transition-all duration-150"
              >
                I already have one
              </Link>
            </div>
          </div>
        </div>
      </section>

      {isBrowsingAll && (
        <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 text-center text-xs text-stone-500">
          New stores join every week. Check back on the shelves you liked.
        </p>
      )}
    </div>
  );
};
