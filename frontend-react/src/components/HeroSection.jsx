import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, Pause, Play, ShoppingBag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const fallbackImages = [
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=85',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=85',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=85'
];
const homeFallbackImages = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=500&q=85',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=85',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=500&q=85'
];

const campaigns = [
  {
    eyebrow: 'YOUR ONE STOP ONLINE STORE',
    title: 'Shop Smarter. Live Better.',
    accent: 'Everyday essentials',
    description: 'Discover useful finds for your home, work, and everyday life.'
  },
  {
    eyebrow: 'TECH FOR EVERY DAY',
    title: 'Upgrade your routine.',
    accent: 'Find your next gadget',
    description: 'Explore headphones, speakers, smart devices, and more from the live catalog.'
  },
  {
    eyebrow: 'GOOD FINDS, ALL IN ONE PLACE',
    title: 'Make home feel better.',
    accent: 'Shop home & living',
    description: 'Browse practical picks for your space, style, and daily needs.'
  }
];

const campaignBackgrounds = [
  'from-[#eaf1f9] via-[#eef4fb] to-[#dceaff]',
  'from-[#e8f5f2] via-[#f4faf8] to-[#d8eee9]',
  'from-[#fff3e5] via-[#fff9f1] to-[#fce7ca]'
];

export default function HeroSection({ products = [] }) {
  const { t } = useLanguage();
  const [activeCampaign, setActiveCampaign] = useState(0);
  const [paused, setPaused] = useState(false);
  const campaign = campaigns[activeCampaign];
  const campaignProducts = activeCampaign === 1
    ? products.filter(product => /electronics|accessor/i.test(product.category || ''))
    : activeCampaign === 2
      ? products.filter(product => /home|living/i.test(product.category || ''))
      : products;
  const firstImage = activeCampaign * 3;
  const fallback = activeCampaign === 2 ? homeFallbackImages : fallbackImages;
  const images = campaignProducts.length >= 3
    ? Array.from({ length: 4 }, (_, index) => campaignProducts[(firstImage + index) % campaignProducts.length]?.image_url || fallback[index])
    : fallback;

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = window.setInterval(() => {
      setActiveCampaign(current => (current + 1) % campaigns.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused]);

  const showCampaign = index => setActiveCampaign((index + campaigns.length) % campaigns.length);

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br ${campaignBackgrounds[activeCampaign]}`}>
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/50 blur-3xl" />
      <div className="relative mx-auto grid min-h-[390px] max-w-7xl items-center gap-3 px-5 py-9 sm:px-8 md:min-h-[430px] md:grid-cols-[0.88fr_1.12fr] md:py-12 lg:px-12">
        <div key={campaign.title} className="relative z-10 max-w-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1766d1] shadow-sm">
            <BadgeCheck className="h-3.5 w-3.5" /> {t(campaign.eyebrow)}
          </div>
          <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-[#17263d] sm:text-5xl lg:text-[54px]">
            {t(campaign.title)}<br />
            <span className="text-[#1766d1]">{t(campaign.accent)}</span>
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 sm:text-[15px]">{t(campaign.description)}</p>
          <a href="#best-sellers" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1766d1] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#0d54b4]">
            <ShoppingBag className="h-4 w-4" /> {t('Shop Now')} <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="relative mx-auto h-[245px] w-full max-w-[570px] sm:h-[290px] md:h-[340px]" aria-live="polite">
          <div className="absolute inset-x-8 bottom-3 h-20 rounded-[50%] bg-blue-900/10 blur-2xl" />
          <div className="absolute right-[20%] top-[3%] h-[76%] w-[56%] overflow-hidden rounded-2xl border-[7px] border-[#17263d] bg-white shadow-2xl sm:right-[22%]">
            <img key={images[2]} src={images[2]} alt="" className="h-full w-full object-cover transition duration-700" />
            <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-slate-400 via-white to-slate-400" />
          </div>
          <div className="absolute bottom-[7%] left-[4%] h-[57%] w-[29%] rotate-[-5deg] overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl">
            <img key={images[0]} src={images[0]} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700" />
          </div>
          <div className="absolute bottom-[8%] left-[27%] h-[43%] w-[33%] rotate-[5deg] overflow-hidden rounded-[28px] border-4 border-white bg-white shadow-xl">
            <img key={images[1]} src={images[1]} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700" />
          </div>
          <div className="absolute bottom-[10%] right-[5%] h-[47%] w-[27%] rotate-[4deg] overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl">
            <img key={images[3]} src={images[3]} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700" />
          </div>
          <div className="absolute right-[2%] top-[3%] hidden rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{t('Shop local')}</p>
            <p className="text-sm font-extrabold text-[#17263d]">{t('Made for Nepal')} <span aria-hidden="true">🇳🇵</span></p>
          </div>
        </div>

        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 md:bottom-5">
          {campaigns.map((item, index) => <button key={item.title} type="button" onClick={() => showCampaign(index)} aria-label={`${t('Show campaign')} ${index + 1}`} aria-current={activeCampaign === index ? 'true' : undefined} className={`h-2.5 rounded-full transition-all ${activeCampaign === index ? 'w-7 bg-[#1766d1]' : 'w-2.5 bg-slate-400/50 hover:bg-slate-500'}`} />)}
          <button type="button" onClick={() => setPaused(value => !value)} aria-label={t(paused ? 'Play campaigns' : 'Pause campaigns')} className="ml-2 rounded-full bg-white/70 p-2 text-slate-700 shadow-sm hover:bg-white">
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>
        </div>
        <button type="button" onClick={() => showCampaign(activeCampaign - 1)} aria-label={t('Previous campaign')} className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/75 p-2.5 text-slate-600 shadow-sm transition hover:bg-white md:block"><ArrowLeft className="h-4 w-4" /></button>
        <button type="button" onClick={() => showCampaign(activeCampaign + 1)} aria-label={t('Next campaign')} className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/75 p-2.5 text-slate-600 shadow-sm transition hover:bg-white md:block"><ArrowRight className="h-4 w-4" /></button>
      </div>
    </section>
  );
}
