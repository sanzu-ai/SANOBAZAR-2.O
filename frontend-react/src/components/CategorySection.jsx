import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const categoryArt = [
  { match: /electronic|technology|gadget/i, image: 'photo-1519389950473-47ba0277781c' },
  { match: /fashion|clothing|apparel/i, image: 'photo-1490481651871-ab68de25d43d' },
  { match: /home|living|furniture/i, image: 'photo-1555041469-a586c61ea9bc' },
  { match: /grocer|food/i, image: 'photo-1542838132-92c53300491e' },
  { match: /beauty|health|wellness/i, image: 'photo-1556228720-195a672e8a03' },
  { match: /book|stationery/i, image: 'photo-1544716278-ca5e3f4abd8c' },
  { match: /accessor|bag|craft|gift/i, image: 'photo-1553062407-98eeb64c6a62' }
];
const fallbackArt = 'photo-1490481651871-ab68de25d43d';

export default function CategorySection({ categories, categoryCounts = {}, onSelectCategory }) {
  const { t } = useLanguage();
  return (
    <section id="categories" className="scroll-mt-28 space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#901a1c]">{t('Find your next favorite')}</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#302622] sm:text-3xl">{t('Browse categories')}</h2>
        </div>
        <Link to="/categories" className="inline-flex items-center gap-1 pb-1 text-xs font-bold text-[#901a1c] hover:text-[#741416]">{t('View all')}<ArrowRight className="h-3.5 w-3.5"/></Link>
      </div>
      {categories.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {categories.map(category => {
            const image = categoryArt.find(item => item.match.test(category.category_name || ''))?.image || fallbackArt;
            const count = categoryCounts[String(category.id)] || 0;
            return (
              <button key={category.id} type="button" onClick={() => onSelectCategory(category.id)} className="group relative aspect-[1.12] overflow-hidden rounded-[20px] bg-[#e9e1d8] text-left transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#901a1c] focus-visible:ring-offset-2">
                <img src={`https://images.unsplash.com/${image}?auto=format&fit=crop&w=700&q=82`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#201815]/80 via-[#201815]/15 to-transparent" />
                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#302622] shadow-sm transition group-hover:bg-[#901a1c] group-hover:text-white"><ArrowRight size={15}/></span>
                <span className="absolute inset-x-3 bottom-3 text-white sm:inset-x-4 sm:bottom-4">
                  <span className="block truncate text-xs font-extrabold sm:text-sm">{t(category.category_name)}</span>
                  <span className="mt-1 block text-[10px] font-medium text-white/80 sm:text-[11px]">{count} {t('items')}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="rounded-2xl border border-[#e9dfd5] bg-white p-5 text-sm text-[#716963]">{t('Categories will appear here when the catalog is available.')}</p>
      )}
    </section>
  );
}
