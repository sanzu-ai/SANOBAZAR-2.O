import { useEffect, useState } from 'react';
import { Save, Settings } from 'lucide-react';
import { API_BASE } from '../lib/api';

export default function AdminSettings() {
  const [profile, setProfile] = useState({ full_name: '', email: '' });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  return (
    <section className="max-w-3xl space-y-6">
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
    </section>
  );
}
