import { HelpCircle, Languages, PackageCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function AnnouncementBar() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="bg-[#15243b] text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-1.5 px-4 py-2 text-[10px] sm:flex-row sm:justify-between sm:gap-3 sm:px-6 sm:py-2 sm:text-[11px] lg:px-8">
        <p className="flex items-center justify-center gap-2 whitespace-nowrap font-medium sm:justify-start">
          <Truck aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-blue-300" />
          <span className="sm:hidden">{t('Free shipping over NPR 2,000')}</span>
          <span className="hidden sm:inline">{t('Free Shipping on Orders Over NPR 2,000')}</span>
        </p>
        <nav aria-label={t('Utility navigation')} className="grid w-full grid-cols-3 items-center justify-items-center gap-1 text-[10px] sm:flex sm:w-auto sm:justify-end sm:gap-4 sm:text-[11px]">
          <Link className="flex min-h-8 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded px-1.5 transition-colors hover:bg-white/10 hover:text-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-300 sm:min-h-0 sm:w-auto sm:rounded-none sm:px-0 sm:hover:bg-transparent" to="/track-order"><PackageCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />{t('Track Order')}</Link>
          <Link className="flex min-h-8 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded px-1.5 transition-colors hover:bg-white/10 hover:text-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-300 sm:min-h-0 sm:w-auto sm:rounded-none sm:px-0 sm:hover:bg-transparent" to="/contact"><HelpCircle aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />{t('Help')}</Link>
          <label className="flex min-h-8 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded px-1.5 sm:min-h-0 sm:w-auto sm:rounded-none sm:px-0">
            <Languages aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            <select aria-label={t('Language')} value={language} onChange={event => setLanguage(event.target.value)} className="cursor-pointer bg-transparent text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-blue-300">
              <option value="en" className="text-slate-900">{t('English')}</option>
              <option value="ne" className="text-slate-900">{t('नेपाली')}</option>
            </select>
          </label>
        </nav>
      </div>
    </div>
  );
}
