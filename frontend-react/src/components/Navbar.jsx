import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Menu, Search, ShieldCheck, ShoppingCart, UserRound, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { API_BASE } from '../lib/api';
import AnnouncementBar from './AnnouncementBar';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Categories', href: '/categories' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Blog', href: '/blog' }
];

export default function Navbar({ searchQuery, setSearchQuery }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems: cartCount, wishlistCount } = useCart();
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('sanobazar_user') || 'null');
  } catch {
    localStorage.removeItem('sanobazar_user');
  }

  const submitSearch = (event) => {
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

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between gap-3">
            <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Sano Bazar home">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1766d1] text-white shadow-md shadow-blue-900/15"><ShoppingCart className="h-6 w-6" /></span>
              <span className="leading-tight"><span className="block text-[17px] font-black tracking-tight text-[#17263d] sm:text-lg">सानो <span className="text-[#1766d1]">बजार</span></span><span className="block text-[10px] font-semibold tracking-wide text-slate-500">Sano Bazar</span></span>
            </Link>

            <nav aria-label="Main navigation" className="hidden items-center gap-5 lg:flex">
              {navLinks.map(item => <Link key={item.label} to={item.href} className={`relative py-2 text-[13px] font-semibold transition hover:text-[#1766d1] ${location.pathname === item.href ? 'text-[#1766d1] after:absolute after:inset-x-0 after:-bottom-1 after:mx-auto after:h-0.5 after:w-5 after:rounded-full after:bg-[#1766d1]' : 'text-slate-700'}`}>{item.label}</Link>)}
            </nav>

            <form onSubmit={submitSearch} className="relative hidden max-w-[245px] flex-1 xl:block">
              <label className="sr-only" htmlFor="site-search">Search products</label>
              <input id="site-search" value={localSearch} onChange={event => setLocalSearch(event.target.value)} placeholder="Search for products..." className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-xs outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100" />
              <button aria-label="Search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-500 hover:text-[#1766d1]"><Search className="h-4 w-4" /></button>
            </form>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              {user?.role === 'admin' && <Link to="/admin" aria-label="Admin dashboard" title="Admin dashboard" className="hidden rounded-full p-2 text-[#1766d1] hover:bg-blue-50 sm:inline-flex"><ShieldCheck className="h-5 w-5" /></Link>}
              <div className="relative"><button onClick={() => setProfileOpen(open => !open)} aria-label="Account menu" aria-expanded={profileOpen} className="flex items-center gap-2 rounded-full p-2 text-[#17263d] transition hover:bg-slate-100 hover:text-[#1766d1]"><UserRound className="h-5 w-5" />{user?.full_name && <span className="hidden max-w-24 truncate text-xs font-semibold sm:block">{user.full_name.split(' ')[0]}</span>}</button>{profileOpen && <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-slate-100 bg-white p-2 shadow-xl">{user ? <><p className="truncate px-3 py-2 text-xs font-bold text-slate-500">{user.email}</p><Link onClick={() => setProfileOpen(false)} to="/account" className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-blue-50">My dashboard / orders</Link><Link onClick={() => setProfileOpen(false)} to="/wishlist" className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-blue-50">My wishlist</Link><button onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50">Logout</button></> : <><Link onClick={() => setProfileOpen(false)} to="/login" className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-blue-50">Login</Link><Link onClick={() => setProfileOpen(false)} to="/register" className="block rounded-lg px-3 py-2 text-sm font-semibold hover:bg-blue-50">Register</Link></>}</div>}</div>
              {user && <button onClick={logout} className="hidden text-[11px] font-semibold text-slate-500 hover:text-rose-600 xl:block">Sign out</button>}
              <Link to="/wishlist" aria-label={`Wishlist, ${wishlistCount} saved items`} className="relative rounded-full p-2 text-[#17263d] transition hover:bg-slate-100 hover:text-rose-600"><Heart className="h-5 w-5" />{wishlistCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">{wishlistCount}</span>}</Link>
              <Link to="/cart" aria-label={`Shopping cart, ${cartCount} items`} className="relative rounded-full p-2 text-[#17263d] transition hover:bg-slate-100 hover:text-[#1766d1]"><ShoppingCart className="h-5 w-5" />{cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1766d1] px-1 text-[9px] font-bold text-white">{cartCount}</span>}</Link>
              <button onClick={() => setMobileOpen(open => !open)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} className="rounded-full p-2 text-slate-700 hover:bg-slate-100 lg:hidden">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
            </div>
          </div>

          {mobileOpen && <div className="border-t border-slate-100 py-3 lg:hidden">
            <form onSubmit={submitSearch} className="relative mb-3">
              <label className="sr-only" htmlFor="mobile-search">Search products</label>
              <input id="mobile-search" value={localSearch} onChange={event => setLocalSearch(event.target.value)} placeholder="Search for products..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-10 text-sm outline-none focus:border-blue-300" />
              <button aria-label="Search" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500"><Search className="h-4 w-4" /></button>
            </form>
            <nav aria-label="Mobile navigation" className="grid grid-cols-2 gap-1">
              {navLinks.map(item => <Link key={item.label} to={item.href} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#1766d1]">{item.label}</Link>)}
              <Link to="/cart" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50">Cart ({cartCount})</Link><Link to="/wishlist" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50">Wishlist ({wishlistCount})</Link>
              {!user && <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50">Sign In</Link>}
              {user?.role === 'admin' && <Link to="/admin" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#1766d1] hover:bg-blue-50">Admin Dashboard</Link>}
            </nav>
          </div>}
        </div>
      </header>
    </>
  );
}
