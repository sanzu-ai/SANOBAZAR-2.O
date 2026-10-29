import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { useLanguage } from '../context/LanguageContext';

export default function FeaturedProducts({ products, loading, showAll, error, selectedCategory, activeTab, tabs, onTabChange, onViewAll, onClearCategory }) {
  const { t } = useLanguage();
  return (
    <section id="best-sellers" className="scroll-mt-28 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#901a1c]">{t('Handpicked for you')}</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#302622] sm:text-3xl">{t(tabs.find(tab => tab.id === activeTab)?.label || 'Featured Products')}</h2></div>
        <button type="button" onClick={onViewAll} className="inline-flex items-center gap-1 text-xs font-bold text-[#901a1c] hover:text-[#741416]">{t(showAll ? 'Show fewer products' : 'See all')} <ArrowRight className="h-3.5 w-3.5" /></button>
      </div>
      <div role="tablist" aria-label={t('Product collections')} className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-[#e9dfd4] bg-[#f4eee6] p-1">
        {tabs.map(tab => <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} type="button" onClick={() => onTabChange(tab.id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition sm:text-sm ${activeTab === tab.id ? 'bg-white text-[#901a1c] shadow-sm' : 'text-[#81756d] hover:text-[#302622]'}`}>{t(tab.label)}</button>)}
      </div>
      {selectedCategory !== 'all' && <button type="button" onClick={onClearCategory} className="-mt-2 text-xs font-semibold text-[#901a1c] underline decoration-[#d8b9a8] underline-offset-2">{t('Clear category filter')}</button>}
      {error && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</p>}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <div key={i} className="h-72 animate-pulse rounded-2xl bg-[#eee7dd]" />)}</div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-[#e9dfd5] bg-white p-8 text-center text-sm text-[#716963]">{t('No products are available yet.')}</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {(showAll ? products : products.slice(0, 8)).map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
        </div>
      )}
    </section>
  );
}
