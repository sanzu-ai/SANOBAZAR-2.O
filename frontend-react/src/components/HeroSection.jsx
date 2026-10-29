import { ArrowRight, Headphones, PackageCheck, ShoppingBag, Sparkles, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const promos = [
  {
    kind: 'product',
    eyebrow: 'Everyday essentials',
    title: 'Smart finds for daily life.',
    description: 'Useful picks for your home, work, and everything in between.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=85',
    imageAlt: 'Everyday electronics and work essentials',
    href: '/shop?category=Electronics',
    specs: [
      { label: 'Everyday finds', Icon: ShoppingBag },
      { label: 'Easy ordering', Icon: PackageCheck },
      { label: 'Free delivery over NPR 2,000', Icon: Truck },
      { label: 'Here to help', Icon: Headphones }
    ]
  },
  {
    kind: 'photo',
    eyebrow: 'New arrivals',
    title: 'A little something for every day.',
    description: 'Explore fresh finds from the Sano Bazar catalog.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=88',
    imageAlt: 'Warm, naturally styled living room',
    href: '/shop'
  },
  {
    kind: 'interest',
    eyebrow: 'Find your next favourite',
    title: 'Good things are closer than you think.',
    description: 'Create an account to keep your orders and saved products together.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85',
    imageAlt: 'A simple everyday wristwatch',
    href: '/register'
  }
];

function ProductPromo({ promo, t }) {
  return <Link to={promo.href} className="group relative flex min-h-[420px] flex-col overflow-hidden rounded-[24px] bg-[#f0efec] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7">
    <div className="relative z-10 max-w-[300px]">
      <p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#8a3940]">{t(promo.eyebrow)}</p>
      <h2 className="mt-3 text-[28px] font-extrabold leading-[1.08] tracking-[-.04em] text-[#261f1c] sm:text-[32px]">{t(promo.title)}</h2>
      <p className="mt-3 max-w-[270px] text-sm leading-6 text-[#716963]">{t(promo.description)}</p>
    </div>
    <div className="relative z-10 mt-5 grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-4 sm:gap-2">
      {promo.specs.map(({ label, Icon }) => <span key={label} className="flex min-w-0 items-center gap-1.5 text-[10px] font-medium leading-4 text-[#5f5650] sm:flex-col sm:items-start sm:gap-1">
        <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-[#901a1c]" />
        <span className="line-clamp-1">{t(label)}</span>
      </span>)}
    </div>
    <div className="relative mt-auto flex h-44 items-end justify-center overflow-hidden sm:h-48">
      <img src={promo.image} alt={promo.imageAlt} className="h-full w-full object-contain object-bottom transition duration-700 ease-out group-hover:scale-105" fetchPriority="high" />
    </div>
    <span className="absolute bottom-5 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#901a1c] shadow-sm transition group-hover:translate-x-1"><ArrowRight aria-hidden="true" className="h-4 w-4" /></span>
  </Link>;
}

function PhotoPromo({ promo, t }) {
  return <Link to={promo.href} className="group relative isolate flex min-h-[420px] flex-col justify-end overflow-hidden rounded-[24px] bg-[#554a3e] p-6 text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7">
    <img src={promo.image} alt={promo.imageAlt} className="absolute inset-0 -z-20 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105" />
    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#211712]/85 via-[#211712]/20 to-transparent" />
    <span className="absolute left-6 top-6 rounded-full bg-[#901a1c] px-4 py-2 text-[10px] font-bold uppercase tracking-[.12em] text-white sm:left-7 sm:top-7">{t(promo.eyebrow)}</span>
    <div className="max-w-[310px]">
      <h2 className="text-[29px] font-extrabold leading-[1.08] tracking-[-.04em] sm:text-[34px]">{t(promo.title)}</h2>
      <p className="mt-3 text-sm leading-6 text-white/85">{t(promo.description)}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">{t('Explore the shop')} <ArrowRight aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-1" /></span>
    </div>
  </Link>;
}

function InterestPromo({ promo, t }) {
  return <Link to={promo.href} className="group relative flex min-h-[420px] flex-col overflow-hidden rounded-[24px] bg-[#eee9e1] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7">
    <div className="relative z-10">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.17em] text-[#8a3940]"><Sparkles aria-hidden="true" className="h-3.5 w-3.5" />{t(promo.eyebrow)}</p>
      <h2 className="mt-3 max-w-[300px] text-[28px] font-extrabold leading-[1.08] tracking-[-.04em] text-[#261f1c] sm:text-[32px]">{t(promo.title)}</h2>
      <p className="mt-3 max-w-[290px] text-sm leading-6 text-[#716963]">{t(promo.description)}</p>
      <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#302622] px-5 py-3 text-xs font-bold text-white transition group-hover:bg-[#901a1c]">{t('Register your interest.')} <ArrowRight aria-hidden="true" className="h-4 w-4" /></span>
    </div>
    <div className="relative mt-auto flex h-44 items-end justify-center overflow-hidden sm:h-48">
      <img src={promo.image} alt={promo.imageAlt} className="h-full w-full object-contain object-bottom transition duration-700 ease-out group-hover:scale-105" />
    </div>
  </Link>;
}

export default function HeroSection() {
  const { t } = useLanguage();

  return <section aria-label={t('Featured promotions')} className="bg-white px-4 pb-7 pt-5 sm:px-6 sm:pb-9 sm:pt-7 lg:px-8">
    <div className="mx-auto grid max-w-[1440px] gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
      {promos.map(promo => {
        if (promo.kind === 'photo') return <PhotoPromo key={promo.kind} promo={promo} t={t} />;
        if (promo.kind === 'interest') return <InterestPromo key={promo.kind} promo={promo} t={t} />;
        return <ProductPromo key={promo.kind} promo={promo} t={t} />;
      })}
    </div>
  </section>;
}
