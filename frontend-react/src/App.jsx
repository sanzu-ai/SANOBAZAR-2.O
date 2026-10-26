import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminInventory from './pages/AdminInventory';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';
import { ShopPage, CategoriesPage, AboutPage, ContactPage, BlogPage, BlogArticlePage, AccountPage, CartPage, WishlistPage, ProductPage } from './pages/StorePages';

// Component for Public (Customer) layout
function CustomerLayout({ children, searchQuery, setSearchQuery }) {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col justify-between font-sans">
      <div>
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <CartDrawer />
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin Routes (dark sidebar, no customer Navbar) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Customer Routes (with Navbar + Footer) */}
          <Route path="/" element={
            <CustomerLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
              <Home searchQuery={searchQuery} />
            </CustomerLayout>
          } />
          <Route path="/login" element={
            <CustomerLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
              <Login />
            </CustomerLayout>
          } />
          <Route path="/register" element={
            <CustomerLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
              <Register />
            </CustomerLayout>
          } />
          <Route path="/checkout" element={
            <CustomerLayout searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
              <Checkout />
            </CustomerLayout>
          } />
          <Route path="/shop" element={<CustomerLayout><ShopPage searchQuery={searchQuery} /></CustomerLayout>} />
          <Route path="/categories" element={<CustomerLayout><CategoriesPage /></CustomerLayout>} />
          <Route path="/about" element={<CustomerLayout><AboutPage /></CustomerLayout>} />
          <Route path="/contact" element={<CustomerLayout><ContactPage /></CustomerLayout>} />
          <Route path="/blog" element={<CustomerLayout><BlogPage /></CustomerLayout>} />
          <Route path="/blog/:slug" element={<CustomerLayout><BlogArticlePage /></CustomerLayout>} />
          <Route path="/account" element={<CustomerLayout><AccountPage /></CustomerLayout>} />
          <Route path="/cart" element={<CustomerLayout><CartPage /></CustomerLayout>} />
          <Route path="/wishlist" element={<CustomerLayout><WishlistPage /></CustomerLayout>} />
          <Route path="/product/:slug" element={<CustomerLayout><ProductPage /></CustomerLayout>} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
