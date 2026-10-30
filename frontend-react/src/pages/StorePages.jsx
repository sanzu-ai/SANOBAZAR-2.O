import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronDown, Clock3, CreditCard, ExternalLink, HelpCircle, LoaderCircle, Mail, MapPin, MessageCircle, Minus, PackageCheck, Phone, Plus, RotateCcw, Send, ShoppingBag, ShoppingCart, Trash2, Truck, UserRound, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { API_BASE } from '../lib/api';
import { formatNPR } from '../lib/currency';
import { useLanguage } from '../context/LanguageContext';
import { storeContact } from '../config/storeContact';
import { catalogQuickFilters } from '../config/catalogMenu';

const shell = 'mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8';
const button = 'inline-flex items-center justify-center gap-2 rounded-full bg-[#901a1c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#741416] disabled:cursor-not-allowed disabled:opacity-50';
const input = 'w-full rounded-xl border border-[#e9dfd5] bg-white px-4 py-3 text-sm text-[#302622] outline-none transition focus:border-[#901a1c] focus:ring-2 focus:ring-[#901a1c]/10';
const money = formatNPR;
const productSlug = product => `${product.id}-${String(product.name || 'product').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
const categoryIdFrom = (value, categories) => categories.find(category => String(category.id) === value || category.category_name?.toLowerCase() === decodeURIComponent(value).replaceAll('-', ' ').toLowerCase())?.id;

function useCatalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`${API_BASE}/get_products.php`).then(response => response.json()),
      fetch(`${API_BASE}/get_categories.php`).then(response => response.json())
    ]).then(([productData, categoryData]) => {
      if (!active) return;
      if (productData.status === 'error') throw new Error(productData.message || 'Unable to load catalog.');
      setProducts(Array.isArray(productData) ? productData : productData.data || []);
      setCategories(Array.isArray(categoryData) ? categoryData : categoryData.data || []);
    }).catch(reason => { if (active) setError(reason.message || 'Catalog is unavailable.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return { products, categories, loading, error };
}

function PageHeading({ eyebrow, title, children }) {
  const { t } = useLanguage();
  return <div className="mb-8"><p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#901a1c]">{t(eyebrow)}</p><h1 className="mt-2 text-3xl font-black tracking-tight text-[#302622] sm:text-4xl">{t(title)}</h1>{children && <p className="mt-3 max-w-2xl text-sm leading-6 text-[#716963]">{typeof children === 'string' ? t(children) : children}</p>}</div>;
}

export function ShopPage() {
  const { t } = useLanguage();
  const { products, categories, loading, error } = useCatalog();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const [maxPrice, setMaxPrice] = useState('');
  const [availability, setAvailability] = useState(false);
  const [sort, setSort] = useState(params.get('sort') || 'featured');
  const categoryFilter = params.get('category') || '';
  const subcategoryFilter = params.get('filter') || '';
  const quickFilter = catalogQuickFilters[subcategoryFilter];
  const selectedCategory = categories.find(category => String(category.id) === categoryFilter || category.category_name?.toLowerCase() === categoryFilter.toLowerCase());
  const heading = quickFilter?.label || selectedCategory?.category_name || 'Shop all products';
  const visible = useMemo(() => {
    const categoryId = categoryFilter ? categoryIdFrom(categoryFilter, categories) : null;
    const terms = quickFilter?.terms || [];
    let list = products.filter(product => (!categoryId || Number(product.category_id) === Number(categoryId)) &&
      (!terms.length || terms.some(term => `${product.name || ''} ${product.category || ''}`.toLowerCase().split(/[^a-z0-9]+/).includes(term))) &&
      (!query.trim() || `${product.name} ${product.category}`.toLowerCase().includes(query.trim().toLowerCase())) &&
      (!maxPrice || Number(product.price) <= Number(maxPrice)) && (!availability || Number(product.stock_quantity) > 0));
    if (sort === 'price-low') list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'price-high') list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === 'newest') list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return list;
  }, [products, categories, categoryFilter, subcategoryFilter, quickFilter, query, maxPrice, availability, sort]);
  const clearFilters = () => { setMaxPrice(''); setAvailability(false); setSort('featured'); setParams({}, { replace: true }); };
  return <div className={shell}>
    <PageHeading eyebrow={t('The Sano Bazar catalog')} title={heading}>{t('Browse the live product catalog. Filter by category, price, and current stock.')}</PageHeading>
    {categories.length > 0 && <nav aria-label={t('Shop categories')} className="mb-7 flex gap-2 overflow-x-auto pb-2">
      <Link to="/shop" className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${!categoryFilter ? 'border-[#901a1c] bg-[#901a1c] text-white' : 'border-[#e9dfd5] bg-white text-[#514640] hover:border-[#901a1c] hover:text-[#901a1c]'}`}>{t('All products')}</Link>
      {categories.map(category => <Link key={category.id} to={`/shop?category=${encodeURIComponent(category.id)}`} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${String(category.id) === categoryFilter ? 'border-[#901a1c] bg-[#901a1c] text-white' : 'border-[#e9dfd5] bg-white text-[#514640] hover:border-[#901a1c] hover:text-[#901a1c]'}`}>{t(category.category_name)}</Link>)}
    </nav>}
    <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="h-fit space-y-5 rounded-3xl border border-[#e9dfd5] bg-white p-5 shadow-[0_8px_30px_rgba(48,38,34,.035)]">
        <div className="flex items-center justify-between border-b border-[#eee5dc] pb-4"><h2 className="text-base font-extrabold text-[#302622]">{t('Filters')}</h2><button type="button" onClick={clearFilters} className="text-xs font-bold text-[#901a1c] hover:underline">{t('Clear all')}</button></div>
        <label className="block text-sm font-bold text-[#514640]">{t('Search')}<input className={`${input} mt-2`} value={query} onChange={event => { const next = new URLSearchParams(params); event.target.value ? next.set('q', event.target.value) : next.delete('q'); setParams(next, { replace: true }); }} placeholder={t('Search products')} /></label>
        <label className="block text-sm font-bold text-[#514640]">{t('Category')}<select className={`${input} mt-2`} value={categoryFilter} onChange={event => { const next = new URLSearchParams(params); event.target.value ? next.set('category', event.target.value) : next.delete('category'); next.delete('filter'); setParams(next); }}><option value="">{t('All categories')}</option>{categories.map(category => <option key={category.id} value={category.id}>{t(category.category_name)}</option>)}</select></label>
        <label className="block text-sm font-bold text-[#514640]">{t('Maximum price')}<input type="number" min="0" className={`${input} mt-2`} value={maxPrice} onChange={event => setMaxPrice(event.target.value)} placeholder={t('Any price')} /></label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#fbf8f2] p-3 text-sm font-semibold text-[#514640]"><input type="checkbox" checked={availability} onChange={event => setAvailability(event.target.checked)} className="h-4 w-4 accent-[#901a1c]" />{t('In stock only')}</label>
        <p className="text-xs leading-5 text-[#8a817a]">{t('Brand, ratings, and popularity filters are not available in the current product data.')}</p>
      </aside>
      <section className="min-w-0">
        {error && <p role="alert" className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{t(error)}</p>}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e9dfd5] bg-white px-4 py-3">
          <p className="text-sm text-[#716963]">{loading ? t('Loading products…') : <><span className="font-extrabold text-[#302622]">{visible.length}</span> {t('products')}</>}</p>
          <label className="flex items-center gap-2 text-sm font-semibold text-[#514640]">{t('Sort by')}<select className="rounded-xl border border-[#e9dfd5] bg-[#fffdfa] px-3 py-2 text-sm outline-none focus:border-[#901a1c]" value={sort} onChange={event => setSort(event.target.value)}><option value="featured">{t('Featured')}</option><option value="price-low">{t('Price: low to high')}</option><option value="price-high">{t('Price: high to low')}</option><option value="newest">{t('Newest added')}</option></select></label>
        </div>
        {loading ? <div className="flex items-center justify-center rounded-3xl border border-[#e9dfd5] bg-white py-24 text-[#716963]"><LoaderCircle className="mr-2 h-5 w-5 animate-spin text-[#901a1c]" />{t('Loading catalog')}</div> : visible.length ? <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">{visible.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="rounded-3xl border border-[#e9dfd5] bg-white p-12 text-center text-[#716963]"><p>{t('No matching products. Try clearing a filter.')}</p><button type="button" onClick={clearFilters} className="mt-4 text-sm font-bold text-[#901a1c] hover:underline">{t('Clear all filters')}</button></div>}
      </section>
    </div>
  </div>;
}

const categoryArt = ['photo-1498049794561-7780e7231661','photo-1483985988355-763728e1935b','photo-1555041469-a586c61ea9bc','photo-1608248543803-ba4f8c70ae0b','photo-1461896836934-ffe607ba8211','photo-1553062407-98eeb64c6a62'];
const subcategoryExamples = { electronics: ['Mobile phones','Headphones','Smart watches','Chargers'], computers: ['Laptops','Desktops','Keyboards','Mice','Monitors'], fashion: ["Men's clothing","Women's clothing",'Shoes','Bags'] };
export function CategoriesPage() {
  const { t } = useLanguage();
  const { categories, products, loading } = useCatalog();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const matches = categories.length ? categories : ['Electronics','Mobile Phones and Accessories','Computers and Laptops','Fashion','Home and Living','Beauty and Health','Sports and Outdoors','Bags and Accessories'].map((category_name, i) => ({ id: '', category_name, fallbackKey: i }));
  const examples = selected ? (subcategoryExamples[selected.category_name.toLowerCase()] || products.filter(p => Number(p.category_id) === Number(selected.id)).map(p => p.name)) : [];
  const continueShopping = () => { const query = new URLSearchParams(); if (selected?.id) query.set('category', selected.id); if (selectedSubcategory) query.set('q', selectedSubcategory); navigate(`/shop${query.size ? `?${query}` : ''}`); };
  return <div className={shell}>
    <PageHeading eyebrow={t('Browse our departments')} title={t('Shop by category')}>{t('Choose a department to explore products in the live catalog.')}</PageHeading>
    {loading && !categories.length ? <p className="text-[#716963]">{t('Loading categories…')}</p> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">{matches.map((category, index) => {
      const count = products.filter(product => Number(product.category_id) === Number(category.id)).length;
      return <button key={category.id || category.category_name} onClick={() => { setSelected(category); setSelectedSubcategory(''); }} className="group overflow-hidden rounded-3xl border border-[#e9dfd5] bg-white text-left transition duration-300 hover:-translate-y-1 hover:border-[#d8b7b1] hover:shadow-[0_16px_36px_rgba(48,38,34,.09)]">
        <div className="relative overflow-hidden bg-[#f4eee6]"><img src={`https://images.unsplash.com/${categoryArt[index % categoryArt.length]}?auto=format&fit=crop&w=700&q=80`} alt="" className="h-36 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-44"/><span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-extrabold text-[#901a1c]">{count} {t('products')}</span></div>
        <span className="block p-4"><span className="block text-sm font-extrabold text-[#302622] sm:text-base">{t(category.category_name)}</span><span className="mt-2 block text-xs font-bold text-[#901a1c]">{t('Explore category')} <ArrowRight className="ml-1 inline" size={13}/></span></span>
      </button>;
    })}</div>}
    {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#211b18]/55 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null); }}><section role="dialog" aria-modal="true" aria-labelledby="category-dialog-title" className="w-full max-w-lg rounded-3xl border border-[#e9dfd5] bg-[#fffdfa] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#901a1c]">{t('Department')}</p><h2 id="category-dialog-title" className="mt-1 text-2xl font-black text-[#302622]">{t(selected.category_name)}</h2></div><button aria-label={t('Close')} onClick={() => setSelected(null)} className="rounded-full p-2 text-[#514640] transition hover:bg-[#f4eee6]"><X /></button></div><p className="mt-3 text-sm text-[#716963]">{t('Popular searches in this department')}</p>{examples.length ? <div className="mt-4 flex flex-wrap gap-2">{examples.map(item => <button key={item} aria-pressed={selectedSubcategory === item} onClick={() => setSelectedSubcategory(item)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedSubcategory === item ? 'border-[#901a1c] bg-[#901a1c] text-white' : 'border-[#e9dfd5] bg-white text-[#514640] hover:border-[#901a1c] hover:text-[#901a1c]'}`}>{t(item)}</button>)}</div> : <p className="mt-4 rounded-2xl bg-[#fbf8f2] p-4 text-sm text-[#716963]">{t('Subcategories are not configured. Continue to see products filed under this department.')}</p>}<div className="mt-6 flex justify-end gap-3"><button onClick={() => setSelected(null)} className="rounded-full border border-[#e9dfd5] px-5 py-3 text-sm font-bold text-[#514640] transition hover:bg-[#fbf8f2]">{t('Close')}</button><button onClick={continueShopping} className={button}>{t('Continue shopping')}<ArrowRight size={16}/></button></div></section></div>}
  </div>;
}

export function ProductPage() {
  const { t } = useLanguage();
  const { slug } = useParams(); const { products, loading, error } = useCatalog(); const { addToCart } = useCart(); const navigate = useNavigate(); const [quantity, setQuantity] = useState(1); const [recommendationState, setRecommendationState] = useState({ productId: null, items: [], basis: '' });
  const product = products.find(item => productSlug(item) === slug || String(item.id) === slug);
  useEffect(() => {
    if (!product?.id) return undefined;
    const controller = new AbortController();
    fetch(`${API_BASE}/get_recommendations.php?product_id=${encodeURIComponent(product.id)}`, { credentials: 'include', signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Could not load recommendations.');
        return data;
      })
      .then(data => setRecommendationState({ productId: String(product.id), items: Array.isArray(data.data) ? data.data : [], basis: data.basis || '' }))
      .catch(reason => { if (reason.name !== 'AbortError') console.error('Recommendation request failed:', reason); });
    return () => controller.abort();
  }, [product?.id]);
  if (loading) return <div className={shell}>{t('Loading product…')}</div>;
  if (!product) return <div className={`${shell} text-center`}><h1 className="text-2xl font-black">{t(error || 'Product not found')}</h1><Link to="/shop" className={`${button} mt-5`}>{t('Browse products')}</Link></div>;
  const addSelectedQuantity = () => { for (let i = 0; i < quantity; i += 1) addToCart(product); };
  const recommendations = recommendationState.productId === String(product.id) ? recommendationState.items : [];
  const recommendationTitle = t(recommendationState.basis === 'purchase_history' ? 'Recommended for you' : 'You may also like');
  return <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
    <Link to="/shop" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#901a1c] transition hover:text-[#741416] sm:mb-6"><ArrowLeft size={16}/>{t('Back to shop')}</Link>
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)] lg:gap-7">
      <section className="rounded-3xl border border-[#e9dfd5] bg-white p-2 shadow-[0_10px_36px_rgba(48,38,34,.045)] sm:p-5">
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-[#fbf8f2] p-3 sm:aspect-square sm:p-8"><img src={product.image_url} alt={t(product.name)} className="h-full w-full object-contain"/></div>
      </section>
      <section className="h-fit rounded-3xl border border-[#e9dfd5] bg-white p-5 shadow-[0_10px_36px_rgba(48,38,34,.045)] sm:p-7 lg:sticky lg:top-6">
        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#901a1c]">{t(product.category || 'Sano Bazar selection')}</p>
        <h1 className="mt-3 text-2xl font-black leading-tight text-[#302622] sm:text-3xl">{t(product.name)}</h1>
        <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1"><p className="text-3xl font-black text-[#302622]">{money(product.price)}</p></div>
        <div className="mt-4 flex items-center gap-2 border-y border-[#eee5dc] py-4"><span className={`h-2.5 w-2.5 rounded-full ${Number(product.stock_quantity) > 0 ? 'bg-emerald-600' : 'bg-rose-600'}`}/><p className={`text-sm font-bold ${Number(product.stock_quantity) > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{Number(product.stock_quantity) > 0 ? `${product.stock_quantity} ${t('in stock')}` : t('Out of stock')}</p><span className="ml-auto text-xs text-[#716963]">{t('Delivery options at checkout')}</span></div>
        <p className="mt-5 text-sm leading-6 text-[#716963]">{t('Product information for this item is being updated. Contact us if you need help before ordering.')}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4"><div className="inline-flex items-center rounded-full border border-[#e9dfd5] bg-[#fffdfa] p-1"><button aria-label={t('Decrease quantity')} onClick={() => setQuantity(q => Math.max(1,q-1))} className="flex h-9 w-9 items-center justify-center rounded-full text-[#514640] transition hover:bg-[#f9eeee] hover:text-[#901a1c]"><Minus size={16}/></button><span className="min-w-10 text-center text-sm font-extrabold text-[#302622]">{quantity}</span><button aria-label={t('Increase quantity')} onClick={() => setQuantity(q => Math.min(Number(product.stock_quantity),q+1))} className="flex h-9 w-9 items-center justify-center rounded-full text-[#514640] transition hover:bg-[#f9eeee] hover:text-[#901a1c]"><Plus size={16}/></button></div><p className="text-xs text-[#716963]">{t('Quantity')}</p></div>
        <button disabled={!Number(product.stock_quantity)} onClick={addSelectedQuantity} className={`${button} mt-6 w-full py-3.5`}><ShoppingCart size={17}/>{t('Add to cart')}</button>
        <button disabled={!Number(product.stock_quantity)} onClick={() => { addSelectedQuantity(); navigate('/checkout'); }} className="mt-3 w-full rounded-full border border-[#901a1c] px-5 py-3.5 text-sm font-bold text-[#901a1c] transition hover:bg-[#f9eeee] disabled:opacity-50">{t('Buy now')}</button>
        <div className="mt-6 space-y-3 border-t border-[#eee5dc] pt-5 text-sm text-[#514640]"><p className="flex items-center gap-3"><Truck size={17} className="text-[#901a1c]"/>{t('Delivery details are confirmed at checkout.')}</p><p className="flex items-center gap-3"><RotateCcw size={17} className="text-[#901a1c]"/>{t('Need help with this item? Contact our support team.')}</p></div>
      </section>
    </div>
    {recommendations.length > 0 && <section className="mt-12"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#901a1c]">{t('More to discover')}</p><h2 className="mt-2 text-2xl font-black text-[#302622]">{recommendationTitle}</h2></div><Link to="/shop" className="text-sm font-bold text-[#901a1c] hover:underline">{t('View all')}<ArrowRight className="ml-1 inline" size={15}/></Link></div><div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">{recommendations.map(item=><ProductCard key={item.id} product={item}/>)}</div></section>}
  </div>;
}

export function CartPage() {
  const { t } = useLanguage();
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice, totalPaisa, cartSyncError } = useCart();
  const shipping = totalPaisa >= 200000 || totalPaisa === 0 ? 0 : 150;

  return <main className="mx-auto max-w-[1320px] px-4 py-8 text-[#302622] sm:px-6 lg:px-8 lg:py-10">
    <header className="mb-8 border-b border-[#e9dfd5] pb-6">
      <Link to="/shop" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#716963] transition hover:text-[#901a1c]"><ArrowLeft size={16}/>{t('Continue shopping')}</Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#901a1c]">{t('YOUR SELECTION')}</p>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-[#302622] sm:text-4xl">{t('Shopping cart')}</h1>
        </div>
        {cart.length > 0 && <p className="text-sm text-[#716963]">{totalItems} {t('item(s)')}</p>}
      </div>
    </header>
    {cartSyncError && <p role="alert" className="mb-5 border border-amber-200 bg-[#fff6e6] p-4 text-sm text-amber-900">{t(cartSyncError)}</p>}
    {cart.length === 0 ? <section className="border border-[#e9dfd5] bg-white px-6 py-14 text-center sm:py-20">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f9eeee] text-[#901a1c]"><ShoppingBag className="h-8 w-8"/></span>
      <h2 className="mt-5 text-xl font-bold text-[#302622]">{t('Your cart is empty')}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#716963]">{t('Find something useful for your everyday and it will appear here.')}</p>
      <Link to="/shop" className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-[#901a1c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#741416]">{t('Continue shopping')}<ArrowRight size={16}/></Link>
    </section> : <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-12">
      <section aria-label={t('Shopping cart items')} className="border-t border-[#e9dfd5] bg-white px-4 sm:px-6">
        <div className="hidden grid-cols-[96px_minmax(0,1fr)_130px_140px_130px_36px] items-center gap-4 border-b border-[#e9dfd5] py-4 text-[11px] font-semibold uppercase tracking-[.08em] text-[#827872] md:grid">
          <span>{t('Product')}</span><span /> <span>{t('Price')}</span><span>{t('Quantity')}</span><span>{t('Subtotal')}</span><span />
        </div>
        {cart.map(item => <article key={item.id} className="grid grid-cols-[76px_minmax(0,1fr)_36px] items-center gap-x-4 border-b border-[#e9dfd5] py-5 sm:grid-cols-[92px_minmax(0,1fr)_36px] sm:gap-x-5 md:grid-cols-[96px_minmax(0,1fr)_130px_140px_130px_36px] md:gap-4">
          <img src={item.image_url} alt={t(item.name)} className="h-[76px] w-[76px] rounded-lg bg-[#f7f6f4] object-contain p-2 sm:h-[92px] sm:w-[92px]"/>
          <div className="min-w-0">
            <Link to={`/product/${productSlug(item)}`} className="line-clamp-2 text-sm font-semibold leading-5 text-[#302622] transition hover:text-[#901a1c] sm:text-[15px]">{t(item.name)}</Link>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 md:hidden">
              <span className="text-sm font-semibold text-[#901a1c]">{money(item.price)}</span>
              <div className="inline-flex items-center rounded-md border border-[#e9dfd5]">
                <button type="button" onClick={() => updateQuantity(item.id,-1)} aria-label={t('Decrease quantity')} className="flex h-8 w-9 items-center justify-center text-[#514640] transition hover:bg-[#f9eeee] hover:text-[#901a1c]"><Minus size={14}/></button>
                <span className="min-w-9 text-center text-sm font-semibold text-[#302622]">{item.quantity}</span>
                <button type="button" onClick={() => updateQuantity(item.id,1)} aria-label={t('Increase quantity')} className="flex h-8 w-9 items-center justify-center text-[#514640] transition hover:bg-[#f9eeee] hover:text-[#901a1c]"><Plus size={14}/></button>
              </div>
            </div>
          </div>
          <span className="hidden text-sm text-[#514640] md:block">{money(item.price)}</span>
          <div className="hidden items-center rounded-md border border-[#e9dfd5] md:inline-flex">
            <button type="button" onClick={() => updateQuantity(item.id,-1)} aria-label={t('Decrease quantity')} className="flex h-9 w-9 items-center justify-center text-[#514640] transition hover:bg-[#f9eeee] hover:text-[#901a1c]"><Minus size={14}/></button>
            <span className="min-w-9 text-center text-sm font-semibold text-[#302622]">{item.quantity}</span>
            <button type="button" onClick={() => updateQuantity(item.id,1)} aria-label={t('Increase quantity')} className="flex h-9 w-9 items-center justify-center text-[#514640] transition hover:bg-[#f9eeee] hover:text-[#901a1c]"><Plus size={14}/></button>
          </div>
          <span className="hidden text-sm font-bold text-[#302622] md:block">{money(Number(item.price) * Number(item.quantity))}</span>
          <button type="button" onClick={() => removeFromCart(item.id)} aria-label={t('Remove item')} title={t('Remove item')} className="col-start-3 row-start-1 flex h-9 w-9 items-center justify-center rounded-full text-[#901a1c] transition hover:bg-[#f9eeee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#901a1c] md:col-start-6 md:row-auto"><Trash2 aria-hidden="true" className="h-[18px] w-[18px]" /></button>
        </article>)}
      </section>
      <aside className="h-fit border border-[#e9dfd5] bg-white p-5 sm:p-6 lg:sticky lg:top-6">
        <h2 className="border-b border-[#e9dfd5] pb-4 text-lg font-bold text-[#302622]">{t('Order summary')}</h2>
        <div className="mt-5 space-y-3 text-sm">
          <p className="flex justify-between gap-4 text-[#655b55]"><span>{t('Subtotal')}</span><span className="font-medium text-[#302622]">{money(totalPrice)}</span></p>
          <p className="flex justify-between gap-4 text-[#655b55]"><span>{t('Delivery')}</span><span className="font-medium text-[#302622]">{shipping ? money(shipping) : t('Free')}</span></p>
          <p className="flex justify-between gap-4 border-t border-[#e9dfd5] pt-4 text-base font-bold text-[#302622]"><span>{t('Total')}</span><span>{money(totalPrice + shipping)}</span></p>
        </div>
        <p className="mt-4 text-xs leading-5 text-[#827872]">{t('Shipping is an estimate and may be confirmed at checkout.')}</p>
        <Link to="/checkout" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#901a1c] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#741416]">{t('Checkout')} ({totalItems})<ArrowRight size={16}/></Link>
        <p className="mt-4 text-center text-xs text-[#827872]">{t('Secure checkout')} · {t('Prices in NPR')}</p>
      </aside>
    </div>}
  </main>;
}

export function AboutPage() {
  const { t } = useLanguage();
  const values = [
    ['Our story', 'Sano Bazar is being built as a convenient place to browse products and shop online. Add your company milestones here when they are ready to share.'],
    ['Our mission', 'Help customers discover useful products with clear pricing and a simple shopping experience.'],
    ['Our values', 'Useful information, respectful customer service, and a focus on making the buying journey easier.']
  ];
  return <div className={shell}><PageHeading eyebrow="About Sano Bazar" title="A simpler way to shop in Nepal">Sano Bazar is an online marketplace designed to make discovering everyday products straightforward.</PageHeading><div className="grid gap-5 md:grid-cols-3">{values.map(([title, text]) => <section key={title} className="rounded-3xl border border-[#e9dfd5] bg-white p-6 shadow-[0_8px_30px_rgba(48,38,34,.035)]"><h2 className="text-lg font-black text-[#302622]">{t(title)}</h2><p className="mt-3 text-sm leading-6 text-[#716963]">{t(text)}</p></section>)}</div><section className="mt-6 rounded-3xl border border-[#e9dfd5] bg-[#f9eeee] p-7"><h2 className="text-xl font-black text-[#302622]">{t('Why shop with us?')}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#716963]">{t('Browse a changing catalog, check current stock, and place orders through the available checkout flow. Product-specific details are shown on each listing.')}</p><Link to="/shop" className={`${button} mt-5`}>{t('Shop now')}<ArrowRight size={16}/></Link></section></div>;
}

const helpTopics = [
  { id: 'all', label: 'All topics', Icon: HelpCircle },
  { id: 'orders', label: 'Orders & tracking', Icon: PackageCheck },
  { id: 'delivery', label: 'Shipping', Icon: Truck },
  { id: 'payments', label: 'Payments & EMI', Icon: CreditCard },
  { id: 'returns', label: 'Returns', Icon: RotateCcw },
  { id: 'account', label: 'Account & products', Icon: UserRound }
];

const helpFaqs = [
  { topic: 'orders', question: 'How can I track my order?', answer: 'Open the order tracking page and enter the details requested there to check the latest status.', link: { to: '/track-order', label: 'Track an order' } },
  { topic: 'orders', question: 'Can I change or cancel an order?', answer: 'Contact our team as soon as possible with your order number. Changes depend on the order’s current processing status.', link: { to: '/contact', label: 'Contact support' } },
  { topic: 'delivery', question: 'When is delivery free?', answer: 'Orders over NPR 2,000 qualify for free shipping. Any delivery estimate or fee for your order is shown during checkout.' },
  { topic: 'delivery', question: 'How long will delivery take?', answer: 'Delivery time depends on your location and the product. Contact our team with your order number for an update.', link: { to: '/contact', label: 'Ask about delivery' } },
  { topic: 'payments', question: 'Which payment methods can I use?', answer: 'The payment options available for your order are shown during checkout.' },
  { topic: 'payments', question: 'How does the EMI calculator work?', answer: 'Use the EMI calculator to estimate monthly payments for a product and review the available terms.', link: { to: '/emi-calculator', label: 'Open EMI calculator' } },
  { topic: 'returns', question: 'How do I request a return or exchange?', answer: 'Send us your order number and the reason for your request. Our team will confirm the next steps for your order.', link: { to: '/contact', label: 'Contact support' } },
  { topic: 'account', question: 'Where can I see my orders and saved products?', answer: 'Sign in to view your account, orders, and saved products.', link: { to: '/login', label: 'Sign in to your account' } },
  { topic: 'account', question: 'How can I find a product?', answer: 'Browse the shop by category or use the search field at the top of the page.', link: { to: '/shop', label: 'Browse products' } }
];

export function HelpPage() {
  const { t } = useLanguage();
  const [activeTopic, setActiveTopic] = useState('all');
  const filteredFaqs = useMemo(() => helpFaqs.filter(faq => activeTopic === 'all' || faq.topic === activeTopic), [activeTopic]);
  const supportOptions = [
    { label: 'Call our team', value: storeContact.phone, href: storeContact.phoneHref, Icon: Phone },
    { label: 'Message us on WhatsApp', value: storeContact.whatsapp, href: storeContact.whatsappHref, Icon: MessageCircle },
    { label: 'Email support', value: storeContact.email, href: `mailto:${storeContact.email}`, Icon: Mail }
  ];

  return <div className="bg-[#fbf8f2]">
    <section className="relative overflow-hidden bg-[#901a1c] px-4 py-12 text-white sm:px-6 sm:py-16 lg:px-8">
      <div aria-hidden="true" className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/[.04]" />
      <div aria-hidden="true" className="absolute -bottom-40 right-1/4 h-72 w-72 rounded-full border border-white/10" />
      <div className="relative mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-[#f2c46d]">{t('Sano Bazar support')}</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{t('How can we help?')}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">{t('Find quick answers about orders, delivery, payments, and your account.')}</p>
      </div>
    </section>

    <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div role="group" aria-label={t('Help topics')} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {helpTopics.map(({ id, label, Icon }) => <button key={id} type="button" aria-pressed={activeTopic === id} onClick={() => setActiveTopic(id)} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold transition ${activeTopic === id ? 'border-[#901a1c] bg-[#901a1c] text-white shadow-sm' : 'border-[#e7ded6] bg-white text-[#514741] hover:border-[#901a1c]/40 hover:text-[#901a1c]'}`}><Icon aria-hidden="true" className="h-4 w-4" />{t(label)}</button>)}
      </div>

      <section aria-labelledby="help-faq-heading" className="mt-7">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#901a1c]">{t('Quick answers')}</p><h2 id="help-faq-heading" className="mt-1 text-2xl font-black tracking-tight text-[#261f1c]">{t('Frequently asked questions')}</h2></div>
          <span className="hidden text-sm text-[#81756e] sm:block">{filteredFaqs.length} {t('answers')}</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {filteredFaqs.map(faq => <details key={faq.question} className="group rounded-2xl border border-[#eee6df] bg-white p-5 shadow-sm transition hover:border-[#d9c7c2]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#302622] marker:hidden">{t(faq.question)}<ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-[#901a1c] transition-transform group-open:rotate-180" /></summary>
            <p className="mt-3 text-sm leading-6 text-[#716963]">{t(faq.answer)}</p>
            {faq.link && <Link to={faq.link.to} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#901a1c] hover:underline">{t(faq.link.label)} <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></Link>}
          </details>)}
        </div>
      </section>

      <section className="mt-10 rounded-3xl bg-[#211712] p-6 text-white sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#f2c46d]">{t('Still need help?')}</p><h2 className="mt-2 text-2xl font-black">{t('Talk to our team')}</h2><p className="mt-2 max-w-lg text-sm leading-6 text-white/65">{t('Choose the support option that works best for you.')}</p></div>
          <Link to="/contact" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#302622] transition hover:bg-[#f2c46d]">{t('Send a message')} <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {supportOptions.map(({ label, value, href, Icon }) => <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined} className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[.05] p-4 transition hover:border-white/25 hover:bg-white/10">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#f2c46d]"><Icon aria-hidden="true" className="h-5 w-5" /></span>
            <span className="min-w-0"><span className="block text-xs font-semibold text-white/60">{t(label)}</span><span className="mt-1 block truncate text-sm font-bold">{value}</span></span>
          </a>)}
        </div>
      </section>
    </div>
  </div>;
}

export function ContactPage() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false); const [error, setError] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false);
  const submit = async event => {
    event.preventDefault();
    setSent(false);
    setError('');
    setIsSubmitting(true);
    const form = event.currentTarget;
    const values = new FormData(form);
    try {
      const response = await fetch(`${API_BASE}/contact_messages.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: values.get('full_name'),
          email: values.get('email'),
          phone: values.get('phone'),
          subject: values.get('subject'),
          message: values.get('message')
        })
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'success') throw new Error(result.message || 'Unable to send your message right now. Please contact us by phone or email.');
      form.reset();
      setSent(true);
    } catch (reason) {
      setError(reason.message || 'Unable to connect to the contact service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const contactCards = [
    { icon: Phone, label: t('Phone'), value: storeContact.phone, href: storeContact.phoneHref },
    { icon: MessageCircle, label: t('WhatsApp'), value: storeContact.whatsapp, href: storeContact.whatsappHref, external: true },
    { icon: Mail, label: t('Email'), value: storeContact.email, href: `mailto:${storeContact.email}` },
    { icon: MapPin, label: t('Visit us'), value: storeContact.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeContact.address)}`, external: true }
  ];
  const contactField = 'mt-2 w-full rounded-xl border border-[#e6dcd1] bg-[#fffdfa] px-4 py-3 text-sm text-[#302622] outline-none transition placeholder:text-[#a69b92] focus:border-[#901a1c] focus:ring-4 focus:ring-[#901a1c]/10';
  return <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <header className="relative isolate overflow-hidden rounded-[28px] bg-[#901a1c] px-6 py-8 text-white sm:px-10 sm:py-10 lg:px-12">
      <div aria-hidden="true" className="absolute -right-16 -top-28 -z-10 h-80 w-80 rounded-full border border-white/10 bg-white/[.04]" />
      <div aria-hidden="true" className="absolute -bottom-48 right-1/4 -z-10 h-72 w-72 rounded-full border border-white/10" />
      <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#f2c46d]">{t('We’re here to help')}</p>
      <div className="mt-3 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">{t('Get in touch with us')}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">{t('Contact us by phone, WhatsApp, email, or Facebook. Send a message here and our team will review it.')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={storeContact.phoneHref} className="inline-flex items-center gap-2 rounded-full bg-[#fffaf3] px-5 py-3 text-sm font-bold text-[#302622] transition hover:bg-[#f2c46d]"><Phone size={17}/>{t('Call our team')}</a>
          <a href={storeContact.whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"><MessageCircle size={17}/>{t('Message us on WhatsApp')}</a>
        </div>
      </div>
    </header>

    <div className="mt-7 grid items-start gap-5 lg:grid-cols-[.95fr_1.05fr] lg:gap-6">
      <section className="rounded-3xl border border-[#e9dfd5] bg-white p-5 shadow-[0_8px_30px_rgba(48,38,34,.04)] sm:p-7">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#901a1c]">{t('Sano Bazar')}</p>
          <h2 className="mt-2 text-xl font-black text-[#302622] sm:text-2xl">{t('Contact information')}</h2>
          <p className="mt-2 text-sm leading-6 text-[#716963]">{t('Reach our team through any of these channels.')}</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {contactCards.map(({ icon: Icon, label, value, href, external }) => <a key={label} href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} className="group flex min-w-0 items-start gap-3 rounded-2xl border border-[#eee5dc] bg-[#fbf8f2] p-4 transition hover:border-[#d9a6a3] hover:bg-[#fffaf3]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#901a1c] shadow-sm"><Icon size={18}/></span>
            <span className="min-w-0"><span className="block text-[11px] font-extrabold uppercase tracking-wide text-[#8b8078]">{label}</span><span className="mt-1 block break-words text-sm font-bold text-[#302622] transition group-hover:text-[#901a1c]">{value}</span></span>
          </a>)}
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#fff6e6] p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#a76e11]"><Clock3 size={18}/></span>
          <div><h3 className="text-sm font-extrabold text-[#302622]">{t('Business hours')}</h3><p className="mt-1 text-sm text-[#716963]">{t(storeContact.businessDays)}, {storeContact.openingTime} – {storeContact.closingTime}</p></div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#eee5dc] pt-5">
          <span className="mr-1 text-sm font-bold text-[#716963]">{t('Follow us')}</span>
          {storeContact.socialLinks.map(social => <a key={social.name} href={social.url} target="_blank" rel="noreferrer" aria-label={social.name} className="inline-flex items-center gap-2 rounded-full border border-[#e6dcd1] bg-white px-4 py-2.5 text-xs font-bold text-[#302622] transition hover:border-[#901a1c]/30 hover:text-[#901a1c]"><ExternalLink size={14}/>{social.name}</a>)}
        </div>
      </section>

      <form onSubmit={submit} className="rounded-3xl border border-[#e9dfd5] bg-white p-5 shadow-[0_8px_30px_rgba(48,38,34,.04)] sm:p-7 lg:p-8">
        <div className="mb-6 flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f9eeee] text-[#901a1c]"><Send size={19}/></span>
          <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#901a1c]">{t('Customer care')}</p><h2 className="mt-1 text-xl font-black text-[#302622]">{t('Send us a message')}</h2><p className="mt-1 text-sm leading-5 text-[#716963]">{t('Fill out the form and our team will get back to you.')}</p></div>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-[#514640]">{t('Full name')}<input name="full_name" required minLength="2" maxLength="100" className={contactField} autoComplete="name"/></label>
            <label className="text-sm font-semibold text-[#514640]">{t('Email address')}<input name="email" required type="email" maxLength="254" className={contactField} autoComplete="email"/></label>
          </div>
          <label className="block text-sm font-semibold text-[#514640]">{t('Phone number (optional)')}<input name="phone" type="tel" maxLength="30" className={contactField} autoComplete="tel"/></label>
          <label className="block text-sm font-semibold text-[#514640]">{t('Subject')}<input name="subject" required minLength="3" maxLength="150" className={contactField}/></label>
          <label className="block text-sm font-semibold text-[#514640]">{t('Message')}<textarea name="message" required minLength="10" maxLength="5000" rows="6" className={`${contactField} resize-y`}/></label>
          <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#901a1c] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#741416] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto" disabled={isSubmitting}>{isSubmitting ? t('Sending…') : t('Send message')}<ArrowRight size={16}/></button>
          {sent && <p role="status" className="rounded-xl bg-[#edf7ee] px-4 py-3 text-sm font-medium text-[#236b36]">{t('Message sent.')}</p>}
          {error && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{t(error)}</p>}
        </div>
      </form>
    </div>
  </main>;
}

const articles = [
  { slug:'shopping-online-safely', title:'A few simple ways to shop online with confidence', category:'Shopping tips', author:'Sano Bazar Editorial', date:'2026-10-25', excerpt:'Practical checks to make before placing an online order.', body:'Before ordering, review the product details, price, availability, and delivery information shown by the store. Use a unique password for your account and contact the seller through verified channels if you need clarification. Keep your order confirmation until delivery is complete.' },
  { slug:'choosing-everyday-essentials', title:'How to compare everyday essentials', category:'Guides', author:'Sano Bazar Editorial', date:'2026-10-25', excerpt:'Compare the details that matter for your next purchase.', body:'Start with the product’s intended use, compare the specifications provided, and check that the size or compatibility suits your needs. If important specifications are missing, ask the seller before purchasing.' },
  { slug:'getting-more-from-your-budget', title:'Planning a shopping budget that works for you', category:'Ideas', author:'Sano Bazar Editorial', date:'2026-10-25', excerpt:'A straightforward approach to planning purchases.', body:'List what you need first, set a comfortable spending limit, and compare the final order cost including delivery. A clear budget can help you prioritize products and avoid impulse purchases.' }
];
export function BlogPage() {
  const { t } = useLanguage();
  const [q,setQ]=useState(''); const [category,setCategory]=useState('All'); const categories=['All',...new Set(articles.map(a=>a.category))]; const list=articles.filter(a=>(category==='All'||a.category===category)&&`${a.title} ${a.excerpt}`.toLowerCase().includes(q.toLowerCase()));
  return <div className={shell}><PageHeading eyebrow="Ideas and guides" title="Sano Bazar Journal">Editorial content from Sano Bazar. Articles are starter content and can be replaced with your own.</PageHeading><div className="mb-6 grid gap-3 sm:grid-cols-[1fr_220px]"><input aria-label={t('Search articles')} className={input} value={q} onChange={e=>setQ(e.target.value)} placeholder={t('Search articles')}/><select aria-label={t('Article category')} className={input} value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(value=><option key={value}>{t(value)}</option>)}</select></div><div className="grid gap-5 md:grid-cols-3">{list.map((article,i)=><article key={article.slug} className="overflow-hidden rounded-3xl border border-[#e9dfd5] bg-white shadow-[0_8px_30px_rgba(48,38,34,.035)]"><img src={`https://images.unsplash.com/${['photo-1556742049-0cfed4f6a45d','photo-1556761175-b413da4baf72','photo-1460925895917-afdab827c52f'][i%3]}?auto=format&fit=crop&w=850&q=80`} alt="" className="h-48 w-full object-cover"/><div className="p-5"><p className="text-xs font-bold text-[#901a1c]">{t(article.category)} · {article.date}</p><h2 className="mt-2 text-lg font-black text-[#302622]">{t(article.title)}</h2><p className="mt-2 text-sm leading-6 text-[#716963]">{t(article.excerpt)}</p><p className="mt-3 text-xs text-[#8a817a]">{t('By Sano Bazar Editorial')}</p><Link to={`/blog/${article.slug}`} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#901a1c]">{t('Read article')} <ArrowRight size={15}/></Link></div></article>)}</div>{!list.length&&<p className="rounded-2xl border border-[#e9dfd5] bg-white p-8 text-center text-[#716963]">{t('No matching articles.')}</p>}</div>;
}
export function BlogArticlePage() { const {t}=useLanguage(); const {slug}=useParams(); const article=articles.find(item=>item.slug===slug); if(!article)return <div className={shell}><h1 className="text-2xl font-black">{t('Article not found')}</h1><Link className="mt-4 inline-block text-[#901a1c]" to="/blog">{t('Back to blog')}</Link></div>; return <article className={`${shell} max-w-4xl`}><Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-[#901a1c]"><ArrowLeft size={16}/>{t('Back to blog')}</Link><p className="mt-8 text-xs font-bold uppercase tracking-wide text-[#901a1c]">{t(article.category)} · {article.date}</p><h1 className="mt-3 text-3xl font-black text-[#302622] sm:text-5xl">{t(article.title)}</h1><p className="mt-3 text-sm text-[#716963]">{t('By Sano Bazar Editorial')}</p><img className="mt-7 h-72 w-full rounded-3xl object-cover" src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=85" alt=""/><p className="mt-8 whitespace-pre-line text-base leading-8 text-[#514640]">{t(article.body)}</p><h2 className="mt-10 text-xl font-black text-[#302622]">{t('Related posts')}</h2><div className="mt-3 flex flex-wrap gap-3">{articles.filter(item=>item.slug!==slug).map(item=><Link key={item.slug} to={`/blog/${item.slug}`} className="rounded-2xl border border-[#e9dfd5] bg-white p-4 text-sm font-bold text-[#901a1c]">{t(item.title)}</Link>)}</div></article>; }

export function AccountPage({ trackingOnly = false }) {
  const { t } = useLanguage();
  const [user,setUser]=useState(null); const [orders,setOrders]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  useEffect(()=>{let active=true; Promise.all([fetch(`${API_BASE}/account.php`,{credentials:'include'}).then(r=>r.json()),fetch(`${API_BASE}/my_orders.php`,{credentials:'include'}).then(r=>r.json())]).then(([account,orderData])=>{if(!active)return;if(account.status!=='success')throw new Error(account.message||'Please log in to view your account.');setUser(account.user);setOrders(orderData.data||[]);}).catch(reason=>{if(active)setError(reason.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
  if(loading)return <div className={shell}>{t('Loading your account…')}</div>;
  if(error)return <div className={`${shell} text-center`}><h1 className="text-2xl font-black">{t(trackingOnly ? 'Sign in to track your orders' : 'Sign in to view your account')}</h1><p className="mt-2 text-slate-600">{t(error)}</p><Link to="/login" state={{ from: trackingOnly ? '/track-order' : '/account' }} className={`${button} mt-5`}>{t('Sign in')}</Link></div>;
  return <div className={shell}>
    <PageHeading eyebrow={t(trackingOnly ? 'Order updates' : 'Your account')} title={trackingOnly ? t('Track your orders') : `${t('Welcome')}, ${user.full_name}`}>
      {t(trackingOnly ? 'Order updates and delivery status for your recent purchases.' : 'Account details and order history from your signed-in Sano Bazar session.')}
    </PageHeading>
    <div className={trackingOnly ? '' : 'grid gap-6 lg:grid-cols-[300px_1fr]'}>
      {!trackingOnly && <aside className="mb-6 h-fit rounded-2xl bg-white p-6 shadow-sm lg:mb-0"><h2 className="font-black">{t('Profile')}</h2><p className="mt-3 text-sm">{user.full_name}</p><p className="mt-1 text-sm text-slate-500">{user.email}</p><p className="mt-4 text-xs text-slate-500">{t('Member since')} {user.created_at ? new Date(user.created_at).toLocaleDateString() : t('date unavailable')}</p></aside>}
      <section className="rounded-3xl border border-[#e9dfd5] bg-white p-6 shadow-[0_8px_30px_rgba(48,38,34,.04)]"><h2 className="text-xl font-black text-[#302622]">{t('My orders')}</h2>{orders.length? <div className="mt-4 divide-y divide-[#eee5dc]">{orders.map(order=><article key={order.id} className="py-4 text-sm"><div className="flex flex-wrap justify-between gap-2"><div><p className="font-bold text-[#302622]">{t('Order')} #{order.id}</p><p className="mt-1 text-[#716963]">{new Date(order.created_at).toLocaleDateString()} · {order.item_count} {t('item(s)')}</p></div><div className="text-right"><p className="font-bold text-[#302622]">{money(order.total_amount)}</p>{Number(order.discount_amount) > 0 && <p className="text-xs text-emerald-700">{order.promo_code} · −{money(order.discount_amount)}</p>}<span className="mt-1 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-bold capitalize text-amber-800">{t(order.order_status)}</span></div></div><div className="mt-3 grid gap-2 rounded-xl bg-[#fbf8f2] p-3 text-xs text-[#716963] sm:grid-cols-2"><p><span className="font-bold text-[#514640]">{t('Delivery')}:</span> {order.shipping_address} · {order.phone_number}</p><p><span className="font-bold text-[#514640]">{t('Payment')}:</span> {t(order.payment_method === 'digital' ? 'Simulated digital wallet' : 'Cash on delivery')} ({t(order.payment_status)})</p></div></article>)}</div>:<p className="mt-4 text-sm text-[#716963]">{t('No orders yet.')} <Link className="font-bold text-[#901a1c]" to="/shop">{t('Browse the shop')}</Link></p>}</section>
    </div>
  </div>;
}
