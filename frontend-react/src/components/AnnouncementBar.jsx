import { HelpCircle, PackageCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { storeContact } from '../config/storeContact';

export default function AnnouncementBar() {
  const { t } = useLanguage();

  return (
    <div className="bg-[#901a1c] text-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-2.5 sm:px-6 lg:px-8 xl:min-h-11 xl:flex-row xl:items-center xl:justify-between xl:gap-5 xl:py-1.5">
        <p className="flex items-center justify-center gap-2 text-[10px] font-medium sm:text-[11px] xl:justify-start">
          <Truck aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#f2c46d]" />
          {t('Free Shipping on Orders Over NPR 2,000')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 xl:justify-end xl:gap-x-4">
          <nav aria-label={t('Store information links')} className="hidden items-center gap-3 text-[10px] font-medium sm:flex sm:text-[11px] xl:gap-4">
            <Link className="whitespace-nowrap transition hover:text-[#f2c46d]" to="/shop">{t('What We Sell')}</Link>
            <Link className="whitespace-nowrap transition hover:text-[#f2c46d]" to="/emi-calculator">{t('EMI')}</Link>
          </nav>

          <span aria-hidden="true" className="hidden h-4 w-px bg-white/25 xl:block" />

          <nav aria-label={t('Utility navigation')} className="flex items-center gap-3 text-[10px] sm:gap-4 sm:text-[11px]">
            <Link className="flex items-center gap-1 whitespace-nowrap transition hover:text-[#f2c46d]" to="/track-order"><PackageCheck aria-hidden="true" className="h-3.5 w-3.5" />{t('Track Order')}</Link>
            <Link className="flex items-center gap-1 whitespace-nowrap transition hover:text-[#f2c46d]" to="/help"><HelpCircle aria-hidden="true" className="h-3.5 w-3.5" />{t('Help')}</Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
