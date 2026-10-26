import { ShoppingBag, AlertCircle, Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { formatNPR } from '../lib/currency';

export default function ProductCard({ product }) {
  const { addToCart, wishlistIds, toggleWishlist } = useCart();
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity < 5;
  const isOutOfStock = product.stock_quantity <= 0;
  const isWishlisted = wishlistIds.includes(product.id);
  const rating = Number(product.rating || 0);
  const reviewCount = Number(product.review_count || 0);
  const detailUrl = `/product/${product.id}-${String(product.name || 'product').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
      
      {/* Image Container with Hover Zoom */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
        <Link to={detailUrl} aria-label={`View ${product.name}`} className="block h-full w-full"><img
          src={product.image_url}
          alt={product.name}
          onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/favicon.svg'; }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        /></Link>
        {/* Category Tag */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-700 text-[11px] font-bold px-2.5 py-1 rounded-md border border-gray-200 shadow-sm">
          {product.category_name || product.category}
        </span>

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={isWishlisted}
          className="absolute right-3 top-3 rounded-full bg-white/95 p-2 text-gray-500 shadow-sm transition hover:scale-105 hover:text-rose-600"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Low Stock Warning Badge */}
        {isLowStock && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-bounce">
            <AlertCircle className="w-3 h-3" /> Only {product.stock_quantity} left
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link to={detailUrl} className="mb-1 line-clamp-2 text-sm font-bold text-gray-900 transition-colors hover:text-[#087f5b]">{product.name}</Link>
          {reviewCount > 0 && rating > 0 ? <div className="mt-2 flex items-center gap-1 text-amber-500">{[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`h-3 w-3 ${star <= Math.round(rating) ? 'fill-current' : ''}`} />)}<span className="ml-1 text-[10px] font-medium text-gray-500">{rating.toFixed(1)} ({reviewCount})</span></div> : <p className="mt-2 text-[10px] text-gray-400">No reviews yet</p>}
          <p className="mt-1 text-lg font-extrabold text-[#087f5b]">{formatNPR(product.price)}</p>
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <button
            onClick={() => addToCart(product)}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#069bf1] hover:bg-blue-600 text-white shadow-md active:scale-95'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

    </div>
  );
}
