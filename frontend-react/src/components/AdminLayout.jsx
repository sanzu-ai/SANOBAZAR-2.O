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
    <div className="min-h-screen flex bg-[#f9fafb]">
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Close admin menu' : 'Open admin menu'}
        aria-expanded={sidebarOpen}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-lg border border-gray-200 shadow-sm"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 w-64 h-screen bg-[#0f172a] text-white p-6 flex flex-col transform transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Admin Brand */}
        <div className="pb-6 border-b border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <img src="/sanobazar-icon.svg" alt="" className="h-8 w-8 rounded-lg" />
            <h1 className="text-xl font-black tracking-tight text-white">SANOBAZAR</h1>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Admin Portal</span>
        </div>

        {/* User Info */}
        <div className="py-5 border-b border-slate-700/50">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Logged in as</p>
          <p className="text-xs font-bold text-white">{currentUser.full_name}</p>
          <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
        </div>

        {/* Navigation Menu */}
        <nav aria-label="Admin navigation" className="flex-1 pt-6 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
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
          className="flex items-center gap-3 px-4 py-2.5 text-left rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all mt-6 border border-red-500/20"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
