import { useEffect, useState } from 'react';
import { BadgePercent, Pencil, Save, Settings, Trash2, X } from 'lucide-react';
import { API_BASE } from '../lib/api';

export default function AdminSettings() {
  const [profile, setProfile] = useState({ full_name: '', email: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [promotionsLoading, setPromotionsLoading] = useState(true);
  const [promoSaving, setPromoSaving] = useState(false);
  const [promoBusyId, setPromoBusyId] = useState(null);
  const [editingPromoId, setEditingPromoId] = useState(null);
  const [promoMessage, setPromoMessage] = useState({ type: '', text: '' });
  const [promoForm, setPromoForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', minimum_order: '0', maximum_discount: '', usage_limit: '', starts_at: '', expires_at: '' });

  useEffect(() => {
    fetch(`${API_BASE}/admin_settings.php`, { credentials: 'include' })
      .then(async response => {
        const data = await response.json();
        if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Unable to load account settings.');
        return data.user;
      })
      .then(user => setProfile({ full_name: user.full_name, email: user.email }))
      .catch(err => setMessage({ type: 'error', text: err.message }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/admin_promos.php`, { credentials: 'include' })
      .then(async response => {
        const data = await response.json();
        if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Unable to load promo codes.');
        return data.data || [];
      })
      .then(data => { if (active) setPromotions(data); })
      .catch(error => { if (active) setPromoMessage({ type: 'error', text: error.message }); })
      .finally(() => { if (active) setPromotionsLoading(false); });
    return () => { active = false; };
  }, []);

  const saveSettings = async event => {
    event.preventDefault();
    setMessage({ type: '', text: '' });
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/admin_settings.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          current_password: currentPassword,
          new_password: newPassword
        })
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Could not save settings.');
      localStorage.setItem('sanobazar_user', JSON.stringify(data.user));
      setProfile({ full_name: data.user.full_name, email: data.user.email });
      setCurrentPassword('');
      setNewPassword('');
      setMessage({ type: 'success', text: data.message });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const savePromoCode = async event => {
    event.preventDefault();
    setPromoSaving(true);
    setPromoMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${API_BASE}/admin_promos.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...promoForm, action: editingPromoId ? 'update' : 'create', ...(editingPromoId ? { id: editingPromoId } : {}) })
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'success') throw new Error(data.message || `Could not ${editingPromoId ? 'update' : 'create'} promo code.`);
      setPromotions(data.data || []);
      setPromoForm({ code: '', discount_type: 'percentage', discount_value: '', minimum_order: '0', maximum_discount: '', usage_limit: '', starts_at: '', expires_at: '' });
      setEditingPromoId(null);
      setPromoMessage({ type: 'success', text: data.message });
    } catch (error) {
      setPromoMessage({ type: 'error', text: error.message });
    } finally {
      setPromoSaving(false);
    }
  };

  const startEditingPromo = promo => {
    setEditingPromoId(Number(promo.id));
    setPromoForm({
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: String(promo.discount_value),
      minimum_order: String(promo.minimum_order),
      maximum_discount: promo.maximum_discount === null ? '' : String(promo.maximum_discount),
      usage_limit: promo.usage_limit === null ? '' : String(promo.usage_limit),
      starts_at: promo.starts_at ? promo.starts_at.replace(' ', 'T').slice(0, 16) : '',
      expires_at: promo.expires_at ? promo.expires_at.replace(' ', 'T').slice(0, 16) : ''
    });
    setPromoMessage({ type: '', text: '' });
    document.getElementById('promo-code-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const cancelPromoEdit = () => {
    setEditingPromoId(null);
    setPromoForm({ code: '', discount_type: 'percentage', discount_value: '', minimum_order: '0', maximum_discount: '', usage_limit: '', starts_at: '', expires_at: '' });
    setPromoMessage({ type: '', text: '' });
  };

  const deletePromoCode = async promo => {
    if (!window.confirm(`Delete promo code ${promo.code}? This cannot be undone. Existing orders will keep their saved discount details.`)) return;
    setPromoBusyId(Number(promo.id));
    setPromoMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${API_BASE}/admin_promos.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: promo.id })
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Could not delete promo code.');
      setPromotions(data.data || []);
      if (editingPromoId === Number(promo.id)) cancelPromoEdit();
      setPromoMessage({ type: 'success', text: data.message });
    } catch (error) {
      setPromoMessage({ type: 'error', text: error.message });
    } finally {
      setPromoBusyId(null);
    }
  };

  const togglePromoCode = async promo => {
    setPromoBusyId(Number(promo.id));
    setPromoMessage({ type: '', text: '' });
    try {
      const response = await fetch(`${API_BASE}/admin_promos.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id: promo.id, is_active: Number(promo.is_active) ? 0 : 1 })
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Could not update promo code.');
      setPromotions(data.data || []);
      setPromoMessage({ type: 'success', text: data.message });
    } catch (error) {
      setPromoMessage({ type: 'error', text: error.message });
    } finally {
      setPromoBusyId(null);
    }
  };

  return (
    <section className="max-w-5xl space-y-6">
      <header><h1 className="text-2xl font-black text-gray-900">Settings</h1><p className="mt-1 text-sm text-gray-500">Manage your admin account details and password.</p></header>
      {message.text && <p role="status" className={`rounded-xl p-4 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{message.text}</p>}
      <form onSubmit={saveSettings} className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-4 font-bold text-gray-900"><Settings className="h-5 w-5 text-brand" />Admin account</div>
        {loading ? <p className="text-sm text-gray-500">Loading settings…</p> : <>
          <label className="block text-sm font-semibold text-gray-700">Full name<input required maxLength="100" value={profile.full_name} onChange={event => setProfile({ ...profile, full_name: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-normal" /></label>
          <label className="block text-sm font-semibold text-gray-700">Email address<input required type="email" maxLength="100" value={profile.email} onChange={event => setProfile({ ...profile, email: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-normal" /></label>
          <div className="border-t border-gray-100 pt-4"><h2 className="font-bold text-gray-900">Change password</h2><p className="mt-1 text-xs text-gray-500">Enter your current password to save account changes. Leave the new password blank to keep it.</p></div>
          <label className="block text-sm font-semibold text-gray-700">Current password<input required type="password" autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-normal" /></label>
          <label className="block text-sm font-semibold text-gray-700">New password<input type="password" minLength="8" autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-normal" /></label>
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brandDark disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save settings'}</button>
        </>}
      </form>

      <section className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
          <BadgePercent className="mt-0.5 h-5 w-5 text-brand" />
          <div><h2 className="font-bold text-gray-900">Promo codes</h2><p className="mt-1 text-sm text-gray-500">Create discount codes and control their minimum order, cap, schedule, and usage limit.</p></div>
        </div>
        {promoMessage.text && <p role="status" className={`rounded-xl p-3 text-sm ${promoMessage.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{promoMessage.text}</p>}
        <form id="promo-code-form" onSubmit={savePromoCode} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-semibold text-gray-700">Code<input required minLength="2" maxLength="40" pattern="[A-Za-z0-9][A-Za-z0-9_-]{1,39}" value={promoForm.code} onChange={event => setPromoForm({ ...promoForm, code: event.target.value.toUpperCase() })} placeholder="WELCOME10" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-mono font-semibold uppercase" /></label>
          <label className="text-sm font-semibold text-gray-700">Discount type<select value={promoForm.discount_type} onChange={event => setPromoForm({ ...promoForm, discount_type: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 font-normal"><option value="percentage">Percentage (%)</option><option value="fixed">Fixed amount (NPR)</option></select></label>
          <label className="text-sm font-semibold text-gray-700">Discount value<input required type="number" min="0.01" max={promoForm.discount_type === 'percentage' ? '100' : undefined} step="0.01" value={promoForm.discount_value} onChange={event => setPromoForm({ ...promoForm, discount_value: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-normal" /></label>
          <label className="text-sm font-semibold text-gray-700">Minimum order (NPR)<input type="number" min="0" step="0.01" value={promoForm.minimum_order} onChange={event => setPromoForm({ ...promoForm, minimum_order: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-normal" /></label>
          <label className="text-sm font-semibold text-gray-700">Maximum discount (optional)<input type="number" min="0.01" step="0.01" value={promoForm.maximum_discount} onChange={event => setPromoForm({ ...promoForm, maximum_discount: event.target.value })} placeholder="No cap" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-normal" /></label>
          <label className="text-sm font-semibold text-gray-700">Total uses (optional)<input type="number" min="1" step="1" value={promoForm.usage_limit} onChange={event => setPromoForm({ ...promoForm, usage_limit: event.target.value })} placeholder="Unlimited" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-normal" /></label>
          <label className="text-sm font-semibold text-gray-700">Starts at<input type="datetime-local" value={promoForm.starts_at} onChange={event => setPromoForm({ ...promoForm, starts_at: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-normal" /></label>
          <label className="text-sm font-semibold text-gray-700">Expires at<input type="datetime-local" value={promoForm.expires_at} onChange={event => setPromoForm({ ...promoForm, expires_at: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 font-normal" /></label>
          <div className="flex flex-wrap gap-2 self-end sm:col-span-2 lg:col-span-4">
            <button disabled={promoSaving} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-bold text-white hover:bg-brandDark disabled:opacity-50"><BadgePercent className="h-4 w-4" />{promoSaving ? (editingPromoId ? 'Saving…' : 'Creating…') : (editingPromoId ? 'Save changes' : 'Create promo code')}</button>
            {editingPromoId && <button type="button" onClick={cancelPromoEdit} disabled={promoSaving} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"><X className="h-4 w-4" />Cancel edit</button>}
          </div>
        </form>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-3">Code</th><th className="p-3">Discount</th><th className="p-3">Minimum</th><th className="p-3">Uses</th><th className="p-3">Expires</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {promotions.map(promo => <tr key={promo.id}>
                <td className="p-3 font-mono font-bold text-gray-900">{promo.code}</td>
                <td className="p-3">{promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `NPR ${Number(promo.discount_value).toLocaleString('en-NP')}`}{promo.maximum_discount !== null && <span className="block text-xs text-gray-500">Max NPR {Number(promo.maximum_discount).toLocaleString('en-NP')}</span>}</td>
                <td className="p-3">NPR {Number(promo.minimum_order).toLocaleString('en-NP')}</td>
                <td className="p-3">{promo.usage_count}{promo.usage_limit === null ? ' / ∞' : ` / ${promo.usage_limit}`}</td>
                <td className="p-3 text-gray-600">{promo.expires_at ? new Date(promo.expires_at.replace(' ', 'T')).toLocaleString() : 'No expiry'}</td>
                <td className="p-3"><button type="button" disabled={promoBusyId === Number(promo.id)} onClick={() => togglePromoCode(promo)} className={`rounded-full px-3 py-1.5 text-xs font-bold disabled:opacity-50 ${Number(promo.is_active) ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{Number(promo.is_active) ? 'Active · Pause' : 'Paused · Activate'}</button></td>
                <td className="p-3"><div className="flex items-center gap-2"><button type="button" disabled={promoBusyId === Number(promo.id) || promoSaving} onClick={() => startEditingPromo(promo)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"><Pencil className="h-3.5 w-3.5" />Edit</button><button type="button" disabled={promoBusyId === Number(promo.id) || promoSaving} onClick={() => deletePromoCode(promo)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" />Delete</button></div></td>
              </tr>)}
              {!promotionsLoading && promotions.length === 0 && <tr><td colSpan="7" className="p-6 text-center text-sm text-gray-500">No promo codes yet. Create one above to make it available in the storefront.</td></tr>}
              {promotionsLoading && <tr><td colSpan="7" className="p-6 text-center text-sm text-gray-500">Loading promo codes…</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
