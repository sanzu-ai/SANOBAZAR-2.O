import { useEffect, useState } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import { API_BASE } from '../lib/api';

async function fetchContactMessages() {
  const response = await fetch(`${API_BASE}/contact_messages.php`, { credentials: 'include' });
  const result = await response.json();
  if (!response.ok || result.status !== 'success') throw new Error(result.message || 'Unable to load contact messages.');
  return Array.isArray(result.data) ? result.data : [];
}

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMessages = async () => {
    try {
      setMessages(await fetchContactMessages());
      setError('');
    } catch (reason) {
      setError(reason.message || 'Unable to load contact messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchContactMessages()
      .then(data => { if (active) setMessages(data); })
      .catch(reason => { if (active) setError(reason.message || 'Unable to load contact messages.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Customer support</p><h1 className="mt-1 text-2xl font-black text-slate-900">Contact Messages</h1><p className="mt-1 text-sm text-slate-500">Messages submitted from the store Contact page.</p></div>
        <button onClick={() => { setLoading(true); loadMessages(); }} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={15} className={loading ? 'animate-spin' : ''}/>Refresh</button>
      </div>
      {error && <p role="alert" className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
      {loading ? <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm">Loading messages…</p> : messages.length === 0 && !error ? <div className="rounded-2xl bg-white p-10 text-center shadow-sm"><Mail className="mx-auto text-slate-300" size={32}/><p className="mt-3 font-bold text-slate-700">No contact messages yet</p></div> : <div className="space-y-4">{messages.map(message => <article key={message.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-black text-slate-900">{message.subject}</h2><p className="mt-1 text-sm text-slate-600">{message.full_name}{message.phone ? ` · ${message.phone}` : ''}</p></div><time className="text-xs text-slate-500">{new Date(message.created_at).toLocaleString()}</time></div>
        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{message.message}</p>
        <a className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900" href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}><Mail size={15}/>Reply to {message.email}</a>
      </article>)}</div>}
    </div>
  );
}
