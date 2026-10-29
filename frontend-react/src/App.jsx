import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import EmiCalculator from './pages/EmiCalculator';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminInventory from './pages/AdminInventory';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';
import AdminMessages from './pages/AdminMessages';
import { ShopPage, CategoriesPage, AboutPage, HelpPage, ContactPage, BlogPage, BlogArticlePage, AccountPage, ProductPage } from './pages/StorePages';

// Component for Public (Customer) layout
function CustomerLayout({ children, searchQuery, setSearchQuery }) {
  return (
    <div className="min-h-screen bg-[#fbf8f2] flex flex-col justify-between font-sans">
      <div>
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <CartDrawer />
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
}

function CheckoutLayout({ children }) {
  return (
    <div className="min-h-screen bg-white font-sans text-[#302622]">
      <header className="flex h-[88px] items-center justify-center border-b border-[#eee5dc] bg-white px-4">
        <Link to="/" aria-label="Sano Bazar home" className="inline-flex items-center">
          <img src="/sanobazar-logo.svg" alt="Sano Bazar" className="h-12 w-auto sm:h-14" />
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <LanguageProvider>
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
            <Route path="messages" element={<AdminMessages />} />
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
            <CheckoutLayout>
              <Checkout />
            </CheckoutLayout>
          } />
          <Route path="/shop" element={<CustomerLayout><ShopPage searchQuery={searchQuery} /></CustomerLayout>} />
          <Route path="/categories" element={<CustomerLayout><CategoriesPage /></CustomerLayout>} />
          <Route path="/about" element={<CustomerLayout><AboutPage /></CustomerLayout>} />
          <Route path="/help" element={<CustomerLayout><HelpPage /></CustomerLayout>} />
          <Route path="/contact" element={<CustomerLayout><ContactPage /></CustomerLayout>} />
          <Route path="/emi-calculator" element={<CustomerLayout><EmiCalculator /></CustomerLayout>} />
          <Route path="/blog" element={<CustomerLayout><BlogPage /></CustomerLayout>} />
          <Route path="/blog/:slug" element={<CustomerLayout><BlogArticlePage /></CustomerLayout>} />
          <Route path="/account" element={<CustomerLayout><AccountPage /></CustomerLayout>} />
          <Route path="/track-order" element={<CustomerLayout><AccountPage trackingOnly /></CustomerLayout>} />
          <Route path="/cart" element={<Navigate to="/" replace />} />
          <Route path="/wishlist" element={<Navigate to="/shop" replace />} />
          <Route path="/product/:slug" element={<CustomerLayout><ProductPage /></CustomerLayout>} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </LanguageProvider>
  );
}

export default App;
