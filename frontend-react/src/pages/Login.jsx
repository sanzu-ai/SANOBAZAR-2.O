import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Lock, LogIn, Mail, PackageCheck, ShieldCheck } from 'lucide-react';
import { API_BASE } from '../lib/api';
import { useLanguage } from '../context/LanguageContext';

const inputClass = 'w-full rounded-xl border border-[#e8dfd7] bg-[#faf8f5] py-3 pl-10 pr-4 text-sm text-[#302622] outline-none transition placeholder:text-[#a49a94] focus:border-[#901a1c]/50 focus:bg-white focus:ring-4 focus:ring-[#901a1c]/[.07]';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/login.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.status === 'success' || data.user) {
        const userObj = data.user || data;
        localStorage.setItem('sanobazar_user', JSON.stringify(userObj));
        window.dispatchEvent(new CustomEvent('sanobazar:auth-change', { detail: { user: userObj } }));

        if (userObj.role === 'admin') {
          navigate('/admin');
        } else if (location.state?.cartReturnTo) {
          navigate(location.state.from || '/checkout', { state: { cartReturnTo: location.state.cartReturnTo } });
        } else {
          navigate(location.state?.from || '/');
        }
      } else {
        setError(t(data.message || 'Invalid email or password.'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t('Unable to connect to the server. Please check XAMPP.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[76vh] items-center justify-center bg-[#fbf8f2] px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#eadfd5] bg-white shadow-[0_24px_70px_rgba(54,36,28,.12)] lg:grid-cols-[.92fr_1.08fr]">
        <aside className="relative hidden min-h-[590px] flex-col justify-between overflow-hidden bg-[#901a1c] p-9 text-white sm:p-11 lg:flex">
          <div aria-hidden="true" className="absolute -right-28 -top-24 h-80 w-80 rounded-full border border-white/10 bg-white/[.03]" />
          <div aria-hidden="true" className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border border-white/10" />
          <Link to="/" aria-label="Sano Bazar home" className="relative inline-flex w-fit rounded-md bg-white px-2 py-1.5"><img src="/sanobazar-logo.svg" alt="Sano Bazar" className="h-12 w-auto sm:h-14" /></Link>

          <div className="relative max-w-md">
            <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#f0c4c8]">{t('Welcome to Sano Bazar')}</p>
            <h1 className="mt-4 text-4xl font-black leading-[1.08] tracking-[-.04em]">{t('A simpler way to shop in Nepal')}</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">{t('Discover products for everyday life at Sano Bazar.')}</p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm font-semibold"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><PackageCheck className="h-4 w-4" /></span>{t('Explore products')}</div>
              <div className="flex items-center gap-3 text-sm font-semibold"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><ShieldCheck className="h-4 w-4" /></span>{t('Your orders in one place')}</div>
            </div>
          </div>

          <p className="relative text-xs font-medium text-white/60">{t('सानो बजार, ठूलो खुसी!')}</p>
        </aside>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <Link to="/" aria-label="Sano Bazar home" className="mb-8 inline-flex rounded-md bg-white px-2 py-1.5 shadow-sm ring-1 ring-[#eee6df] lg:hidden"><img src="/sanobazar-logo.svg" alt="Sano Bazar" className="h-11 w-auto" /></Link>
            <div className="mb-7">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#901a1c]">{t('Your account')}</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#302622]">{t('Welcome Back')}</h2>
              <p className="mt-2 text-sm leading-6 text-[#81756e]">{t('Sign in to manage your account and orders')}</p>
            </div>

            {error && <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium text-rose-700"><AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="block text-xs font-bold text-[#514741]">{t('Email Address')}</label>
                <div className="relative mt-2"><Mail aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#968a82]" /><input id="login-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" className={inputClass} /></div>
              </div>
              <div>
                <label htmlFor="login-password" className="block text-xs font-bold text-[#514741]">{t('Password')}</label>
                <div className="relative mt-2"><Lock aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#968a82]" /><input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} placeholder="••••••••" className={inputClass} /></div>
              </div>

              <button type="submit" disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#901a1c] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#511721] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#901a1c] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
                <LogIn aria-hidden="true" className="h-4 w-4" />{loading ? t('Authenticating...') : t('Sign In')}<ArrowRight aria-hidden="true" className="ml-auto h-4 w-4" />
              </button>
            </form>

            <div className="mt-7 border-t border-[#eee6df] pt-5 text-center text-sm text-[#81756e]">
              {t("Don't have an account?")}{' '}<Link to="/register" className="font-bold text-[#901a1c] hover:text-[#741416]">{t('Create an account')}</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
