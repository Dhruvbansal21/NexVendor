import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Store,
  CheckCircle,
  ShoppingCart,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react';
import { useGetProductQuery } from '../api/catalogueApi';
import { formatPrice } from '../lib/formatters';
import { useAppDispatch } from '../store';
import { addToCart } from '../store/cartSlice';
import { addToast } from '../store/toastSlice';
import { ErrorState } from '../components/common/ErrorState';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const [qty, setQty] = useState(1);

  const { data, isLoading, isError, error, refetch } = useGetProductQuery(id || '', {
    skip: !id
  });

  const product = data?.data;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="h-4 bg-stone-200 rounded w-28 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-[4/3] bg-stone-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-stone-200 rounded w-3/4" />
            <div className="h-4 bg-stone-200 rounded w-1/3" />
            <div className="h-8 bg-stone-200 rounded w-1/4 my-6" />
            <div className="h-20 bg-stone-200 rounded w-full" />
            <div className="h-12 bg-stone-200 rounded-xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <ErrorState
          title="Product Not Found"
          message="This product does not exist, has been removed, or belongs to a vendor currently pending review."
          code={(error as any)?.data?.error?.code || '404_NOT_FOUND'}
          onRetry={refetch}
        />
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to catalogue</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    dispatch(
      addToCart({
        productId: product.id,
        title: product.title,
        unitPrice: product.price,
        storeName: product.storeName,
        imageUrl: product.imageUrl,
        stock: product.stock,
        qty
      })
    );
    dispatch(
      addToast({
        type: 'success',
        message: `Added ${qty} item(s) to your cart!`
      })
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 bg-white rounded-3xl border border-stone-200/80 p-6 md:p-10 shadow-sm">
        {/* Product Image */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 border border-stone-100">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
            }}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-rose-600 text-white font-bold text-sm px-4 py-1.5 rounded-full uppercase tracking-wider shadow">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info & Actions */}
        <div className="flex flex-col">
          <div className="mb-4">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200/50 mb-3">
              {product.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight leading-snug">
              {product.title}
            </h1>
          </div>

          {/* Store Snapshot Information */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-50 border border-stone-100 mb-6">
            <Store className="w-4 h-4 text-brand-600" />
            <div className="flex items-center gap-1.5 text-xs text-stone-700 font-medium">
              <span>Sold by:</span>
              <strong className="font-bold text-stone-900">{product.storeName}</strong>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </div>

          {/* Price & Stock */}
          <div className="mb-6">
            <span className="text-xs font-semibold text-stone-400 block mb-1 uppercase tracking-wider">
              Price (Server Verified)
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-stone-900">
                {formatPrice(product.price)}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  isOutOfStock
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {isOutOfStock ? 'Unavailable' : `${product.stock} units available`}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="mt-auto space-y-4 pt-6 border-t border-stone-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 p-1">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1 || isOutOfStock}
                  className="w-8 h-8 flex items-center justify-center font-bold text-stone-600 hover:bg-white rounded-lg transition disabled:opacity-40"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-bold text-stone-900">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  disabled={qty >= product.stock || isOutOfStock}
                  className="w-8 h-8 flex items-center justify-center font-bold text-stone-600 hover:bg-white rounded-lg transition disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm ${
                  isOutOfStock
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    : 'bg-brand-600 text-white hover:bg-brand-700 active:scale-95 shadow-brand-500/20'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Shopping Cart'}</span>
              </button>
            </div>

            {/* Feature Perks */}
            <div className="grid grid-cols-3 gap-2 pt-4 text-[11px] text-stone-500 text-center">
              <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-stone-50">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                <span>Verified store</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-stone-50">
                <Truck className="w-3.5 h-3.5 text-brand-600" />
                <span>Tracked delivery</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-stone-50">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                <span>Easy returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
