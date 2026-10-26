import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { API_BASE } from '../lib/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/admin_users.php`, { credentials: 'include' })
      .then(async response => {
        const data = await response.json();
        if (!response.ok || data.status !== 'success') throw new Error(data.message || 'Unable to load users.');
        return data;
      })
      .then(data => setUsers(data.data || []))
      .catch(err => setError(err.message));
  }, []);

  return (
    <section className="space-y-6">
      <header><h1 className="text-2xl font-black text-gray-900">Users</h1><p className="mt-1 text-sm text-gray-500">Customer and admin accounts registered with SANOBAZAR.</p></header>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-gray-100 p-5 font-bold text-gray-900"><Users className="h-5 w-5 text-brand" />{users.length} accounts</div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Orders</th><th className="p-4">Joined</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{users.map(user => <tr key={user.id}><td className="p-4 font-semibold">{user.full_name}</td><td className="p-4 text-gray-600">{user.email}</td><td className="p-4"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs capitalize">{user.role}</span></td><td className="p-4">{user.order_count}</td><td className="p-4 text-gray-600">{new Date(user.created_at).toLocaleDateString()}</td></tr>)}{users.length === 0 && !error && <tr><td colSpan="5" className="p-8 text-center text-gray-500">No user accounts found.</td></tr>}</tbody>
        </table></div>
      </div>
    </section>
  );
}
