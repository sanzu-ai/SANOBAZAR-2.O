import { useEffect, useState } from 'react';
import { API_BASE } from '../lib/api';
import HeroSection from '../components/HeroSection';
import ServiceBenefits from '../components/ServiceBenefits';
import CategorySection from '../components/CategorySection';
import FeaturedProducts from '../components/FeaturedProducts';
import NewsletterSection from '../components/NewsletterSection';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

export default function Home({ searchQuery }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
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
    setShowAllProducts(false);
    window.setTimeout(() => document.getElementById('best-sellers')?.scrollIntoView({ behavior: 'smooth' }), 0);
  };

  const viewAllProducts = () => setShowAllProducts(value => !value);

  return (
    <>
      <HeroSection products={products} />
      <ServiceBenefits />
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <CategorySection categories={categories} onSelectCategory={selectCategory} />
        <FeaturedProducts
          products={products}
          loading={loading}
          showAll={showAllProducts}
          error={catalogError}
          selectedCategory={selectedCategory}
          onViewAll={viewAllProducts}
          onClearCategory={() => {
            setSelectedCategory('all');
            setShowAllProducts(false);
          }}
        />
        {!loading && products.length > 0 && <section className="space-y-4"><div className="flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#1766d1]">Recently added to the catalog</p><h2 className="mt-1 text-xl font-black text-[#17263d] sm:text-2xl">New Arrivals</h2></div><Link to="/shop?sort=newest" className="text-xs font-bold text-[#1766d1]">View all products →</Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{[...products].sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)).slice(0,6).map(product=><ProductCard key={product.id} product={product}/>)}</div></section>}
        <section className="flex flex-col justify-between gap-4 rounded-2xl bg-[#eaf2ff] p-6 sm:flex-row sm:items-center sm:p-8"><div><p className="text-xs font-bold uppercase tracking-wide text-[#1766d1]">Special offers</p><h2 className="mt-1 text-xl font-black text-[#17263d]">Looking for a deal?</h2><p className="mt-2 text-sm text-slate-600">Promotional prices will appear here when offers are configured. Browse the catalog for current prices and stock.</p></div><Link to="/shop" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#1766d1] px-5 py-3 text-sm font-bold text-white">Explore products</Link></section>
      </div>
      <NewsletterSection />
    </>
  );
}
