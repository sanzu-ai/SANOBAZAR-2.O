import { Link } from 'react-router-dom';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { storeContact } from '../config/storeContact';

const quickLinks = [['Home','/'],['Shop','/shop'],['Categories','/categories'],['About Us','/about'],['Contact','/contact'],['Blog','/blog']];
const serviceLinks = [['My orders','/account'],['Shipping information','/contact'],['Returns and support','/contact'],['Help center','/contact']];

export default function Footer() {
  const { t } = useLanguage();
  return <footer className="bg-[#15243b] text-slate-200">
    <div className="mx-auto grid max-w-7xl gap-9 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.35fr_.8fr_1fr_1fr] lg:px-8">
      <div><Link to="/" aria-label="Sano Bazar home" className="inline-flex items-center"><img src="/sanobazar-logo-light.svg" alt="" className="h-14 w-auto max-w-[235px] object-contain" /></Link><p className="mt-3 max-w-xs text-xs leading-5 text-slate-400">{t('Discover products for everyday life at Sano Bazar.')}</p></div>
      <div><h2 className="text-xs font-extrabold text-white">{t('Quick Links')}</h2><ul className="mt-3 space-y-2">{quickLinks.map(([label,href])=><li key={label}><Link to={href} className="text-xs text-slate-400 hover:text-white">{t(label)}</Link></li>)}</ul></div>
      <div><h2 className="text-xs font-extrabold text-white">{t('Customer Service')}</h2><ul className="mt-3 space-y-2">{serviceLinks.map(([label,href])=><li key={label}><Link to={href} className="text-xs text-slate-400 hover:text-white">{t(label)}</Link></li>)}</ul></div>
      <div>
        <h2 className="text-xs font-extrabold text-white">{t('Contact')}</h2>
        <ul className="mt-3 space-y-2 text-xs text-slate-400">
          <li className="flex items-center gap-2"><Phone size={13} className="shrink-0"/><a href={storeContact.phoneHref} className="hover:text-white">{storeContact.phone}</a></li>
          <li className="flex items-center gap-2"><MessageCircle size={13} className="shrink-0"/><a href={storeContact.whatsappHref} target="_blank" rel="noreferrer" className="hover:text-white">WhatsApp: {storeContact.whatsapp}</a></li>
          <li className="flex items-center gap-2"><Mail size={13} className="shrink-0"/><a href={`mailto:${storeContact.email}`} className="break-all hover:text-white">{storeContact.email}</a></li>
          <li className="flex items-start gap-2"><MapPin size={13} className="mt-0.5 shrink-0"/><span>{storeContact.address}</span></li>
        </ul>
        <p className="mt-3 text-xs text-slate-400">{t(storeContact.businessDays)}, {storeContact.openingTime} – {storeContact.closingTime}</p>
        <div className="mt-3 flex flex-wrap gap-3">{storeContact.socialLinks.map(social => <a key={social.name} href={social.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-300 hover:text-white">{social.name}</a>)}</div>
        <Link to="/contact" className="mt-3 inline-block text-xs font-bold text-blue-300">{t('Contact page →')}</Link>
      </div>
    </div>
    <div className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-4 text-[10px] text-slate-400 sm:flex-row sm:px-6 lg:px-8"><p>© {new Date().getFullYear()} Sano Bazar. {t('All rights reserved.')}</p><p>{t('Product availability is shown from the current catalog.')}</p></div></div>
  </footer>;
}
