import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Store, CheckCircle } from 'lucide-react';
import { Product } from '../../api/catalogueApi';
import { formatPrice } from '../../lib/formatters';
import { useAppDispatch } from '../../store';
import { addToCart } from '../../store/cartSlice';
import { addToast } from '../../store/toastSlice';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const isOutOfStock = product.stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    dispatch(
      addToCart({
        productId: product.id,
        title: product.title,
        unitPrice: product.price,
        storeName: product.storeName,
        imageUrl: product.imageUrl,
        stock: product.stock,
        qty: 1
      })
    );

    dispatch(
      addToast({
        type: 'success',
        message: `Added "${product.title}" to your cart`
      })
    );
  };

  return (
    <div className="group bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-md card-hover flex flex-col h-full">
      <Link to={`/products/${product.id}`} className="block relative aspect-[4/3] overflow-hidden bg-stone-100">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-sm text-stone-800 shadow-sm border border-stone-200/50">
            {product.category}
          </span>
        </div>
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow">
              Out of Stock
            </span>
          </div>
        ) : product.stock <= 5 ? (
          <div className="absolute bottom-2.5 right-2.5">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-sm">
              Only {product.stock} left!
            </span>
          </div>
        ) : null}
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        {/* Store snapshot badge */}
        <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5 font-medium">
          <Store className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
          <span className="truncate">{product.storeName}</span>
          <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
        </div>

        <Link to={`/products/${product.id}`} className="group-hover:text-brand-600 transition-colors">
          <h3 className="font-semibold text-stone-900 line-clamp-1 text-sm tracking-tight mb-1">
            {product.title}
          </h3>
        </Link>
        <p className="text-xs text-stone-500 line-clamp-2 mb-3 flex-grow">
          {product.description}
        </p>

        <div className="mt-auto pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-400 block font-medium">Price</span>
            <span className="text-base font-bold text-stone-900">
              {formatPrice(product.price)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-brand-600 text-white hover:bg-brand-700 active:scale-95 shadow-sm hover:shadow'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
