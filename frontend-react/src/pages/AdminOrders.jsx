import { useCallback, useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { API_BASE } from '../lib/api';
import { formatNPR } from '../lib/currency';

const statuses = ['pending', 'processing', 'completed', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [draftStatuses, setDraftStatuses] = useState({});
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  const loadOrders = useCallback(async () => {
    const response = await fetch(`${API_BASE}/admin_orders.php`, { credentials: 'include' });
    const data = await response.json();
    if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Unable to load orders.');
    setOrders(data.data || []);
  }, []);

  useEffect(() => {
    let active = true;
    const loadInitialOrders = async () => {
      try {
        const response = await fetch(`${API_BASE}/admin_orders.php`, { credentials: 'include' });
        const data = await response.json();
        if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Unable to load orders.');
        if (active) setOrders(data.data || []);
      } catch (err) {
        if (active) setError(err.message);
      }
    };
    loadInitialOrders();
    return () => { active = false; };
  }, []);

  const saveStatus = async (order) => {
    setSavingId(Number(order.id));
    setError('');
    try {
      const response = await fetch(`${API_BASE}/admin_orders.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: order.id, order_status: draftStatuses[order.id] || order.order_status })
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Could not update order.');
      await loadOrders();
      setDraftStatuses(current => { const next = { ...current }; delete next[order.id]; return next; });
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <header><h1 className="text-2xl font-black text-gray-900">Orders</h1><p className="mt-1 text-sm text-gray-500">Review customer orders and update their status.</p></header>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 p-5 font-bold text-gray-900"><ClipboardList className="h-5 w-5 text-brand" />{orders.length} orders</div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Delivery</th><th className="p-4">Payment</th><th className="p-4">Items</th><th className="p-4">Total</th><th className="p-4">Date</th><th className="p-4">Status</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(order => <tr key={order.id}>
              <td className="p-4 font-bold">#{order.id}</td><td className="p-4"><p className="font-semibold">{order.customer_name}</p><p className="text-xs text-gray-500">{order.email}</p></td><td className="max-w-56 p-4"><p className="font-semibold">{order.phone_number || 'No phone saved'}</p><p className="text-xs text-gray-500">{order.shipping_address || 'No address saved'}</p></td><td className="p-4"><p className="font-semibold">{order.payment_method === 'digital' ? 'Digital wallet' : 'Cash on delivery'}</p><p className="text-xs capitalize text-gray-500">{order.payment_status}</p></td><td className="p-4">{order.item_count}</td><td className="p-4"><p className="font-semibold">{formatNPR(order.total_amount)}</p>{order.promo_code && <p className="mt-1 text-xs text-emerald-700">{order.promo_code} · −{formatNPR(order.discount_amount)}</p>}</td><td className="p-4 text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
              <td className="p-4"><div className="flex items-center gap-2"><select value={draftStatuses[order.id] || order.order_status} onChange={event => setDraftStatuses(current => ({ ...current, [order.id]: event.target.value }))} className="rounded-lg border border-gray-200 px-2 py-1.5 capitalize">{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select><button disabled={savingId === Number(order.id) || !draftStatuses[order.id] || draftStatuses[order.id] === order.order_status} onClick={() => saveStatus(order)} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40">Save</button></div></td>
            </tr>)}
            {orders.length === 0 && !error && <tr><td colSpan="8" className="p-8 text-center text-gray-500">No orders found.</td></tr>}
          </tbody>
        </table></div>
      </div>
    </section>
  );
}
