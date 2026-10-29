import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AlertCircle, ArrowLeft, CheckCircle2, CreditCard, MapPin, Phone, ShoppingBag, Truck, UserRound } from 'lucide-react';
import { API_BASE } from '../lib/api';
import { formatNPR, toPaisa } from '../lib/currency';
import { useLanguage } from '../context/LanguageContext';

const fieldClass = 'mt-1.5 w-full rounded border border-[#dcd7d2] bg-white px-3 py-3 text-sm text-[#302622] outline-none transition placeholder:text-[#aaa19a] hover:border-[#b8aea8] focus:border-[#901a1c] focus:ring-2 focus:ring-[#901a1c]/10';

export default function Checkout() {
  const { cart, totalItems, totalPrice, clearCart, setIsCartOpen, appliedPromo, promoDiscount, discountedTotal, promoApplying, promoError, applyPromoCode, removePromoCode, resetPromoError } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

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
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handlePlaceOrder = async event => {
    event.preventDefault();
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
        promo_code: appliedPromo?.code || '',
        cart: cart.map(item => ({ id: item.id, quantity: item.quantity }))
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
          subtotal: Number(data.subtotal_amount || data.total_amount),
          discount: Number(data.discount_amount || 0),
          promoCode: data.promo_code || '',
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

  if (orderSuccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-6 sm:py-20">
        <section className="border border-[#e9dfd5] bg-white p-7 sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f9eeee] text-[#901a1c]">
            <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-[#302622] sm:text-3xl">{t('Order Placed Successfully!')}</h1>
          <p className="mt-2 text-sm text-[#716963]">{t('Thank you for shopping with SANOBAZAR.')}</p>
          <dl className="mt-8 divide-y divide-[#eee5dc] border-y border-[#eee5dc] text-left text-sm">
            <div className="flex justify-between gap-5 py-3"><dt className="text-[#716963]">{t('Order ID')}</dt><dd className="font-semibold text-[#302622]">#{orderSuccess.id}</dd></div>
            <div className="flex justify-between gap-5 py-3"><dt className="text-[#716963]">{t('Order Total')}</dt><dd className="font-bold text-[#901a1c]">{formatNPR(orderSuccess.amount)}</dd></div>
            {orderSuccess.discount > 0 && <div className="flex justify-between gap-5 py-3"><dt className="text-[#716963]">{t('Promo discount')} ({orderSuccess.promoCode})</dt><dd className="font-semibold text-emerald-700">−{formatNPR(orderSuccess.discount)}</dd></div>}
            <div className="flex justify-between gap-5 py-3"><dt className="text-[#716963]">{t('Delivery Address')}</dt><dd className="max-w-[60%] text-right font-medium text-[#302622]">{orderSuccess.address}</dd></div>
            <div className="flex justify-between gap-5 py-3"><dt className="text-[#716963]">{t('Payment Method')}</dt><dd className="font-medium text-[#302622]">{t(orderSuccess.paymentMethod)}</dd></div>
            <div className="flex justify-between gap-5 py-3"><dt className="text-[#716963]">{t('Payment Status')}</dt><dd className="font-medium capitalize text-[#302622]">{t(orderSuccess.paymentStatus)}</dd></div>
          </dl>
          <Link to="/" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#901a1c] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#741416]">
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />{t('Continue Shopping')}
          </Link>
        </section>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-6 sm:py-20">
        <section className="border border-[#e9dfd5] bg-white p-8 sm:p-12">
          <ShoppingBag className="mx-auto h-14 w-14 text-[#c7b9ac]" aria-hidden="true" />
          <h1 className="mt-5 text-xl font-bold text-[#302622]">{t('Your cart is empty')}</h1>
          <p className="mt-2 text-sm text-[#716963]">{t('Add products to your cart before proceeding to checkout.')}</p>
          <Link to="/shop" className="mt-6 inline-flex items-center gap-2 rounded-md bg-[#901a1c] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#741416]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />{t('Browse Catalog')}
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 text-[#302622] sm:px-6 sm:py-9 lg:px-8">
      <button type="button" onClick={() => {
        if (location.state?.cartReturnTo) {
          setIsCartOpen(true);
          navigate(location.state.cartReturnTo);
        } else {
          navigate('/shop');
        }
      }} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#716963] transition hover:text-[#901a1c]">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />{t(location.state?.cartReturnTo ? 'Back to cart' : 'Back to shopping')}
      </button>
      <div className="mb-7 border-b border-[#e9dfd5] pb-5">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#901a1c]">{t('Secure checkout')}</p>
        <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-[#302622] sm:text-4xl">{t('Checkout')}</h1>
        <p className="mt-2 text-sm text-[#716963]">{t('Complete your delivery and payment details.')}</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-12">
        <div className="space-y-8">
          {error && (
            <div role="alert" className="flex items-center gap-2 border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" aria-hidden="true" /><span>{error}</span>
            </div>
          )}

          <section className="border-b border-[#e9dfd5] pb-7">
            <h2 className="flex items-center gap-3 text-base font-bold text-[#302622]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f9eeee] text-xs font-bold text-[#901a1c]">1</span>
              {t('General Information')}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-[#514640]">
                {t('Full Name')}
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#978b84]" aria-hidden="true" />
                  <input type="text" readOnly value={currentUser.full_name || currentUser.name || 'Customer'} className={`${fieldClass} pl-10`} />
                </div>
              </label>
              <label className="block text-sm font-medium text-[#514640]">
                {t('Email')}
                <input type="email" readOnly value={currentUser.email || ''} placeholder={t('Email on your account')} className={fieldClass} />
              </label>
              <label className="block text-sm font-medium text-[#514640] sm:col-span-2">
                {t('Phone Number')} <span className="text-[#901a1c]">*</span>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#978b84]" aria-hidden="true" />
                  <input
                    type="tel"
                    required
                    minLength={7}
                    maxLength={30}
                    pattern="[+0-9(). -]{7,30}"
                    placeholder="98XXXXXXXX"
                    value={phone}
                    onChange={event => setPhone(event.target.value)}
                    className={`${fieldClass} pl-10`}
                  />
                </div>
              </label>
            </div>
          </section>

          <section className="border-b border-[#e9dfd5] pb-7">
            <h2 className="flex items-center gap-3 text-base font-bold text-[#302622]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f9eeee] text-xs font-bold text-[#901a1c]">2</span>
              {t('Delivery Address')}
            </h2>
            <label className="mt-5 block text-sm font-medium text-[#514640]">
              {t('Shipping Address')} <span className="text-[#901a1c]">*</span>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-4 h-4 w-4 text-[#978b84]" aria-hidden="true" />
                <textarea
                  required
                  maxLength={500}
                  rows={4}
                  placeholder={t('Street address, City, Ward No. (e.g. New Baneshwor, Kathmandu)')}
                  value={address}
                  onChange={event => setAddress(event.target.value)}
                  className={`${fieldClass} resize-y pl-10`}
                />
              </div>
            </label>
          </section>

          <section>
            <h2 className="flex items-center gap-3 text-base font-bold text-[#302622]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f9eeee] text-xs font-bold text-[#901a1c]">3</span>
              {t('Payment Methods')}
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className={`flex min-h-28 cursor-pointer flex-col justify-between border p-4 transition ${paymentMethod === 'cod' ? 'border-[#901a1c] bg-[#fffafa]' : 'border-[#e9dfd5] bg-white hover:border-[#c9beba]'}`}>
                <span className="flex items-center justify-between text-[#901a1c]">
                  <Truck className="h-6 w-6" aria-hidden="true" />
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="h-4 w-4 accent-[#901a1c]" />
                </span>
                <span className="mt-4">
                  <span className="block text-sm font-semibold text-[#302622]">{t('Cash on Delivery')}</span>
                  <span className="mt-1 block text-xs text-[#827872]">{t('Pay when order arrives')}</span>
                </span>
              </label>
              <label className={`flex min-h-28 cursor-pointer flex-col justify-between border p-4 transition ${paymentMethod === 'digital' ? 'border-[#901a1c] bg-[#fffafa]' : 'border-[#e9dfd5] bg-white hover:border-[#c9beba]'}`}>
                <span className="flex items-center justify-between text-[#901a1c]">
                  <CreditCard className="h-6 w-6" aria-hidden="true" />
                  <input type="radio" name="payment" value="digital" checked={paymentMethod === 'digital'} onChange={() => setPaymentMethod('digital')} className="h-4 w-4 accent-[#901a1c]" />
                </span>
                <span className="mt-4">
                  <span className="block text-sm font-semibold text-[#302622]">{t('Digital Wallet')}</span>
                  <span className="mt-1 block text-xs text-[#827872]">{t('eSewa / Khalti Simulated')}</span>
                </span>
              </label>
            </div>
          </section>
        </div>

        <aside className="h-fit border border-[#e9dfd5] bg-white lg:sticky lg:top-6">
          <div className="border-b border-[#e9dfd5] px-5 py-4 sm:px-6">
            <h2 className="text-base font-bold text-[#302622]">{t('Order Summary')}</h2>
            <p className="mt-1 text-xs text-[#827872]">{totalItems} {t('item(s)')}</p>
          </div>
          <div className="max-h-[360px] divide-y divide-[#eee5dc] overflow-y-auto px-5 sm:px-6">
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 py-4">
                <div className="relative shrink-0">
                  <img src={item.image_url} alt={t(item.name)} className="h-[68px] w-[68px] rounded-md bg-[#f7f6f4] object-contain p-1.5" />
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#901a1c] px-1 text-[10px] font-bold text-white">{item.quantity}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-sm font-medium leading-5 text-[#302622]">{t(item.name)}</h3>
                  <p className="mt-1 text-xs text-[#827872]">{formatNPR(item.price)} × {item.quantity}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-[#302622]">{formatNPR((toPaisa(item.price) * item.quantity) / 100)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#e9dfd5] px-5 py-5 sm:px-6">
            <div className="mb-5">
              {appliedPromo ? <div className="flex items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs">
                <span className="font-semibold text-emerald-800">{t('Promo code applied')}: {appliedPromo.code}</span>
                <button type="button" onClick={removePromoCode} className="font-bold text-[#901a1c] hover:underline">{t('Remove')}</button>
              </div> : <>
                <label htmlFor="checkout-promo-code" className="sr-only">{t('Promo code')}</label>
                <div className="flex gap-2">
                  <input id="checkout-promo-code" value={promoCode} onChange={event => { setPromoCode(event.target.value); resetPromoError(); }} placeholder={t('Enter promo code')} className="h-11 min-w-0 flex-1 rounded border border-[#dcd7d2] px-3 text-sm uppercase text-[#302622] outline-none placeholder:normal-case placeholder:text-[#aaa19a] focus:border-[#901a1c]" />
                  <button type="button" disabled={promoApplying} onClick={async () => { try { const promo = await applyPromoCode(promoCode); if (promo) setPromoCode(''); } catch { /* The shared promo error is shown below. */ } }} className="h-11 rounded bg-[#f4f1ee] px-4 text-xs font-bold uppercase tracking-wide text-[#514640] transition hover:bg-[#ece6e1] disabled:cursor-wait disabled:opacity-60">{promoApplying ? t('Checking…') : t('Apply')}</button>
                </div>
                {promoError && <p role="alert" className="mt-2 text-xs text-[#901a1c]">{t(promoError)}</p>}
              </>}
            </div>
            <div className="space-y-3 text-sm">
              <p className="flex justify-between gap-4 text-[#655b55]"><span>{t('Subtotal')}</span><span>{formatNPR(totalPrice)}</span></p>
              {appliedPromo && <p className="flex justify-between gap-4 text-emerald-700"><span>{t('Promo discount')}</span><span className="font-semibold">−{formatNPR(promoDiscount)}</span></p>}
              <p className="flex justify-between gap-4 text-[#655b55]"><span>{t('Delivery Charge')}</span><span className="font-semibold text-emerald-700">{t('FREE')}</span></p>
              <p className="flex justify-between gap-4 border-t border-[#eee5dc] pt-3 text-base font-bold text-[#302622]"><span>{t('Total')}</span><span>{formatNPR(discountedTotal)}</span></p>
            </div>
            <button type="submit" disabled={loading} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#901a1c] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#741416] disabled:cursor-wait disabled:opacity-60">
              {loading ? t('Processing Transaction...') : `${t('Place Order')} · ${formatNPR(discountedTotal)}`}
            </button>
            <p className="mt-3 text-center text-xs leading-5 text-[#827872]">{t('Prices and availability are checked again when you place the order.')}</p>
          </div>
        </aside>
      </form>
    </div>
  );
}
