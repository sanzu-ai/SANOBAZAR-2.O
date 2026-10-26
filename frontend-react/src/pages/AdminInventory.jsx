import { useCallback, useEffect, useState } from 'react';
import { Boxes, RefreshCw } from 'lucide-react';
import { API_BASE } from '../lib/api';
import { formatNPR } from '../lib/currency';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadInventory = useCallback(async () => {
    const response = await fetch(`${API_BASE}/get_admin_stats.php`, { credentials: 'include' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to load inventory.');
    setItems(data.low_stock_items || []);
  }, []);

  useEffect(() => {
    let active = true;
    const loadInitialInventory = async () => {
      try {
        const response = await fetch(`${API_BASE}/get_admin_stats.php`, { credentials: 'include' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to load inventory.');
        if (active) setItems(data.low_stock_items || []);
      } catch (err) {
        if (active) setError(err.message);
      }
    };
    loadInitialInventory();
    return () => { active = false; };
  }, []);

  const restock = async (productId) => {
    const quantity = Number(window.prompt('How many units should be added?', '10'));
    if (!Number.isInteger(quantity) || quantity < 1) return;
    setBusyId(productId);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/admin_products.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restock', product_id: productId, add_quantity: quantity })
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Could not restock product.');
      await loadInventory();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-gray-900">Inventory</h1>
        <p className="mt-1 text-sm text-gray-500">Review low-stock products and restock items.</p>
      </header>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-100 p-5 font-bold text-gray-900"><Boxes className="h-5 w-5 text-brand" />Low stock ({items.length})</div>
        <div className="divide-y divide-gray-100">
          {items.map(item => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
              <div className="flex items-center gap-3"><img src={item.image_url} alt="" className="h-12 w-12 rounded-lg object-cover bg-gray-100" /><div><p className="font-semibold text-gray-900">{item.name}</p><p className="text-sm text-gray-500">{formatNPR(item.price)}</p></div></div>
              <div className="flex items-center gap-3"><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{item.stock_quantity} left</span><button disabled={busyId === Number(item.id)} onClick={() => restock(Number(item.id))} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"><RefreshCw className="h-4 w-4" />Restock</button></div>
            </div>
          ))}
          {items.length === 0 && !error && <p className="p-8 text-center text-sm text-gray-500">No low-stock products right now.</p>}
        </div>
      </div>
    </section>
  );
}
