import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { API_BASE } from '../lib/api';
import { toPaisa } from '../lib/currency';

const CartContext = createContext();
const CART_STORAGE_KEY = 'sanobazar_cart';
const CART_OWNER_KEY = 'sanobazar_cart_user_id';

function readStoredCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mergeCart(serverCart, guestCart) {
  const merged = new Map(serverCart.map(item => [Number(item.id), { ...item, id: Number(item.id) }]));
  guestCart.forEach(item => {
    const id = Number(item.id);
    const existing = merged.get(id);
    const product = existing || item;
    const stock = Math.max(0, Number(product.stock_quantity) || 0);
    const quantity = (Number(existing?.quantity) || 0) + (Number(item.quantity) || 0);
    if (stock > 0 && quantity > 0) {
      merged.set(id, { ...product, id, quantity: Math.min(quantity, stock) });
    }
  });
  return Array.from(merged.values());
}

function cartPayload(items) {
  return items.map(item => ({ product_id: Number(item.id), quantity: Number(item.quantity) }));
}

function cartsMatch(first, second) {
  if (first.length !== second.length) return false;
  const saved = new Map(second.map(item => [Number(item.id), item]));
  return first.every(item => {
    const next = saved.get(Number(item.id));
    return next && Number(next.quantity) === Number(item.quantity) &&
      Number(next.stock_quantity) === Number(item.stock_quantity) &&
      String(next.price) === String(item.price);
  });
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readStoredCart);
  const cartRef = useRef(cart);
  const syncGenerationRef = useRef(0);
  const promoGenerationRef = useRef(0);
  const saveGenerationRef = useRef(0);
  const saveQueueRef = useRef(Promise.resolve());
  const accountIdRef = useRef(null);
  const cartSyncingRef = useRef(false);
  const [accountId, setAccountId] = useState(null);
  const [cartSyncReady, setCartSyncReady] = useState(false);
  const [cartSyncing, setCartSyncing] = useState(false);
  const [cartSyncError, setCartSyncError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoApplying, setPromoApplying] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sanobazar_wishlist') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const syncCartForAccount = useCallback(async expectedUserId => {
    const generation = ++syncGenerationRef.current;
    saveGenerationRef.current += 1;
    accountIdRef.current = null;
    setAccountId(null);
    setCartSyncReady(false);
    cartSyncingRef.current = true;
    setCartSyncing(true);
    setCartSyncError('');
    try {
      const accountResponse = await fetch(`${API_BASE}/account.php`, { credentials: 'include' });
      const accountData = await accountResponse.json();
      if (!accountResponse.ok || accountData.status !== 'success') {
        if (generation === syncGenerationRef.current) {
          accountIdRef.current = null;
          setAccountId(null);
          if (accountResponse.status === 401 && localStorage.getItem(CART_OWNER_KEY)) setCart([]);
          setCartSyncReady(true);
          cartSyncingRef.current = false;
          setCartSyncing(false);
        }
        return;
      }
      if (generation !== syncGenerationRef.current) return;

      const currentUserId = Number(accountData.user.id);
      if (expectedUserId && currentUserId !== Number(expectedUserId)) {
        throw new Error('The signed-in account changed. Please refresh and try again.');
      }

      const response = await fetch(`${API_BASE}/cart.php`, { credentials: 'include' });
      const data = await response.json();
      if (generation !== syncGenerationRef.current) return;
      if (!response.ok || data.status !== 'success') {
        throw new Error(data.message || 'Could not load your saved cart.');
      }

      const savedOwner = localStorage.getItem(CART_OWNER_KEY);
      const guestItems = savedOwner ? [] : cartRef.current;
      const mergedItems = mergeCart(Array.isArray(data.data) ? data.data : [], guestItems);
      const saveResponse = await fetch(`${API_BASE}/cart.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartPayload(mergedItems) })
      });
      const savedData = await saveResponse.json();
      if (!saveResponse.ok || savedData.status !== 'success') {
        throw new Error(savedData.message || 'Could not save your cart to your account.');
      }

      if (generation === syncGenerationRef.current) {
        accountIdRef.current = currentUserId;
        setAccountId(currentUserId);
        setCart(Array.isArray(savedData.data) ? savedData.data : []);
        setCartSyncReady(true);
        cartSyncingRef.current = false;
        setCartSyncing(false);
      }
    } catch (error) {
      if (generation === syncGenerationRef.current) {
        if (localStorage.getItem(CART_OWNER_KEY)) setCart([]);
        setCartSyncError(error.message || 'Your cart could not be synced.');
        setCartSyncReady(true);
        cartSyncingRef.current = false;
        setCartSyncing(false);
      }
    }
  }, []);

  useEffect(() => {
    cartRef.current = cart;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    if (accountId) localStorage.setItem(CART_OWNER_KEY, String(accountId));
    else if (cartSyncReady) localStorage.removeItem(CART_OWNER_KEY);
  }, [cart, accountId, cartSyncReady]);

  useEffect(() => {
    localStorage.setItem('sanobazar_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    let active = true;
    const handleAuthChange = event => {
      const user = event.detail?.user;
      if (user?.id) {
        syncCartForAccount(user.id);
      } else {
        syncGenerationRef.current += 1;
        saveGenerationRef.current += 1;
        accountIdRef.current = null;
        cartSyncingRef.current = false;
        setAccountId(null);
        setCart([]);
        setCartSyncError('');
        setCartSyncReady(true);
        setCartSyncing(false);
      }
    };

    const handleStorage = event => {
      if (event.key !== 'sanobazar_user') return;
      const user = event.newValue ? JSON.parse(event.newValue) : null;
      handleAuthChange({ detail: { user } });
    };

    window.addEventListener('sanobazar:auth-change', handleAuthChange);
    window.addEventListener('storage', handleStorage);
    let savedUser = null;
    try {
      savedUser = JSON.parse(localStorage.getItem('sanobazar_user') || 'null');
    } catch {
      localStorage.removeItem('sanobazar_user');
    }
    Promise.resolve().then(() => {
      if (!active) return;
      if (savedUser?.id) syncCartForAccount(savedUser.id);
      else {
        if (localStorage.getItem(CART_OWNER_KEY)) setCart([]);
        setCartSyncReady(true);
      }
    });

    return () => {
      active = false;
      window.removeEventListener('sanobazar:auth-change', handleAuthChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [syncCartForAccount]);

  useEffect(() => {
    if (!accountId || !cartSyncReady) return undefined;
    const generation = ++saveGenerationRef.current;
    const timer = window.setTimeout(() => {
      const snapshot = cartPayload(cartRef.current);
      saveQueueRef.current = saveQueueRef.current.catch(() => {}).then(async () => {
        if (generation !== saveGenerationRef.current || accountIdRef.current !== accountId) return;
        const response = await fetch(`${API_BASE}/cart.php`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: snapshot })
        });
        const data = await response.json();
        if (!response.ok || data.status !== 'success') {
          throw new Error(data.message || 'Could not sync your cart.');
        }
        if (generation === saveGenerationRef.current) {
          setCartSyncError('');
          const savedItems = Array.isArray(data.data) ? data.data : [];
          if (!cartsMatch(cartRef.current, savedItems)) setCart(savedItems);
        }
      }).catch(error => {
        if (generation === saveGenerationRef.current) {
          setCartSyncError(error.message || 'Your cart is only saved on this device right now.');
        }
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [cart, accountId, cartSyncReady]);

  const clearPromoCode = () => {
    promoGenerationRef.current += 1;
    setAppliedPromo(null);
    setPromoError('');
    setPromoApplying(false);
  };

  const applyPromoCode = useCallback(async code => {
    const normalizedCode = String(code || '').trim().toUpperCase();
    if (!normalizedCode) {
      const error = new Error('Enter a promo code first.');
      setPromoError(error.message);
      throw error;
    }
    if (!cart.length) {
      const error = new Error('Your cart is empty.');
      setPromoError(error.message);
      throw error;
    }

    const requestGeneration = ++promoGenerationRef.current;
    setPromoApplying(true);
    setPromoError('');
    try {
      const response = await fetch(`${API_BASE}/validate_promo.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promo_code: normalizedCode,
          cart: cart.map(item => ({ id: item.id, quantity: item.quantity }))
        })
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'success' || !data.promo) {
        throw new Error(data.message || 'This promo code could not be applied.');
      }
      if (requestGeneration !== promoGenerationRef.current) return null;
      setAppliedPromo(data.promo);
      setPromoError('');
      return data.promo;
    } catch (error) {
      if (requestGeneration !== promoGenerationRef.current) throw error;
      setAppliedPromo(null);
      setPromoError(error.message || 'This promo code could not be applied.');
      throw error;
    } finally {
      if (requestGeneration === promoGenerationRef.current) setPromoApplying(false);
    }
  }, [cart]);

  const removePromoCode = () => clearPromoCode();
  const resetPromoError = () => setPromoError('');

  const addToCart = product => {
    if (cartSyncingRef.current) return;
    clearPromoCode();
    setCart(previous => {
      const existing = previous.find(item => Number(item.id) === Number(product.id));
      const available = Math.max(0, Number(product.stock_quantity) || 0);
      if (available === 0 || (existing && existing.quantity >= available)) {
        alert(`Only ${available} items available in stock!`);
        return previous;
      }
      if (existing) {
        return previous.map(item => Number(item.id) === Number(product.id)
          ? { ...item, quantity: item.quantity + 1 }
          : item);
      }
      return [...previous, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = productId => {
    if (cartSyncingRef.current) return;
    clearPromoCode();
    setCart(previous => previous.filter(item => Number(item.id) !== Number(productId)));
  };

  const updateQuantity = (productId, delta) => {
    if (cartSyncingRef.current) return;
    clearPromoCode();
    setCart(previous => previous.map(item => {
      if (Number(item.id) !== Number(productId)) return item;
      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) return null;
      if (newQuantity > Number(item.stock_quantity)) {
        alert(`Maximum stock limit reached (${item.stock_quantity})`);
        return item;
      }
      return { ...item, quantity: newQuantity };
    }).filter(Boolean));
  };

  const clearCart = () => {
    setCart([]);
    clearPromoCode();
  };
  const toggleWishlist = productId => {
    setWishlistIds(previous => previous.includes(productId)
      ? previous.filter(id => id !== productId)
      : [...previous, productId]);
  };

  const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity), 0);
  const totalPaisa = cart.reduce((sum, item) => sum + (toPaisa(item.price) * Number(item.quantity)), 0);
  const totalPrice = totalPaisa / 100;
  const promoDiscount = Math.min(totalPrice, Math.max(0, Number(appliedPromo?.discount_amount) || 0));
  const discountedTotal = Math.max(0, totalPrice - promoDiscount);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPaisa,
      totalPrice,
      appliedPromo,
      promoDiscount,
      discountedTotal,
      promoApplying,
      promoError,
      applyPromoCode,
      removePromoCode,
      resetPromoError,
      wishlistIds,
      wishlistCount: wishlistIds.length,
      toggleWishlist,
      isCartOpen,
      setIsCartOpen,
      cartSyncError,
      cartSyncing
    }}>
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
