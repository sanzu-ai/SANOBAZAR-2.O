import { ArrowRight, BadgeCheck, ShoppingBag } from 'lucide-react';

const collageImages = [
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=85',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=85',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=85',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=85'
];

export default function HeroSection({ products = [] }) {
  const images = products.length >= 3
    ? [products[0].image_url, products[1].image_url, products[2].image_url, products[3]?.image_url || collageImages[3]]
    : collageImages;

  return (
    <section className="relative overflow-hidden bg-[#eaf1f9]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_45%,rgba(255,255,255,0.95),transparent_48%)]" />
      <div className="relative mx-auto grid min-h-[400px] max-w-7xl items-center gap-5 px-5 py-10 sm:px-8 md:min-h-[430px] md:grid-cols-[0.88fr_1.12fr] md:py-12 lg:px-12">
        <div className="relative z-10 max-w-xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1766d1] shadow-sm">
            <BadgeCheck className="h-3.5 w-3.5" /> Your one stop online store
          </div>
          <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-[#17263d] sm:text-5xl lg:text-[58px]">
            सबै सामान,<br />
            <span className="text-[#1766d1]">एउटै बजार</span>
          </h1>
          <h2 className="mt-3 text-lg font-bold text-[#253b5b] sm:text-xl">Shop Smarter. Live Better.</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-[15px]">
            Discover quality products at great prices, all in one place.
          </p>
          <a href="#best-sellers" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1766d1] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-[#0d54b4]">
            <ShoppingBag className="h-4 w-4" /> Shop Now <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="relative mx-auto h-[270px] w-full max-w-[570px] md:h-[340px]">
          <div className="absolute inset-x-8 bottom-3 h-20 rounded-[50%] bg-blue-900/10 blur-2xl" />
          <div className="absolute right-[20%] top-[3%] h-[76%] w-[56%] overflow-hidden rounded-2xl border-[7px] border-[#17263d] bg-white shadow-2xl sm:right-[22%]">
            <img src={images[2]} alt="Laptop and lifestyle products" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-slate-400 via-white to-slate-400" />
          </div>
          <div className="absolute bottom-[7%] left-[4%] h-[57%] w-[29%] overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl rotate-[-5deg]">
            <img src={images[0]} alt="Featured smartphone" className="h-full w-full object-cover" />
          </div>
          <div className="absolute bottom-[8%] left-[27%] h-[43%] w-[33%] overflow-hidden rounded-[28px] border-4 border-white bg-white shadow-xl rotate-[5deg]">
            <img src={images[1]} alt="Featured headphones" className="h-full w-full object-cover" />
          </div>
          <div className="absolute bottom-[10%] right-[5%] h-[47%] w-[27%] overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl rotate-[4deg]">
            <img src={images[3]} alt="Featured smartwatch" className="h-full w-full object-cover" />
          </div>
          <div className="absolute right-[2%] top-[3%] hidden rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Shop local</p>
            <p className="text-sm font-extrabold text-[#17263d]">Made for Nepal <span aria-hidden="true">🇳🇵</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}
