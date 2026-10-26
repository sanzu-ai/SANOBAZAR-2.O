import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

const quickLinks = [['Home','/'],['Shop','/shop'],['Categories','/categories'],['About Us','/about'],['Contact','/contact'],['Blog','/blog'],['Newsletter','/#newsletter']];
const serviceLinks = [['My orders','/account'],['Shipping information','/contact'],['Returns and support','/contact'],['Help center','/contact']];

export default function Footer() {
  return <footer className="bg-[#15243b] text-slate-200">
    <div className="mx-auto grid max-w-7xl gap-9 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.35fr_.8fr_1fr_1fr] lg:px-8">
      <div><Link to="/" className="inline-flex items-center gap-2 text-lg font-black text-white"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1766d1]">स</span>सानो बजार</Link><p className="mt-3 max-w-xs text-xs leading-5 text-slate-400">Discover products for everyday life at Sano Bazar.</p></div>
      <div><h2 className="text-xs font-extrabold text-white">Quick Links</h2><ul className="mt-3 space-y-2">{quickLinks.map(([label,href])=><li key={label}><Link to={href} className="text-xs text-slate-400 hover:text-white">{label}</Link></li>)}</ul></div>
      <div><h2 className="text-xs font-extrabold text-white">Customer Service</h2><ul className="mt-3 space-y-2">{serviceLinks.map(([label,href])=><li key={label}><Link to={href} className="text-xs text-slate-400 hover:text-white">{label}</Link></li>)}</ul></div>
      <div><h2 className="text-xs font-extrabold text-white">Contact</h2><p className="mt-3 text-xs leading-5 text-slate-400">Business contact details will appear here when configured.</p><ul className="mt-3 space-y-2 text-xs text-slate-500"><li className="flex items-center gap-2"><Phone size={13}/>[Business phone]</li><li className="flex items-center gap-2"><Mail size={13}/>[Business email]</li><li className="flex items-center gap-2"><MapPin size={13}/>[Business address]</li></ul><Link to="/contact" className="mt-3 inline-block text-xs font-bold text-blue-300">Contact page →</Link></div>
    </div>
    <div className="border-t border-white/10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-4 text-[10px] text-slate-400 sm:flex-row sm:px-6 lg:px-8"><p>© {new Date().getFullYear()} Sano Bazar. All rights reserved.</p><p>Product availability is shown from the current catalog.</p></div></div>
  </footer>;
}
