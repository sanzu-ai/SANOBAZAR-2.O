import { useEffect, useState } from 'react';
import { Layers, Receipt, ShoppingBag, TrendingUp, Trophy } from 'lucide-react';
import { API_BASE } from '../lib/api';
import { formatNPR } from '../lib/currency';

const emptyAnalytics = {
  total_revenue: 0,
  total_orders: 0,
  completed_orders: 0,
  avg_order_value: 0,
  monthly_trend: [],
  category_sales: [],
  top_products: []
};

const money = formatNPR;

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/get_analytics.php`, { credentials: 'include' })
      .then(async response => {
        const data = await response.json();
        if (!response.ok || data.status !== 'success') {
          throw new Error(data.message || 'Unable to load sales analytics.');
        }
        return data.data;
      })
      .then(data => {
        if (active) {
          setAnalytics({
            ...emptyAnalytics,
            ...data,
            monthly_trend: Array.isArray(data.monthly_trend) ? data.monthly_trend : [],
            category_sales: Array.isArray(data.category_sales) ? data.category_sales : [],
            top_products: Array.isArray(data.top_products) ? data.top_products : []
          });
        }
      })
      .catch(reason => { if (active) setError(reason.message || 'Unable to load sales analytics.'); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, []);

  const parseNum = value => {
    if (value === null || value === undefined) return 0;
    const number = Number(String(value).replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(number) ? number : 0;
  };

  const maxCategoryRevenue = Math.max(...analytics.category_sales.map(item => parseNum(item.category_revenue)), 1);
  const maxMonthlyRevenue = Math.max(...analytics.monthly_trend.map(item => parseNum(item.revenue)), 1);
  const statCards = [
    { label: 'Completed Revenue', value: money(analytics.total_revenue), icon: TrendingUp, color: 'emerald' },
    { label: 'Orders Placed', value: parseNum(analytics.total_orders).toLocaleString(), icon: ShoppingBag, color: 'blue' },
    { label: 'Average Completed Order', value: money(analytics.avg_order_value), icon: Receipt, color: 'purple' }
  ];
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100'
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">Sales Analytics</h1>
        <p className="mt-1 text-xs text-gray-500">Completed sales, order trends, and product performance</p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <article key={label} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl border ${colorMap[color]}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
            <p className="text-2xl font-black text-gray-900">{value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-gray-900">Revenue over time</h2>
              <p className="mt-1 text-xs text-gray-500">Completed orders · last six months</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              {parseNum(analytics.completed_orders).toLocaleString()} completed orders
            </span>
          </div>
          {loading ? <p className="py-16 text-center text-sm text-gray-400">Loading sales trend…</p> : (
            <div role="img" aria-label="Monthly completed revenue for the last six months" className="flex h-60 items-end gap-2 border-b border-gray-100 px-1 sm:gap-4">
              {analytics.monthly_trend.map(month => {
                const revenue = parseNum(month.revenue);
                const height = revenue > 0 ? Math.max((revenue / maxMonthlyRevenue) * 100, 4) : 1;
                return (
                  <div key={month.month} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2" title={`${month.label}: ${money(revenue)} · ${month.completed_orders} completed orders`}>
                    <div className="flex min-h-0 flex-1 items-end justify-center">
                      <div className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-emerald-700 to-emerald-400 transition-all" style={{ height: `${height}%` }} />
                    </div>
                    <span className="truncate text-center text-[10px] font-semibold text-gray-600 sm:text-xs">{month.label}</span>
                    <span className="mb-2 truncate text-center text-[9px] text-gray-400 sm:text-[10px]">{month.completed_orders} orders</span>
                  </div>
                );
              })}
              {!analytics.monthly_trend.length && !error && <p className="w-full pb-20 text-center text-sm text-gray-400">No completed sales in this period.</p>}
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 p-5">
            <Trophy className="h-4 w-4 text-amber-500" />
            <div>
              <h2 className="text-sm font-bold text-gray-900">Best-selling products</h2>
              <p className="mt-1 text-xs text-gray-500">Ranked by units in completed orders</p>
            </div>
          </div>
          {loading ? <p className="p-8 text-center text-sm text-gray-400">Loading products…</p> : analytics.top_products.length ? (
            <div className="divide-y divide-gray-100">
              {analytics.top_products.map((product, index) => (
                <article key={product.id} className="flex items-center gap-3 p-4">
                  <span className="w-5 text-sm font-black text-gray-400">{index + 1}</span>
                  <img src={product.image_url} alt="" className="h-12 w-12 rounded-lg bg-gray-50 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">{product.name}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">{product.category} · {product.units_sold} sold</p>
                  </div>
                  <span className="text-right text-xs font-bold text-emerald-700">{money(product.revenue)}</span>
                </article>
              ))}
            </div>
          ) : <p className="p-8 text-center text-sm text-gray-400">Completed orders will build this ranking.</p>}
        </section>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Layers className="h-4 w-4 text-gray-700" />
          <h2 className="text-sm font-bold text-gray-900">Sales performance by category</h2>
        </div>
        {loading ? <p className="py-8 text-center text-sm text-gray-400">Loading category performance…</p> : analytics.category_sales.length ? (
          <div className="space-y-4">
            {analytics.category_sales.map(category => {
              const revenue = parseNum(category.category_revenue);
              const percentage = (revenue / maxCategoryRevenue) * 100;
              return (
                <div key={category.category_id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-gray-900">{category.category_name}</span>
                    <span className="text-right text-gray-500">{category.items_sold} units <b className="ml-2 text-emerald-700">{money(revenue)}</b></span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-400 transition-all" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : <p className="py-8 text-center text-sm text-gray-400">No categories are available.</p>}
      </section>
    </div>
  );
}
