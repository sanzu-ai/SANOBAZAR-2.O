import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, PhoneCall, Search, ShieldCheck, ShoppingCart, UserRound, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE } from '../lib/api';
import { storeContact } from '../config/storeContact';
import { catalogDepartments, catalogHref } from '../config/catalogMenu';
import AnnouncementBar from './AnnouncementBar';

export default function Navbar({ searchQuery, setSearchQuery }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems: cartCount, setIsCartOpen } = useCart();
  const { t } = useLanguage();
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('sanobazar_user') || 'null');
  } catch {
    localStorage.removeItem('sanobazar_user');
  }

  const submitSearch = event => {
    event.preventDefault();
    setSearchQuery?.(localSearch.trim());
    setMobileOpen(false);
    navigate(`/shop${localSearch.trim() ? `?q=${encodeURIComponent(localSearch.trim())}` : ''}`);
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/logout.php`, { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      localStorage.removeItem('sanobazar_user');
      window.dispatchEvent(new CustomEvent('sanobazar:auth-change', { detail: { user: null } }));
      navigate('/');
    }
  };

  const navLinkClass = (href, category = '') => {
    const selectedCategory = new URLSearchParams(location.search).get('category');
    const active = location.pathname === href && (!category || selectedCategory === category);
    return `whitespace-nowrap py-3 text-[13px] font-semibold transition-colors hover:text-[#901a1c] ${active ? 'text-[#901a1c]' : 'text-[#403532]'}`;
  };

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b border-[#eee6df] bg-[#fffdf9]/95 backdrop-blur">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[82px] items-center gap-1 py-3 sm:gap-5">
            <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Sano Bazar home">
              <img src="/sanobazar-logo.svg" alt="Sano Bazar" className="h-12 w-auto max-[360px]:h-11 sm:h-[72px]" />
            </Link>

            <form onSubmit={submitSearch} className="relative mx-auto hidden max-w-[500px] flex-1 lg:block">
              <label className="sr-only" htmlFor="site-search">{t('Search products')}</label>
              <input id="site-search" value={localSearch} onChange={event => setLocalSearch(event.target.value)} placeholder={t('Search products...')} className="h-11 w-full rounded-full border border-[#e4e0dc] bg-white pl-5 pr-12 text-sm text-[#302622] outline-none transition placeholder:text-[#8c8580] hover:border-[#cfc7c0] focus:border-[#901a1c]/50 focus:ring-4 focus:ring-[#901a1c]/[.06]" />
              <button type="submit" aria-label={t('Search')} className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#302622] transition hover:bg-[#f5f1ed] hover:text-[#901a1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#901a1c]"><Search className="h-[18px] w-[18px]" /></button>
            </form>

            <div className="ml-auto flex shrink-0 items-center gap-0 sm:gap-1.5">
              <a href={storeContact.phoneHref} aria-label={`Call Sano Bazar ${storeContact.phone}`} title={storeContact.phone} className="hidden items-center justify-center rounded-full p-2 text-[#302622] transition hover:bg-[#f4eee8] hover:text-[#901a1c] sm:inline-flex"><PhoneCall className="h-6 w-6" /></a>
              {user?.role === 'admin' && <Link to="/admin" aria-label="Admin dashboard" title="Admin dashboard" className="hidden rounded-full p-2 text-[#901a1c] hover:bg-[#f4eee8] sm:inline-flex"><ShieldCheck className="h-6 w-6" /></Link>}
              <div className="relative">
                <button type="button" onClick={() => setProfileOpen(open => !open)} aria-label="Account menu" aria-expanded={profileOpen} className="flex items-center gap-2 rounded-full p-1.5 text-[#302622] transition hover:bg-[#f4eee8] hover:text-[#901a1c] sm:p-2 max-[350px]:p-1"><UserRound className="h-5 w-5 sm:h-6 sm:w-6" />{user?.full_name && <span className="hidden max-w-24 truncate text-xs font-semibold sm:block">{user.full_name.split(' ')[0]}</span>}</button>
                {profileOpen && <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-[#eee6df] bg-white p-2 shadow-xl">{user ? <><p className="truncate px-3 py-2 text-xs font-bold text-slate-500">{user.email}</p><Link onClick={() => setProfileOpen(false)} to="/account" className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-[#f8f4ef]">My dashboard / orders</Link><button onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50">Logout</button></> : <><Link onClick={() => setProfileOpen(false)} to="/login" className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-[#f8f4ef]">Login</Link><Link onClick={() => setProfileOpen(false)} to="/register" className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-[#f8f4ef]">Register</Link></>}</div>}
              </div>
              <button type="button" onClick={() => setIsCartOpen(true)} aria-label={`Shopping cart, ${cartCount} items`} className="relative rounded-full p-1.5 text-[#302622] transition hover:bg-[#f4eee8] hover:text-[#901a1c] sm:p-2 max-[350px]:p-1"><ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" /><span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#901a1c] px-1 text-[9px] font-bold text-white">{cartCount}</span></button>
              <button type="button" onClick={() => setMobileOpen(open => !open)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} className="rounded-full p-1.5 text-[#302622] hover:bg-[#f4eee8] lg:hidden sm:p-2 max-[350px]:p-1">{mobileOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}</button>
            </div>
          </div>

          <nav aria-label={t('Main navigation')} className="hidden items-center justify-center gap-3 border-t border-[#f0e9e2] lg:flex xl:gap-5">
            {catalogDepartments.map(department => <div key={department.label} className="group relative">
              <Link to={catalogHref({ category: department.category, filter: department.filter })} className={navLinkClass('/shop', department.category || department.filter)} aria-haspopup="true">{t(department.label)} <ChevronDown aria-hidden="true" className="ml-0.5 inline h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180" /></Link>
              <div className="invisible absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 translate-y-1 rounded-xl border border-[#eee6df] bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                {department.items.map(item => <Link key={item.filter} to={catalogHref({ category: department.category, filter: item.filter })} className="block rounded-lg px-3 py-2 text-sm text-[#756a64] hover:bg-[#f8f4ef] hover:text-[#901a1c]">{t(item.label)}</Link>)}
              </div>
            </div>)}
            <Link to="/blog" className={navLinkClass('/blog')}>{t('Blogs')}</Link>
            <Link to="/categories" className={navLinkClass('/categories')}>{t('Collections')}</Link>
            <Link to="/shop?sort=newest" className="whitespace-nowrap py-3 text-[13px] font-bold text-[#901a1c] transition hover:text-[#741416]">{t('New Arrivals')}</Link>
          </nav>

          {mobileOpen && <div className="border-t border-[#eee6df] py-4 lg:hidden">
            <form onSubmit={submitSearch} className="relative mb-3 md:hidden">
              <label className="sr-only" htmlFor="mobile-search">{t('Search products')}</label>
              <input id="mobile-search" value={localSearch} onChange={event => setLocalSearch(event.target.value)} placeholder={t('Search products...')} className="h-11 w-full rounded-full border border-[#e7ded6] bg-[#faf8f5] pl-4 pr-11 text-sm outline-none focus:border-[#901a1c]/50" />
              <button type="submit" aria-label={t('Search')} className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#901a1c] text-white"><Search className="h-4 w-4" /></button>
            </form>
            <nav aria-label={t('Mobile navigation')} className="grid grid-cols-2 gap-1">
              {catalogDepartments.map(department => <details key={department.label} className="group col-span-2 rounded-lg border border-[#eee6df] bg-white">
                <summary className="cursor-pointer list-none rounded-lg px-3 py-2.5 text-sm font-semibold text-[#403532] hover:bg-[#f8f4ef] hover:text-[#901a1c]">{t(department.label)} <ChevronDown aria-hidden="true" className="float-right h-4 w-4 transition-transform duration-200 group-open:rotate-180" /></summary>
                <div className="grid gap-1 border-t border-[#f0e9e2] p-2 sm:grid-cols-2">
                  {department.items.map(item => <Link key={item.filter} to={catalogHref({ category: department.category, filter: item.filter })} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm text-[#756a64] hover:bg-[#f8f4ef]">{t(item.label)}</Link>)}
                </div>
              </details>)}
              <Link to="/shop" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#403532] hover:bg-[#f8f4ef]">{t('Shop')}</Link>
              <Link to="/categories" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#403532] hover:bg-[#f8f4ef]">{t('Categories')}</Link>
              <Link to="/blog" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#403532] hover:bg-[#f8f4ef]">{t('Blogs')}</Link>
              <Link to="/shop?sort=newest" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#901a1c]">{t('New Arrivals')}</Link>
              <Link to="/about" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#403532] hover:bg-[#f8f4ef]">{t('About Us')}</Link>
              <Link to="/contact" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#403532] hover:bg-[#f8f4ef]">{t('Contact')}</Link>
              <Link to="/emi-calculator" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#403532] hover:bg-[#f8f4ef]">{t('EMI Calculator')}</Link>
              <button type="button" onClick={() => { setMobileOpen(false); setIsCartOpen(true); }} className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#403532] hover:bg-[#f8f4ef]">{t('Cart')} ({cartCount})</button>
              {!user && <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#403532] hover:bg-[#f8f4ef]">{t('Sign In')}</Link>}
              {user?.role === 'admin' && <Link to="/admin" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#901a1c] hover:bg-[#f8f4ef]">{t('Admin Dashboard')}</Link>}
            </nav>
          </div>}
        </div>
      </header>
    </>
  );
}
