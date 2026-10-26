import { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Plus, 
  Search, 
  RefreshCw, 
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
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
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
    const [statsRes, prodRes] = await Promise.all([
      fetch(`${API_BASE}/get_admin_stats.php`, { credentials: 'include' }),
      fetch(`${API_BASE}/admin_products.php`, { credentials: 'include' })
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
      lowStockItems: statsData.low_stock_items || [],
      recentOrders: statsData.recent_orders || [],
      products: Array.isArray(prodData) ? prodData : (Array.isArray(prodData.data) ? prodData.data : [])
    };
  }, []);

  const applyDashboardData = useCallback((data) => {
    setStats(data.stats);
    setLowStockItems(data.lowStockItems);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-gray-500">Monitor store metrics, manage inventory, and view active orders.</p>
        </div>
        <button
          onClick={openAddProductModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand text-white font-semibold rounded-xl hover:bg-brandDark transition-all shadow-sm shadow-brand/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Metric Cards (4 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
              {formatNPR(stats.total_revenue)}
            </h3>
            <span className="inline-block mt-2 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Live DB Synced
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-brand flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{stats.total_orders || 0}</h3>
            <span className="inline-block mt-2 text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Processed Orders
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{stats.total_users || 0}</h3>
            <span className="inline-block mt-2 text-[11px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              Registered Accounts
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Low Stock Items</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{stats.low_stock_count || 0}</h3>
            <span className="inline-block mt-2 text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              Items Stock &le; 5
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Two Column Section: Low Stock Warning & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Warning Box */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Low Stock Alerts</span>
            </h2>
            <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
              {lowStockItems.length} Products
            </span>
          </div>

          {lowStockItems.length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">All product inventory levels are healthy!</p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
              {lowStockItems.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={item.image_url} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-gray-100" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-gray-400">{formatNPR(item.price)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md">
                      {item.stock_quantity} left
                    </span>
                    <button
                      onClick={() => handleRestock(item.id)}
                      className="p-1.5 text-gray-500 hover:text-brand hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Quick Restock"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders Box */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand" />
              <span>Recent Customer Orders</span>
            </h2>
            <span className="text-xs font-semibold bg-emerald-100 text-brand px-2.5 py-1 rounded-full">
              Latest Activity
            </span>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-gray-500 py-4 text-center">No orders placed yet.</p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
              {recentOrders.map((ord) => (
                <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-gray-900">Order #{ord.id} - {ord.customer_name || 'Customer'}</p>
                    <p className="text-[11px] text-gray-400">{new Date(ord.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatNPR(ord.total_amount)}</p>
                    <span className="capitalize text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      {ord.order_status || 'pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Main Inventory Management Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Table Controls Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand" />
              <span>Product Inventory Catalog</span>
            </h2>
            <p className="text-xs text-gray-500">Manage pricing, stock count, and delete obsolete entries.</p>
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
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            {/* Category Dropdown Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30"
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
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Price</th>
                <th className="py-3.5 px-6">Stock Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900">{p.name}</p>
                          <p className="text-[10px] text-gray-400">ID: #{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-gray-600 font-medium">
                      {p.category_name || 'Uncategorized'}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-gray-900">
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
                          className="p-1.5 text-gray-500 hover:text-brand hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Product"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRestock(p.id)}
                          className="px-2.5 py-1 bg-emerald-50 text-brand border border-emerald-200 hover:bg-brand hover:text-white rounded-lg transition-colors font-medium text-[11px]"
                        >
                          Restock
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand" />
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
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
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
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
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
                    className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
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
                    className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
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
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
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
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold bg-brand text-white rounded-xl hover:bg-brandDark transition-all shadow-md shadow-brand/20 disabled:opacity-50"
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
