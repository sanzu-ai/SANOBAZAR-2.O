import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CheckCircle2, ShoppingBag, Truck, MapPin, Phone, User, CreditCard, ArrowLeft, AlertCircle } from 'lucide-react';
import { API_BASE } from '../lib/api';
import { formatNPR, toPaisa } from '../lib/currency';
import { useLanguage } from '../context/LanguageContext';

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Initialize current user safely
  const [currentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sanobazar_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Redirect if user is unauthenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      setError(t('Your cart is empty.'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        shipping_address: address,
        phone_number: phone,
        payment_method: paymentMethod,
        cart: cart.map(item => ({
          id: item.id,
          quantity: item.quantity
        }))
      };

      const response = await fetch(`${API_BASE}/place_order.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();

      if (response.ok && data.status === 'success' && data.order_id) {
        setOrderSuccess({
          id: data.order_id,
          amount: Number(data.total_amount),
          address,
          paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Simulated Digital Wallet',
          paymentStatus: data.payment_status
        });
        clearCart();
      } else {
        setError(t(data.message || 'Failed to place order. Please try again.'));
      }
    } catch (err) {
      console.error('Order placement error:', err);
      setError(t('Connection failed. Make sure XAMPP Apache and MySQL are running.'));
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS SCREEN
  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-[#087f5b] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900">{t('Order Placed Successfully!')}</h1>
            <p className="text-sm text-gray-500">{t('Thank you for shopping with SANOBAZAR.')}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-3 text-xs border border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500">{t('Order ID')}:</span>
              <span className="font-bold text-gray-900">#{orderSuccess.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('Order Total')}:</span>
              <span className="font-extrabold text-gray-900">{formatNPR(orderSuccess.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('Delivery Address')}:</span>
              <span className="font-bold text-gray-900 truncate max-w-[200px]">{orderSuccess.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('Payment Method')}:</span>
              <span className="font-bold text-gray-900">{orderSuccess.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t('Payment Status')}:</span>
              <span className="font-bold capitalize text-gray-900">{t(orderSuccess.paymentStatus)}</span>
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#087f5b] hover:bg-[#066347] text-white py-3 rounded-xl font-bold text-xs shadow-md transition"
          >
            <ShoppingBag className="w-4 h-4" />
            {t('Continue Shopping')}
          </Link>
        </div>
      </div>
    );
  }

  // EMPTY CART GUARD
  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm space-y-4">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">{t('Your cart is empty')}</h2>
          <p className="text-xs text-gray-500">{t('Add products to your cart before proceeding to checkout.')}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#087f5b] text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  // MAIN CHECKOUT FORM
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#087f5b] mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> {t('Back to Store')}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{t('Checkout')}</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-4 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Shipping & Payment Details */}
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
          
          {/* Contact & Address Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#087f5b]" /> Delivery Details
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('Customer Name')}</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled
                    value={currentUser.full_name || currentUser.name || 'Customer'}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('Phone Number')}</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    minLength={7}
                    maxLength={30}
                    pattern="[+0-9(). -]{7,30}"
                    placeholder="98XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#087f5b] focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">{t('Shipping Address')}</label>
                <textarea
                  required
                  maxLength={500}
                  rows="3"
                  placeholder={t('Street address, City, Ward No. (e.g. New Baneshwor, Kathmandu)')}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#087f5b] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#087f5b]" /> Payment Method
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-4 border rounded-2xl cursor-pointer flex flex-col justify-between gap-2 transition ${
                  paymentMethod === 'cod'
                    ? 'border-[#087f5b] bg-emerald-50/50 text-[#087f5b]'
                    : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Truck className="w-5 h-5" />
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-[#087f5b]"
                  />
                </div>
                <div>
                  <p className="font-bold text-xs">{t('Cash on Delivery')}</p>
                  <p className="text-[10px] opacity-75">{t('Pay when order arrives')}</p>
                </div>
              </label>

              <label
                className={`p-4 border rounded-2xl cursor-pointer flex flex-col justify-between gap-2 transition ${
                  paymentMethod === 'digital'
                    ? 'border-[#087f5b] bg-emerald-50/50 text-[#087f5b]'
                    : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <CreditCard className="w-5 h-5" />
                  <input
                    type="radio"
                    name="payment"
                    value="digital"
                    checked={paymentMethod === 'digital'}
                    onChange={() => setPaymentMethod('digital')}
                    className="accent-[#087f5b]"
                  />
                </div>
                <div>
                  <p className="font-bold text-xs">{t('Digital Wallet')}</p>
                  <p className="text-[10px] opacity-75">{t('eSewa / Khalti Simulated')}</p>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#087f5b] hover:bg-[#066347] text-white py-3.5 rounded-2xl font-bold text-sm shadow-md transition active:scale-98 disabled:opacity-50"
          >
            {loading ? t('Processing Transaction...') : `${t('Confirm Order')} (${formatNPR(totalPrice)})`}
          </button>
        </form>

        {/* Right Column: Order Items Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4 sticky top-24">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
              {t('Order Summary')} ({cart.length} {t('items')})
            </h2>

            <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl">
                  <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-white" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-gray-900 truncate">{item.name}</h4>
                    <p className="text-[11px] text-gray-500">{t('Qty')}: {item.quantity}</p>
                  </div>
                  <span className="font-extrabold text-xs text-[#087f5b]">
                    {formatNPR((toPaisa(item.price) * item.quantity) / 100)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>{t('Subtotal')}</span>
                <span>{formatNPR(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('Delivery Charge')}</span>
                <span className="text-emerald-600 font-bold">{t('FREE')}</span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                <span>{t('Total')}</span>
                <span className="text-[#087f5b]">{formatNPR(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
