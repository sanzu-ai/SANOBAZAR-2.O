import { Headphones, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const benefits = [
  { title: 'Free Shipping', detail: 'On orders over NPR 2,000', Icon: Truck },
  { title: 'Secure Payments', detail: 'Safe checkout experience', Icon: ShieldCheck },
  { title: 'Customer Support', detail: 'We are here to help', Icon: Headphones },
  { title: 'Easy Returns', detail: 'Hassle-free returns', Icon: RotateCcw }
];

export default function ServiceBenefits() {
  const { t } = useLanguage();
  return (
    <section aria-label={t('Shopping benefits')} className="rounded-[28px] border border-[#e9dfd5] bg-white px-4 py-8 sm:px-7 sm:py-10">
      <div className="mb-7 text-center"><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#901a1c]">{t('Here for your everyday')}</p><h2 className="mt-2 text-2xl font-black tracking-tight text-[#302622] sm:text-3xl">{t('Why shop with Sano Bazar?')}</h2></div>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-2 gap-y-6 md:grid-cols-4">
        {benefits.map(({ title, detail, Icon }, index) => (
          <div key={title} className={`flex flex-col items-center px-2 text-center md:px-4 ${index > 0 ? 'md:border-l md:border-[#eee5dc]' : ''}`}>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f9eeee] text-[#901a1c]"><Icon className="h-5 w-5" strokeWidth={1.8} /></span>
            <h3 className="mt-3 text-xs font-extrabold text-[#302622] sm:text-sm">{t(title)}</h3>
            <p className="mt-1 max-w-[190px] text-[10px] leading-5 text-[#716963] sm:text-xs">{t(detail)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
