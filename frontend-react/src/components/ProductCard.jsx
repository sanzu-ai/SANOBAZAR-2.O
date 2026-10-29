import { ShoppingBag, AlertCircle, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { formatNPR } from '../lib/currency';
import { useLanguage } from '../context/LanguageContext';

const productImageTones = ['bg-[#f5f1eb]', 'bg-[#f8f4ed]', 'bg-[#f1f3ef]', 'bg-[#f5f2ef]'];

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity < 5;
  const isOutOfStock = product.stock_quantity <= 0;
  const imageTone = productImageTones[index % productImageTones.length];
  const rating = Number(product.rating || 0);
  const reviewCount = Number(product.review_count || 0);
  const detailUrl = `/product/${product.id}-${String(product.name || 'product').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[#e9dfd5] bg-white shadow-[0_5px_20px_rgba(48,38,34,.035)] transition duration-300 hover:-translate-y-1 hover:border-[#d7b8b0] hover:shadow-[0_15px_35px_rgba(48,38,34,.10)]">
      <div className={`relative aspect-square overflow-hidden ${imageTone}`}>
        <Link to={detailUrl} aria-label={`${t('View')} ${t(product.name)}`} className="block h-full w-full"><img
          src={product.image_url}
          alt={product.name}
          onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/product-placeholder.svg'; }}
          className="h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-[1.04] sm:p-6"
          loading="lazy"
        /></Link>
        <span className="absolute left-3 top-3 max-w-[calc(100%-4.5rem)] truncate rounded-md border border-white/80 bg-white/90 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#716963] shadow-sm backdrop-blur sm:text-[10px]">
          {t(product.category_name || product.category)}
        </span>

        {isLowStock && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 ring-1 ring-rose-100">
            <AlertCircle className="h-3 w-3" /> {t('Only')} {product.stock_quantity} {t('left')}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div>
          <div className="flex min-h-10 items-start justify-between gap-2">
            <Link to={detailUrl} className="line-clamp-2 text-[13px] font-semibold leading-5 text-[#302622] transition-colors hover:text-[#901a1c] sm:text-sm">{t(product.name)}</Link>
            <span className="shrink-0 whitespace-nowrap text-xs font-extrabold text-[#302622] sm:text-sm">{formatNPR(product.price)}</span>
          </div>
          {reviewCount > 0 && rating > 0 ? <div className="mt-1 flex items-center gap-1 text-[#d09a38]">{[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`h-3 w-3 ${star <= Math.round(rating) ? 'fill-current' : ''}`} />)}<span className="ml-1 text-[10px] font-medium text-[#81756d]">{rating.toFixed(1)} ({reviewCount})</span></div> : <p className="mt-1 text-[10px] text-[#81756d]">{isOutOfStock ? t('Out of Stock') : t('Available now')}</p>}
        </div>

        <div className="mt-3">
          <button
            onClick={() => addToCart(product)}
            disabled={isOutOfStock}
            className={`flex w-full items-center justify-center gap-2 rounded-full px-3 py-2.5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#901a1c] focus-visible:ring-offset-2 ${
              isOutOfStock
                ? 'cursor-not-allowed border border-[#e9dfd5] bg-[#f2ede5] text-[#a69a8f]'
                : 'border border-[#901a1c] bg-[#901a1c] text-white hover:border-[#741416] hover:bg-[#741416] active:scale-[.99]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {isOutOfStock ? t('Out of Stock') : t('Add to Cart')}
          </button>
        </div>
      </div>

    </div>
  );
}
