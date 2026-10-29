import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const slides = [
  {
    category: 'Electronics',
    eyebrow: 'The everyday tech edit',
    title: 'Useful technology for the way you live.',
    description: 'Browse phones, audio, computers, and handy accessories from the Sano Bazar catalog.',
    image: 'photo-1519389950473-47ba0277781c',
    imageAlt: 'A tidy everyday technology workspace'
  },
  {
    category: 'Home & Living',
    eyebrow: 'A little more comfort',
    title: 'Make your space feel like home.',
    description: 'Find thoughtful pieces for the rooms and routines you care about.',
    image: 'photo-1600210492486-724fe5c67fb0',
    imageAlt: 'A warm, naturally styled living room'
  },
  {
    category: 'Fashion',
    eyebrow: 'Made for everyday',
    title: 'Comfortable pieces, easy to wear.',
    description: 'Explore clothing, footwear, and everyday accessories in the Sano Bazar collection.',
    image: 'photo-1490481651871-ab68de25d43d',
    imageAlt: 'A curated selection of everyday clothing'
  }
];

export default function CampaignCarousel({ categories = [] }) {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const slide = slides[activeIndex];
  const category = categories.find(item => item.category_name?.toLowerCase() === slide.category.toLowerCase());
  const href = category ? `/shop?category=${encodeURIComponent(category.id)}` : '/shop';
  const move = direction => setActiveIndex(index => (index + direction + slides.length) % slides.length);

  return <section aria-label={t('Featured collections')} className="bg-white px-4 pb-5 pt-5 sm:px-6 sm:pb-7 sm:pt-6 lg:px-8">
    <div className="group relative mx-auto min-h-[330px] max-w-[1440px] overflow-hidden rounded-[28px] bg-[#3b3029] sm:min-h-[390px] lg:min-h-[440px]">
      <img key={slide.image} src={`https://images.unsplash.com/${slide.image}?auto=format&fit=crop&w=2000&q=90`} alt={t(slide.imageAlt)} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover transition duration-700" />
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#201815]/85 via-[#201815]/55 to-[#201815]/5" />
      <div className="relative flex min-h-[330px] flex-col justify-center px-6 py-12 text-white sm:min-h-[390px] sm:px-10 lg:min-h-[440px] lg:px-16">
        <div className="max-w-2xl">
          <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#f4c5b5] sm:text-xs">{t(slide.eyebrow)}</p>
          <h1 className="mt-4 max-w-xl text-4xl font-black leading-[1.02] tracking-[-.045em] sm:text-5xl lg:text-6xl">{t(slide.title)}</h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/85 sm:text-base">{t(slide.description)}</p>
          <Link to={href} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#901a1c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#741416]">{t('Explore collection')}<ArrowRight size={16}/></Link>
        </div>
        <div className="mt-8 flex items-center gap-3 sm:absolute sm:bottom-8 sm:right-10 sm:mt-0 lg:right-16">
          <span className="mr-1 text-xs font-bold tracking-[.14em] text-white/85">0{activeIndex + 1}<span className="mx-2 text-white/40">/</span>0{slides.length}</span>
          {slides.map((item, index) => <button key={item.category} type="button" onClick={() => setActiveIndex(index)} aria-label={`${t('Show slide')} ${index + 1}`} aria-current={activeIndex === index ? 'true' : undefined} className={`h-2 rounded-full transition-all ${activeIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/55 hover:bg-white/85'}`} />)}
          <div className="ml-2 flex gap-2">
            <button type="button" onClick={() => move(-1)} aria-label={t('Previous slide')} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-black/10 text-white transition hover:bg-white hover:text-[#302622]"><ArrowLeft size={16}/></button>
            <button type="button" onClick={() => move(1)} aria-label={t('Next slide')} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-black/10 text-white transition hover:bg-white hover:text-[#302622]"><ArrowRight size={16}/></button>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
