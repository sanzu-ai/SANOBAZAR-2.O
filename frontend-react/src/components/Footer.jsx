import { Link } from 'react-router-dom';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { storeContact } from '../config/storeContact';

const shopLinks = [['Shop all','/shop'],['Categories','/categories'],['Fashion','/shop?category=Fashion'],['Home & Living','/shop?category=Home%20%26%20Living']];
const exploreLinks = [['New arrivals','/shop?sort=newest'],['Sano Bazar Journal','/blog'],['About Us','/about'],['EMI Calculator','/emi-calculator']];
const serviceLinks = [['Track Order','/track-order'],['My orders','/account'],['Shipping information','/help'],['Help center','/help']];

function FacebookMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.02 4.388 11.016 10.125 11.927v-8.433H7.078v-3.494h3.047V9.41c0-3.017 1.792-4.686 4.533-4.686 1.312 0 2.686.235 2.686.235v2.97H15.83c-1.491 0-1.956.931-1.956 1.887v2.26h3.328l-.532 3.494h-2.796V24C19.612 23.09 24 18.093 24 12.073Z" /></svg>;
}

function WhatsAppMark() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M20.52 3.48A11.8 11.8 0 0 0 12.1 0C5.55 0 .22 5.33.22 11.89c0 2.1.55 4.15 1.58 5.95L.13 24l6.3-1.65a11.8 11.8 0 0 0 5.67 1.45h.01c6.55 0 11.88-5.33 11.89-11.89a11.8 11.8 0 0 0-3.48-8.43Zm-8.41 18.3h-.01a9.86 9.86 0 0 1-5.02-1.37l-.36-.21-3.74.98.99-3.65-.23-.37a9.85 9.85 0 0 1-1.51-5.27c0-5.46 4.44-9.89 9.9-9.89a9.83 9.83 0 0 1 6.99 2.9 9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.89-9.9 9.89Zm5.43-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.28.3-1.04 1.02-1.04 2.48s1.06 2.9 1.06 3.1c.13.2 2.05 3.12 4.96 4.38.69.3 1.23.48 1.65.61.7.22 1.33.19 1.83.12.56-.09 1.76-.72 2.01-1.42.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" /></svg>;
}

export default function Footer() {
  const { t } = useLanguage();
  return <footer className="bg-gradient-to-br from-[#5d1115] via-[#7f171b] to-[#3c1013] text-[#f8f2e8]">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-11 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.2fr_.8fr_.9fr_.95fr_1.35fr] lg:gap-7 lg:px-8">
      <div><Link to="/" aria-label="Sano Bazar home" className="inline-flex rounded-lg"><img src="/sanobazar-logo-light.svg" alt="Sano Bazar" className="h-14 w-auto" /></Link><p className="mt-3 max-w-xs text-xs leading-5 text-[#ead6d0]">{t('Discover products for everyday life at Sano Bazar.')}</p><p className="mt-2 text-xs font-semibold text-[#f2c46d]">{t('सानो बजार, ठूलो खुसी!')}</p></div>
      <div><h2 className="text-xs font-extrabold text-white">{t('Shop')}</h2><ul className="mt-3 space-y-2">{shopLinks.map(([label,href])=><li key={label}><Link to={href} className="text-xs text-[#ead6d0] transition hover:text-white">{t(label)}</Link></li>)}</ul></div>
      <div><h2 className="text-xs font-extrabold text-white">{t('Explore')}</h2><ul className="mt-3 space-y-2">{exploreLinks.map(([label,href])=><li key={label}><Link to={href} className="text-xs text-[#ead6d0] transition hover:text-white">{t(label)}</Link></li>)}</ul></div>
      <div><h2 className="text-xs font-extrabold text-white">{t('Customer Support')}</h2><ul className="mt-3 space-y-2">{serviceLinks.map(([label,href])=><li key={label}><Link to={href} className="text-xs text-[#ead6d0] transition hover:text-white">{t(label)}</Link></li>)}</ul></div>
      <div>
        <h2 className="text-xs font-extrabold text-white">{t('Contact details')}</h2>
        <ul className="mt-3 space-y-2 text-xs text-[#ead6d0]">
          <li className="flex items-center gap-2"><Phone size={13} className="shrink-0"/><a href={storeContact.phoneHref} className="hover:text-white">{storeContact.phone}</a></li>
          <li className="flex items-center gap-2"><MessageCircle size={13} className="shrink-0"/><a href={storeContact.whatsappHref} target="_blank" rel="noreferrer" className="hover:text-white">WhatsApp: {storeContact.whatsapp}</a></li>
          <li className="flex items-center gap-2"><Mail size={13} className="shrink-0"/><a href={`mailto:${storeContact.email}`} className="break-all hover:text-white">{storeContact.email}</a></li>
          <li className="flex items-start gap-2"><MapPin size={13} className="mt-0.5 shrink-0"/><span>{storeContact.address}</span></li>
        </ul>
        <p className="mt-3 text-xs text-[#ead6d0]">{t(storeContact.businessDays)}, {storeContact.openingTime} – {storeContact.closingTime}</p>
        <div className="mt-4 flex items-center gap-3" aria-label={t('Follow us')}>
          <a href={storeContact.socialLinks.find(social => social.name === 'Facebook')?.url || 'https://www.facebook.com'} target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1877f2] text-white transition hover:-translate-y-0.5 hover:bg-[#0866ff]"><FacebookMark /></a>
          <a href={storeContact.whatsappHref} target="_blank" rel="noreferrer" aria-label="WhatsApp" title="WhatsApp" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25d366] text-white transition hover:-translate-y-0.5 hover:bg-[#1fb855]"><WhatsAppMark /></a>
        </div>
      </div>
    </div>
    <div className="border-t border-white/15"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-4 text-[10px] text-[#ead6d0] sm:flex-row sm:px-6 lg:px-8"><p>© {new Date().getFullYear()} Sano Bazar. {t('All rights reserved.')}</p><p>{t('Product availability is shown from the current catalog.')}</p></div></div>
  </footer>;
}
