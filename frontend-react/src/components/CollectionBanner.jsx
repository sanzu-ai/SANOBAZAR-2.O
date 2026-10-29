import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function CollectionBanner({ categories = [] }) {
  const { t } = useLanguage();
  const homeCategory = categories.find(category => /home|living/i.test(category.category_name || ''));
  const categoryHref = homeCategory ? `/shop?category=${encodeURIComponent(homeCategory.id)}` : '/shop';

  return <section className="overflow-hidden rounded-[28px] border border-[#eadfd3] bg-[#f3ece2]">
    <div className="grid min-h-[270px] md:grid-cols-[1fr_.95fr]">
      <div className="flex flex-col items-start justify-center px-6 py-8 sm:px-9 sm:py-10 lg:px-12">
        <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#901a1c]"><Sparkles size={14}/>{t('The Sano Bazar edit')}</p>
        <h2 className="mt-3 max-w-xl text-3xl font-black leading-tight tracking-[-.04em] text-[#302622] sm:text-4xl">{t('Small things that make home feel more like yours.')}</h2>
        <p className="mt-3 max-w-lg text-sm leading-6 text-[#716963]">{t('Explore useful home and living finds, everyday essentials, and thoughtful pieces for the spaces you love.')}</p>
        <Link to={categoryHref} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#901a1c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#741416]">{t('Explore Home & Living')}<ArrowRight size={16}/></Link>
      </div>
      <div className="relative min-h-[220px] overflow-hidden md:min-h-full">
        <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=88" alt={t('Warm and naturally styled living room')} loading="lazy" className="absolute inset-0 h-full w-full object-cover"/>
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#f3ece2]/25 via-transparent to-[#201815]/10"/>
        <span className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold text-[#514640] shadow-sm">{t('Everyday living')}</span>
      </div>
    </div>
  </section>;
}
