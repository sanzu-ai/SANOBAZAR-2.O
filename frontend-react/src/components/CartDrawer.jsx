import { useState } from 'react';
import { ArrowRight, ChevronDown, Minus, Plus, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatNPR } from '../lib/currency';
import { useLanguage } from '../context/LanguageContext';

export default function CartDrawer() {
  const { cart, totalItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalPrice, appliedPromo, promoDiscount, discountedTotal, promoApplying, promoError, applyPromoCode, removePromoCode, resetPromoError, cartSyncError } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    const cartReturnTo = `${location.pathname}${location.search}`;
    const user = localStorage.getItem('sanobazar_user');
    if (!user) {
      alert(t('Please log in to complete your checkout.'));
      navigate('/login', { state: { from: '/checkout', cartReturnTo } });
    } else {
      navigate('/checkout', { state: { cartReturnTo } });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsCartOpen(false)}
        aria-label={t('Close cart')}
        className="absolute inset-0 h-full w-full cursor-default bg-[#1b1311]/55 backdrop-blur-[2px]"
      />

      <aside role="dialog" aria-modal="true" aria-label={t('Shopping cart')} className="absolute inset-y-0 right-0 flex w-screen max-w-[680px] flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#eee5dc] px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f9eeee] text-[#901a1c]">
              <Truck className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#302622]">{t('Your Cart')}</h2>
              <p className="mt-0.5 text-xs text-[#827872]">{totalItems} {t('item(s)')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label={t('Close cart')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#514640] transition hover:bg-[#f8f4ef] hover:text-[#901a1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#901a1c]"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {cartSyncError && <p role="alert" className="border-b border-amber-100 bg-[#fff6e6] px-5 py-3 text-xs text-amber-900 sm:px-7">{t(cartSyncError)}</p>}

        <div className="flex-1 overflow-y-auto px-5 sm:px-7">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-14 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f9eeee] text-[#901a1c]">
                <ShoppingBag className="h-8 w-8" aria-hidden="true" />
              </span>
              <p className="mt-5 text-base font-bold text-[#302622]">{t('Your cart is empty.')}</p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-[#827872]">{t('Find something useful for your everyday and it will appear here.')}</p>
              <button type="button" onClick={() => { setIsCartOpen(false); navigate('/shop'); }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#901a1c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#741416]">
                {t('Continue shopping')}<ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#eee5dc]">
              {cart.map(item => (
                <article key={item.id} className="grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-4 py-5 sm:grid-cols-[92px_minmax(0,1fr)_auto] sm:gap-5">
                  <img src={item.image_url} alt={t(item.name)} className="h-[76px] w-[76px] rounded-lg bg-[#f7f6f4] object-contain p-2 sm:h-[92px] sm:w-[92px]" />
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#302622] sm:text-[15px]">{t(item.name)}</h3>
                    <p className="mt-1.5 text-sm text-[#827872]">{formatNPR(item.price)} <span className="px-1 text-[#b8aea8]">×</span> {item.quantity}</p>
                    <div className="mt-3 inline-flex items-center rounded-md border border-[#eee5dc]">
                      <button type="button" onClick={() => updateQuantity(item.id, -1)} aria-label={t('Decrease quantity')} className="flex h-8 w-9 items-center justify-center text-[#514640] transition hover:bg-[#f9eeee] hover:text-[#901a1c]">
                        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <span className="min-w-9 text-center text-sm font-semibold text-[#302622]">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, 1)} aria-label={t('Increase quantity')} className="flex h-8 w-9 items-center justify-center text-[#514640] transition hover:bg-[#f9eeee] hover:text-[#901a1c]">
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="flex h-full flex-col items-end justify-between gap-4">
                    <p className="whitespace-nowrap text-sm font-bold text-[#302622]">{formatNPR(Number(item.price) * Number(item.quantity))}</p>
                    <button type="button" aria-label={t('Remove item')} title={t('Remove item')} onClick={() => removeFromCart(item.id)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#901a1c] transition hover:bg-[#f9eeee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#901a1c]">
                      <Trash2 className="h-[18px] w-[18px]" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <footer className="border-t border-[#eee5dc] bg-white px-5 py-5 sm:px-7 sm:py-6">
            <div className="space-y-3 text-sm">
              <p className="flex items-center justify-between gap-4 text-[#655b55]">
                <span>{t('Subtotal')}</span><span className="font-semibold text-[#302622]">{formatNPR(totalPrice)}</span>
              </p>
              {appliedPromo && <p className="flex items-center justify-between gap-4 text-emerald-700"><span>{t('Promo discount')} ({appliedPromo.code})</span><span className="font-semibold">−{formatNPR(promoDiscount)}</span></p>}
              <p className="flex items-center justify-between gap-4 text-[#827872]">
                <span>{t('Delivery')}</span><span className="text-xs">{t('Calculated at checkout')}</span>
              </p>
              <p className="flex items-center justify-between gap-4 border-t border-[#eee5dc] pt-3 text-base font-bold text-[#302622]">
                <span>{t('Total')}</span><span>{formatNPR(discountedTotal)}</span>
              </p>
            </div>
            {appliedPromo ? <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs">
              <span className="font-semibold text-emerald-800">{t('Promo code applied')}: {appliedPromo.code}</span>
              <button type="button" onClick={removePromoCode} className="font-bold text-[#901a1c] hover:underline">{t('Remove')}</button>
            </div> : <>
              <button type="button" onClick={() => setPromoOpen(open => !open)} aria-expanded={promoOpen} className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#901a1c] hover:underline">
                {t('Have a promo code?')}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${promoOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              {promoOpen && <div className="mt-3">
                <div className="flex gap-2">
                  <input aria-label={t('Promo code')} value={promoCode} onChange={event => { setPromoCode(event.target.value); resetPromoError(); }} placeholder={t('Enter promo code')} className="h-11 min-w-0 flex-1 rounded border border-[#dcd7d2] px-3 text-sm uppercase text-[#302622] outline-none placeholder:normal-case placeholder:text-[#aaa19a] focus:border-[#901a1c]" />
                  <button type="button" disabled={promoApplying} onClick={async () => { try { const promo = await applyPromoCode(promoCode); if (!promo) return; setPromoCode(''); setPromoOpen(false); } catch { /* The shared promo error is shown below. */ } }} className="h-11 rounded bg-[#f4f1ee] px-4 text-xs font-bold uppercase tracking-wide text-[#514640] transition hover:bg-[#ece6e1] disabled:cursor-wait disabled:opacity-60">{promoApplying ? t('Checking…') : t('Apply')}</button>
                </div>
                {promoError && <p role="alert" className="mt-2 text-xs text-[#901a1c]">{t(promoError)}</p>}
              </div>}
            </>}
            <button type="button" onClick={handleCheckout} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#901a1c] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#741416] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#901a1c] focus-visible:ring-offset-2">
              {t('Checkout')} ({totalItems})<ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
