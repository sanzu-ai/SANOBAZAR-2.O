import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function FeaturedProducts({ products, loading, showAll, error, selectedCategory, onViewAll, onClearCategory }) {
  return (
    <section id="best-sellers" className="scroll-mt-28 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1766d1]">From the live catalog</p><h2 className="mt-1 text-xl font-black tracking-tight text-[#17263d] sm:text-2xl">Featured Products</h2></div>
        <button type="button" onClick={onViewAll} className="inline-flex items-center gap-1 text-xs font-bold text-[#1766d1] hover:text-blue-800">{showAll ? 'Show Best Sellers' : 'View All Products'} <ArrowRight className="h-3.5 w-3.5" /></button>
      </div>
      {selectedCategory !== 'all' && <button type="button" onClick={onClearCategory} className="-mt-2 text-xs font-semibold text-slate-500 underline decoration-slate-300 underline-offset-2">Clear category filter</button>}
      {error && <p role="status" className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</p>}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-100" />)}</div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">No products are available yet.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {(showAll ? products : products.slice(0, 6)).map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </section>
  );
}
