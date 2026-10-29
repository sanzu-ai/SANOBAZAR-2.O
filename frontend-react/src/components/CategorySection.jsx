import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const categoryArt = [
  { match: /electronic|technology/i, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=700&q=85', wash: 'from-sky-100 to-blue-50' },
  { match: /accessor|fashion/i, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85', wash: 'from-amber-100 to-orange-50' },
  { match: /grocer|food/i, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=85', wash: 'from-emerald-100 to-teal-50' },
  { match: /home|living|furniture/i, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=85', wash: 'from-rose-100 to-pink-50' },
  { match: /book|stationery/i, image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=85', wash: 'from-violet-100 to-indigo-50' },
  { match: /beauty|health|wellness/i, image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=85', wash: 'from-cyan-100 to-sky-50' }
];

export default function CategorySection({ categories, onSelectCategory }) {
  const { t } = useLanguage();
  return (
    <section id="categories" className="scroll-mt-28 space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1766d1]">{t('Find your next favorite')}</p><h2 className="mt-1 text-xl font-black tracking-tight text-[#17263d] sm:text-2xl">{t('Shop by Category')}</h2></div>
        <a href="#best-sellers" className="hidden items-center gap-1 text-xs font-bold text-[#1766d1] hover:text-blue-800 sm:inline-flex">{t('View Products')} <ArrowRight className="h-3.5 w-3.5" /></a>
      </div>
      {categories.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category, index) => {
            const art = categoryArt.find(item => item.match.test(category.category_name || '')) || categoryArt[index % categoryArt.length];
            return (
              <button key={category.id} type="button" onClick={() => onSelectCategory(category.id)} className={`group overflow-hidden rounded-xl bg-gradient-to-br ${art.wash} text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}>
                <div className="h-28 overflow-hidden sm:h-32"><img src={art.image} alt="" loading="lazy" className="h-full w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105" /></div>
                <div className="bg-white/70 px-3 pb-3 pt-2 text-center backdrop-blur-sm">
                  <h3 className="truncate text-xs font-extrabold text-[#17263d] sm:text-sm">{t(category.category_name)}</h3>
                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[#1766d1]">{t('Shop Now')} <ArrowRight className="h-3 w-3" /></span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="rounded-xl border border-slate-100 bg-white p-5 text-sm text-slate-500">{t('Categories will appear here when the catalog is available.')}</p>
      )}
    </section>
  );
}
