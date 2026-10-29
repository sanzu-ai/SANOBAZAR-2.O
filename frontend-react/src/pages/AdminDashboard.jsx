import { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Plus, 
  Search, 
  Pencil,
  Trash2, 
  X, 
  Package, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { API_BASE } from '../lib/api';
import { formatNPR } from '../lib/currency';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_orders: 0,
    total_users: 0,
    low_stock_count: 0
  });
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and filter for product table
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category_id: '',
    price: '',
    stock: '',
    image_url: ''
  });
  const [modalMessage, setModalMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data without changing React state, so the initial effect can update
  // the UI from the completed network request instead of synchronously.
  const fetchDashboardData = useCallback(async () => {
    const [statsRes, prodRes, analyticsData] = await Promise.all([
      fetch(`${API_BASE}/get_admin_stats.php`, { credentials: 'include' }),
      fetch(`${API_BASE}/admin_products.php`, { credentials: 'include' }),
      fetch(`${API_BASE}/get_analytics.php`, { credentials: 'include' })
        .then(response => response.json())
        .then(data => data.status === 'success' ? data.data : null)
        .catch(() => null)
    ]);
    const [statsData, prodData] = await Promise.all([
      statsRes.json(),
      prodRes.json()
    ]);

    if (!statsRes.ok || !prodRes.ok) {
      throw new Error(statsData.message || prodData.message || 'Unable to load admin data. Please sign in again.');
    }

    return {
      stats: statsData.stats || statsData,
      monthlyTrend: Array.isArray(analyticsData?.monthly_trend) ? analyticsData.monthly_trend : [],
      recentOrders: statsData.recent_orders || [],
      products: Array.isArray(prodData) ? prodData : (Array.isArray(prodData.data) ? prodData.data : [])
    };
  }, []);

  const applyDashboardData = useCallback((data) => {
    setStats(data.stats);
    setMonthlyTrend(data.monthlyTrend);
    setRecentOrders(data.recentOrders);
    setProducts(data.products);
  }, []);

  const reloadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      applyDashboardData(await fetchDashboardData());
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [applyDashboardData, fetchDashboardData]);

  useEffect(() => {
    let isMounted = true;

    // Categories are public and load independently from the admin-only APIs.
    // A missing/expired admin session should not leave the product form blank.
    fetch(`${API_BASE}/get_categories.php`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || data.status === 'error') {
          throw new Error(data.message || 'Could not load categories.');
        }
        return data;
      })
      .then((data) => {
        const categoryList = Array.isArray(data)
          ? data
          : (Array.isArray(data.data) ? data.data : []);
        if (!isMounted) return;
        setCategories(categoryList);
        setCategoryError('');
        if (categoryList.length > 0) {
          setNewProduct((prev) => prev.category_id
            ? prev
            : { ...prev, category_id: String(categoryList[0].id) });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setCategoryError(err.message || 'Could not load categories.');
          console.error('Error loading product categories:', err);
        }
      });

    fetchDashboardData()
      .then((data) => {
        if (isMounted) applyDashboardData(data);
      })
      .catch((err) => {
        if (isMounted) console.error('Error loading admin dashboard data:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [applyDashboardData, fetchDashboardData]);

  // Handle Add Product Submit
  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setModalMessage({ type: '', text: '' });

    const price = Number(newProduct.price);
    const stock = Number(newProduct.stock);
    if (!newProduct.name.trim() || !newProduct.category_id || !Number.isFinite(price) || price <= 0 ||
        !Number.isInteger(stock) || stock < 0 || (!editingProduct && stock === 0)) {
      setModalMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_BASE}/admin_products.php`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editingProduct ? 'update' : 'add',
          ...(editingProduct ? { product_id: editingProduct.id } : {}),
          name: newProduct.name,
          category_id: parseInt(newProduct.category_id, 10),
          price,
          stock_quantity: stock,
          image_url: newProduct.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        setModalMessage({
          type: 'success',
          text: editingProduct ? 'Product updated successfully!' : 'Product added successfully!'
        });
        setTimeout(() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
          setModalMessage({ type: '', text: '' });
          setNewProduct({
            name: '',
            category_id: categories.length > 0 ? String(categories[0].id) : '',
            price: '',
            stock: '',
            image_url: ''
          });
          reloadDashboard();
        }, 1000);
      } else {
        setModalMessage({ type: 'error', text: data.message || 'Failed to add product.' });
      }
    } catch {
      setModalMessage({ type: 'error', text: 'Server error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    setModalMessage({ type: '', text: '' });
    setNewProduct({
      name: '',
      category_id: categories.length > 0 ? String(categories[0].id) : '',
      price: '',
      stock: '',
      image_url: ''
    });
    setIsAddModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setModalMessage({ type: '', text: '' });
    setNewProduct({
      name: product.name || '',
      category_id: String(product.category_id || ''),
      price: String(product.price ?? ''),
      stock: String(product.stock_quantity ?? 0),
      image_url: product.image_url || ''
    });
    setIsAddModalOpen(true);
  };

  // Quick Restock Product
  const handleRestock = async (productId) => {
    const addQty = prompt(`Enter quantity to add for product ID #${productId}:`, '10');
    if (!addQty || isNaN(addQty) || parseInt(addQty) <= 0) return;

    try {
      const res = await fetch(`${API_BASE}/admin_products.php`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restock',
          product_id: productId,
          add_quantity: parseInt(addQty, 10)
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        reloadDashboard();
      } else {
        alert(data.message || 'Failed to restock product');
      }
    } catch {
      alert('Error updating stock');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId, productName) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;

    try {
      const res = await fetch(`${API_BASE}/admin_products.php?id=${productId}`, {
        credentials: 'include',
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.status === 'success') {
        reloadDashboard();
      } else {
        alert(data.message || 'Cannot delete product because it is linked to existing orders.');
      }
    } catch {
      alert('Failed to delete product.');
    }
  };

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || String(p.category_id) === String(selectedCategory);
    return matchesSearch && matchesCat;
  });
  const maxMonthRevenue = Math.max(...monthlyTrend.map(month => Number(month.revenue) || 0), 1);
  const chartPoints = monthlyTrend.map((month, index) => {
    const x = monthlyTrend.length < 2 ? 300 : 24 + (index * 552) / (monthlyTrend.length - 1);
    const revenue = Number(month.revenue) || 0;
    const y = 150 - (revenue / maxMonthRevenue) * 120;
    return { x, y, month };
  });
  const linePoints = chartPoints.map(point => `${point.x},${point.y}`).join(' ');
  const areaPath = chartPoints.length
    ? `M ${chartPoints[0].x},160 L ${chartPoints.map(point => `${point.x},${point.y}`).join(' L ')} L ${chartPoints[chartPoints.length - 1].x},160 Z`
    : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e6b65a] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#241a17] sm:space-y-7">
      
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#211712]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#81756d]">Here’s how Sano Bazar is doing today.</p>
        </div>
        <button
          onClick={openAddProductModal}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ae292d] px-4 py-2.5 font-semibold text-white shadow-sm transition-all hover:bg-[#912126]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Metric Cards (4 Grid) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        
        {/* Total Revenue */}
        <div className="flex items-center justify-between rounded-[22px] border border-[#e8ded2] bg-[#fffdf9] p-5">
          <div>
            <p className="text-xs font-medium text-[#81756d]">Revenue</p>
            <h3 className="mt-1 text-2xl font-black text-[#211712]">
              {formatNPR(stats.total_revenue)}
            </h3>
            <span className="mt-1 inline-block text-[11px] font-medium text-[#417b4d]">{new Date().toLocaleDateString('en', { month: 'short' })} · completed orders</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6eddb] text-[#9b7227]">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="flex items-center justify-between rounded-[22px] border border-[#e8ded2] bg-[#fffdf9] p-5">
          <div>
            <p className="text-xs font-medium text-[#81756d]">Orders</p>
            <h3 className="mt-1 text-2xl font-black text-[#211712]">{stats.total_orders || 0}</h3>
            <span className="mt-1 inline-block text-[11px] font-medium text-[#81756d]">All orders</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6eddb] text-[#9b7227]">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="flex items-center justify-between rounded-[22px] border border-[#e8ded2] bg-[#fffdf9] p-5">
          <div>
            <p className="text-xs font-medium text-[#81756d]">Customers</p>
            <h3 className="mt-1 text-2xl font-black text-[#211712]">{stats.total_users || 0}</h3>
            <span className="mt-1 inline-block text-[11px] font-medium text-[#81756d]">Registered accounts</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6eddb] text-[#9b7227]">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="flex items-center justify-between rounded-[22px] border border-[#e8ded2] bg-[#fffdf9] p-5">
          <div>
            <p className="text-xs font-medium text-[#81756d]">Low stock</p>
            <h3 className="mt-1 text-2xl font-black text-[#211712]">{stats.low_stock_count || 0}</h3>
            <span className="mt-1 inline-block text-[11px] font-medium text-[#81756d]">5 or fewer in stock</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6eddb] text-[#9b7227]">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Monthly sales and recent orders */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_1fr]">
        <section className="rounded-[22px] border border-[#e8ded2] bg-[#fffdf9] p-5 sm:p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#211712]">Monthly sales</h2>
              <p className="mt-1 text-xs text-[#81756d]">Completed revenue · last six months</p>
            </div>
            <span className="rounded-full bg-[#f6eddb] px-3 py-1 text-[10px] font-bold text-[#8e6828]">NPR</span>
          </div>
          <div className="relative mt-4 h-48 sm:h-56" role="img" aria-label="Monthly completed revenue for the last six months">
            <svg viewBox="0 0 600 170" preserveAspectRatio="none" className="h-[calc(100%-28px)] w-full overflow-visible">
              <defs><linearGradient id="dashboard-sales-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#d89e3e" stopOpacity=".27"/><stop offset="100%" stopColor="#d89e3e" stopOpacity="0"/></linearGradient></defs>
              {[30, 70, 110, 150].map(y => <line key={y} x1="20" x2="580" y1={y} y2={y} stroke="#eee6dc" strokeDasharray="3 5"/>)}
              {areaPath && <path d={areaPath} fill="url(#dashboard-sales-fill)"/>}
              {linePoints && <polyline points={linePoints} fill="none" stroke="#b57b25" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>}
              {chartPoints.map(point => <circle key={point.month.month} cx={point.x} cy={point.y} r="4" fill="#fffdf9" stroke="#b57b25" strokeWidth="2.5"><title>{point.month.label}: {formatNPR(point.month.revenue)}</title></circle>)}
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 px-2">
              {monthlyTrend.map(month => <span key={month.month} className="truncate text-center text-[9px] text-[#81756d] sm:text-[10px]">{month.label?.split(' ')[0]}</span>)}
            </div>
            {monthlyTrend.length > 0 && monthlyTrend.every(month => !(Number(month.revenue) > 0)) && <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-xs text-[#a1968c]">No completed sales in this period yet.</span>}
          </div>
        </section>

        {/* Recent Orders Box */}
        <section className="rounded-[22px] border border-[#e8ded2] bg-[#fffdf9] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#211712] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#b57b25]" />
              <span>Recent Customer Orders</span>
            </h2>
            <span className="text-[10px] font-semibold bg-[#f6eddb] text-[#8e6828] px-2.5 py-1 rounded-full">
              Latest Activity
            </span>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-[#81756d] py-4 text-center">No orders placed yet.</p>
          ) : (
            <div className="divide-y divide-[#eee6dc] max-h-60 overflow-y-auto pr-1">
              {recentOrders.map((ord) => (
                <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[#30251f]">Order #{ord.id} - {ord.customer_name || 'Customer'}</p>
                    <p className="text-[11px] text-[#a1968c]">{new Date(ord.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#30251f]">{formatNPR(ord.total_amount)}</p>
                    <span className="capitalize text-[10px] font-semibold text-[#417b4d] bg-[#e9f2e6] px-2 py-0.5 rounded-full">
                      {ord.order_status || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Main Inventory Management Table */}
      <div className="overflow-hidden rounded-[22px] border border-[#e8ded2] bg-[#fffdf9]">
        
        {/* Table Controls Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#eee6dc] p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-[#211712] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#b57b25]" />
              <span>Product Inventory Catalog</span>
            </h2>
            <p className="text-xs text-[#81756d]">Manage pricing, stock count, and product details.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-[#e8ded2] bg-[#fbf8f2] py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#ae292d]/20"
              />
            </div>

            {/* Category Dropdown Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-[#e8ded2] bg-[#fbf8f2] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#ae292d]/20"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.category_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#eee6dc] bg-[#f8f4ed] text-[11px] font-semibold uppercase tracking-wider text-[#81756d]">
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Price</th>
                <th className="py-3.5 px-6">Stock Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee6dc] text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                    <td colSpan="5" className="py-8 text-center text-[#a1968c]">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-[#fbf8f2]">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img src={p.image_url} alt={p.name} className="h-10 w-10 shrink-0 rounded-lg border border-[#eee6dc] bg-[#f8f4ed] object-contain p-1" />
                        <div>
                          <p className="font-semibold text-[#30251f]">{p.name}</p>
                          <p className="text-[10px] text-[#a1968c]">ID: #{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-[#665c55]">
                      {p.category_name || 'Uncategorized'}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-[#30251f]">
                      {formatNPR(p.price)}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        p.stock_quantity > 10 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : p.stock_quantity > 0 
                            ? 'bg-amber-50 text-amber-700' 
                            : 'bg-red-50 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          p.stock_quantity > 10 ? 'bg-emerald-500' : p.stock_quantity > 0 ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        {p.stock_quantity > 0 ? `${p.stock_quantity} units` : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="rounded-lg p-1.5 text-[#81756d] transition-colors hover:bg-[#f6eddb] hover:text-[#9b7227]"
                          title="Edit Product"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRestock(p.id)}
                          className="rounded-lg border border-[#e8ded2] bg-[#f6eddb] px-2.5 py-1 text-[11px] font-medium text-[#785c2c] transition-colors hover:bg-[#e6b65a] hover:text-[#211712]"
                        >
                          Restock
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="rounded-lg p-1.5 text-[#a1968c] transition-colors hover:bg-rose-50 hover:text-red-600"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#211712]/55 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#e8ded2] bg-[#fffdf9] shadow-xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#eee6dc] bg-[#f8f4ed] px-6 py-4">
              <h3 className="text-base font-bold text-[#211712] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#b57b25]" />
                <span>{editingProduct ? 'Edit Product' : 'Add New Product to Store'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddProductSubmit} className="p-6 space-y-4">
              
              {/* Alert Feedback Banner */}
              {modalMessage.text && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  modalMessage.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {modalMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{modalMessage.text}</span>
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full rounded-xl border border-[#e8ded2] bg-[#fbf8f2] px-3.5 py-2 text-xs focus:border-[#ae292d]/50 focus:outline-none focus:ring-2 focus:ring-[#ae292d]/15"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={newProduct.category_id}
                  onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                  className="w-full rounded-xl border border-[#e8ded2] bg-[#fbf8f2] px-3.5 py-2 text-xs focus:border-[#ae292d]/50 focus:outline-none focus:ring-2 focus:ring-[#ae292d]/15"
                >
                  <option value="" disabled>
                    {categories.length > 0 ? 'Select a category...' : (categoryError || 'No categories available')}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price & Stock Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Price (NPR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="1200.00"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full rounded-xl border border-[#e8ded2] bg-[#fbf8f2] px-3.5 py-2 text-xs focus:border-[#ae292d]/50 focus:outline-none focus:ring-2 focus:ring-[#ae292d]/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min={editingProduct ? '0' : '1'}
                    required
                    placeholder="25"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full rounded-xl border border-[#e8ded2] bg-[#fbf8f2] px-3.5 py-2 text-xs focus:border-[#ae292d]/50 focus:outline-none focus:ring-2 focus:ring-[#ae292d]/15"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Image URL (Unsplash or direct link)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  className="w-full rounded-xl border border-[#e8ded2] bg-[#fbf8f2] px-3.5 py-2 text-xs focus:border-[#ae292d]/50 focus:outline-none focus:ring-2 focus:ring-[#ae292d]/15"
                />
              </div>

              {/* Submit / Cancel Footer Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-[#665c55] transition-colors hover:bg-[#f2ece4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#ae292d] px-5 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#912126] disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Product...' : (editingProduct ? 'Save Changes' : 'Add Product')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
