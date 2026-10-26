import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search } from 'lucide-react';
import { API_BASE } from '../lib/api';
import { formatNPR } from '../lib/currency';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/admin_products.php`, { credentials: 'include' })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Unable to load products.');
        return result;
      })
      .then(result => setProducts(Array.isArray(result) ? result : (result.data || [])))
      .catch(err => setError(err.message));
  }, []);

  const shownProducts = products.filter(product =>
    `${product.name} ${product.category_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">Browse the store catalog and review product details.</p>
        </div>
        <Link to="/admin" className="rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brandDark">Manage products</Link>
      </header>

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 p-5">
          <div className="flex items-center gap-2 font-bold text-gray-900"><Package className="h-5 w-5 text-brand" />{products.length} products</div>
          <label className="relative block w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search products" className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm" />
          </label>
        </div>
        {error && <p role="alert" className="p-5 text-sm text-red-700">{error}</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Stock</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {shownProducts.map(product => (
                <tr key={product.id}>
                  <td className="p-4"><div className="flex items-center gap-3"><img src={product.image_url} alt="" className="h-11 w-11 rounded-lg object-cover bg-gray-100" /><span className="font-semibold text-gray-900">{product.name}</span></div></td>
                  <td className="p-4 text-gray-600">{product.category_name || 'Uncategorized'}</td>
                  <td className="p-4 font-semibold">{formatNPR(product.price)}</td>
                  <td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${Number(product.stock_quantity) > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{Number(product.stock_quantity) > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}</span></td>
                </tr>
              ))}
              {!error && shownProducts.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-500">No matching products.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
