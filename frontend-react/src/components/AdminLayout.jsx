import { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Store,
  LogOut,
  Menu,
  X,
  Package,
  ClipboardList,
  Boxes,
  Users,
  Settings,
  Mail
} from 'lucide-react';
import { API_BASE } from '../lib/api';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Secure Admin Role Guard
  const [currentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sanobazar_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE}/logout.php`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Logout failed');
    } catch {
      window.alert('Could not reach the server to sign out. Please try again.');
      return;
    }
    localStorage.removeItem('sanobazar_user');
    window.dispatchEvent(new CustomEvent('sanobazar:auth-change', { detail: { user: null } }));
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/analytics', label: 'Sales Analytics', icon: BarChart3 },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/orders', label: 'Orders', icon: ClipboardList },
    { path: '/admin/inventory', label: 'Inventory', icon: Boxes },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/messages', label: 'Messages', icon: Mail },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
    { path: '/', label: 'View Shop', icon: Store }
  ];

  return (
    <div className="min-h-screen flex bg-[#f4efe6]">
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Close admin menu' : 'Open admin menu'}
        aria-expanded={sidebarOpen}
        className="fixed top-4 left-4 z-50 rounded-lg border border-[#e8ded2] bg-[#fffdf9] p-2 shadow-sm lg:hidden"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 flex h-screen w-64 transform flex-col bg-[#211712] p-5 text-white transition-transform sm:p-6 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Admin Brand */}
        <div className="border-b border-white/10 pb-6">
          <Link to="/" aria-label="Sano Bazar home" className="inline-flex rounded-md bg-white px-2 py-1.5">
            <img src="/sanobazar-logo.svg" alt="Sano Bazar" className="h-12 w-auto" />
          </Link>
          <span className="mt-3 block text-[10px] font-bold uppercase tracking-widest text-[#e6b65a]">Admin Portal</span>
        </div>

        {/* User Info */}
        <div className="border-b border-white/10 py-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#b7a99b] mb-1">Logged in as</p>
          <p className="text-xs font-bold text-white">{currentUser.full_name}</p>
          <p className="truncate text-[10px] text-[#b7a99b]">{currentUser.email}</p>
        </div>

        {/* Navigation Menu */}
        <nav aria-label="Admin navigation" className="admin-sidebar-nav flex-1 space-y-1 overflow-y-auto pt-6">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'border border-[#e6b65a]/15 bg-[#35281f] text-[#e6b65a]'
                    : 'text-[#c4b8ad] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 flex items-center gap-3 rounded-xl border border-rose-300/15 px-4 py-2.5 text-left text-xs font-bold text-rose-300 transition-all hover:bg-rose-500/10"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
