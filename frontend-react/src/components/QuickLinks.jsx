import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { catalogDepartments, catalogHref } from '../config/catalogMenu';

const quickLinkArt = {
  'phones-tablets': 'photo-1511707171634-5f897ff02aa9',
  audio: 'photo-1505740420928-5e560c06d30e',
  computers: 'photo-1496181133206-80ce9b88a853',
  furniture: 'photo-1555041469-a586c61ea9bc',
  kitchen: 'photo-1556911220-bff31c812dba',
  'home-decor': 'photo-1618221195710-dd6b41faaea6',
  clothing: 'photo-1529139574466-a303027c1d8b',
  shoes: 'photo-1549298916-b41d501d3772',
  bags: 'photo-1553062407-98eeb64c6a62',
  'pantry-staples': 'photo-1490645935967-10de6ba17061',
  'tea-beverages': 'photo-1597481499750-3e6b22637e12',
  'organic-foods': 'photo-1542838132-92c53300491e',
  'books-journals': 'photo-1544716278-ca5e3f4abd8c',
  'pens-writing': 'photo-1455390582262-044cdead277a',
  skincare: 'photo-1556228720-195a672e8a03',
  'health-wellness': 'photo-1608248543803-ba4f8c70ae0b',
  'personal-care': 'photo-1596462502278-27bfdc403348',
  accessories: 'photo-1511499767150-a48a237f0083',
  watches: 'photo-1523275335684-37898b6baf30',
  'everyday-accessories': 'photo-1548036328-c9fa89d128fa'
};

const quickLinks = catalogDepartments.flatMap(department => department.items.slice(0, 2).map(item => ({
  ...item,
  department: department.label,
  category: department.category || '',
  image: quickLinkArt[item.filter] || quickLinkArt.accessories
})));

export default function QuickLinks() {
  const { t } = useLanguage();

  return <section className="space-y-5">
    <div className="flex items-end justify-between gap-3">
      <div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#901a1c]">{t('Shop by what you need')}</p><h2 className="mt-1 text-2xl font-black tracking-tight text-[#302622] sm:text-3xl">{t('Quick links')}</h2></div>
      <Link to="/categories" className="inline-flex items-center gap-1 pb-1 text-xs font-bold text-[#901a1c] hover:text-[#741416]">{t('Browse all categories')}<ArrowRight size={14}/></Link>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {quickLinks.map(item => <Link key={`${item.department}-${item.filter}`} to={catalogHref({ category: item.category, filter: item.filter })} className="group relative aspect-[1.45] overflow-hidden rounded-2xl bg-[#e8e0d6] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
        <img src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=640&q=80`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"/>
        <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#201815]/80 via-[#201815]/10 to-transparent"/>
        <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-white sm:inset-x-4 sm:bottom-4"><span className="min-w-0"><span className="block truncate text-xs font-extrabold sm:text-sm">{t(item.label)}</span><span className="mt-1 block truncate text-[10px] font-medium text-white/75">{t(item.department)}</span></span><ArrowRight size={16} className="mb-0.5 shrink-0 transition group-hover:translate-x-1"/></span>
      </Link>)}
    </div>
  </section>;
}
