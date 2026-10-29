import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../lib/api';
import HeroSection from '../components/HeroSection';
import ServiceBenefits from '../components/ServiceBenefits';
import CategorySection from '../components/CategorySection';
import FeaturedProducts from '../components/FeaturedProducts';
import { useLanguage } from '../context/LanguageContext';

const featuredArticles = [
  { slug: 'shopping-online-safely', category: 'Shopping tips', title: 'A few simple ways to shop online with confidence', excerpt: 'Practical checks to make before placing an online order.', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=850&q=80' },
  { slug: 'choosing-everyday-essentials', category: 'Guides', title: 'How to compare everyday essentials', excerpt: 'Compare the details that matter for your next purchase.', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=850&q=80' },
  { slug: 'getting-more-from-your-budget', category: 'Ideas', title: 'Planning a shopping budget that works for you', excerpt: 'A straightforward approach to planning purchases.', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=850&q=80' }
];

export default function Home({ searchQuery }) {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('featured');
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/get_categories.php`)
      .then(response => response.json())
      .then(data => setCategories(Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : [])))
      .catch(error => console.error('Categories error:', error));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category_id', selectedCategory);
    if (searchQuery?.trim()) params.set('q', searchQuery.trim());
    const query = params.toString();

    fetch(`${API_BASE}/get_products.php${query ? `?${query}` : ''}`)
      .then(async response => {
        const data = await response.json();
        if (!response.ok || data.status === 'error') throw new Error(data.message || 'Unable to load products.');
        return data;
      })
      .then(data => {
        const list = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : (Array.isArray(data.products) ? data.products : []));
        setProducts(list);
        setCatalogError('');
      })
      .catch(error => {
        setProducts([]);
        setCatalogError(error.message || 'Products are temporarily unavailable.');
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery]);

  const selectCategory = categoryId => {
    setSelectedCategory(String(categoryId));
    setActiveTab('featured');
    setShowAllProducts(false);
    window.setTimeout(() => document.getElementById('best-sellers')?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  const viewAllProducts = () => setShowAllProducts(value => !value);
  const hasBestSellers = products.some(product => Number(product.units_sold) > 0);
  const tabs = [
    { id: 'featured', label: 'Featured Products' },
    ...(hasBestSellers ? [{ id: 'best-sellers', label: 'Best Sellers' }] : []),
    { id: 'new', label: 'New Arrivals' }
  ];
  const visibleProducts = activeTab === 'best-sellers'
    ? [...products].sort((a, b) => Number(b.units_sold || 0) - Number(a.units_sold || 0))
    : activeTab === 'new'
      ? [...products].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0) || Number(b.id) - Number(a.id))
      : products;

  return (
    <>
      <HeroSection products={products} />
      <ServiceBenefits />
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <CategorySection categories={categories} onSelectCategory={selectCategory} />
        <FeaturedProducts
          loading={loading}
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={tab => { setActiveTab(tab); setShowAllProducts(false); }}
          products={visibleProducts}
          showAll={showAllProducts}
          error={catalogError}
          selectedCategory={selectedCategory}
          onViewAll={viewAllProducts}
          onClearCategory={() => {
            setSelectedCategory('all');
            setShowAllProducts(false);
          }}
        />
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#1766d1]">{t('Sano Bazar Journal')}</p><h2 className="mt-1 text-xl font-black tracking-tight text-[#17263d] sm:text-2xl">{t('Helpful reads')}</h2></div>
            <Link to="/blog" className="inline-flex items-center gap-1 text-xs font-bold text-[#1766d1] hover:text-blue-800">{t('Read the blog')} <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredArticles.map(article => <Link key={article.slug} to={`/blog/${article.slug}`} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <img src={article.image} alt="" loading="lazy" className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              <div className="p-5"><p className="text-[10px] font-bold uppercase tracking-wider text-[#1766d1]">{t(article.category)}</p><h3 className="mt-2 line-clamp-2 text-base font-black leading-6 text-[#17263d]">{t(article.title)}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{t(article.excerpt)}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#1766d1]">{t('Read article')} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></div>
            </Link>)}
          </div>
        </section>
      </div>
    </>
  );
}
