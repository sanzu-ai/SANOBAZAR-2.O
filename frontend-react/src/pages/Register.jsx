import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Lock, Mail, PackageCheck, User, UserPlus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const inputClass = 'w-full rounded-xl border border-[#e8dfd7] bg-[#faf8f5] py-3 pl-10 pr-4 text-sm text-[#302622] outline-none transition placeholder:text-[#a49a94] focus:border-[#901a1c]/50 focus:bg-white focus:ring-4 focus:ring-[#901a1c]/[.07]';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError(t('Passwords do not match.'));
      return;
    }

    if (password.length < 6) {
      setError(t('Password must be at least 6 characters long.'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://sanobazar.infinityfree.me/backend/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password
        })
      });

      const data = await response.json();

      if (data.status === 'success' || data.message?.toLowerCase().includes('success')) {
        setSuccess(t('Account created successfully! Redirecting to login...'));
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(t(data.message || 'Registration failed. Email may already exist.'));
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(t('Unable to connect to the server. Please check XAMPP.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[76vh] items-center justify-center bg-[#fbf8f2] px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#eadfd5] bg-white shadow-[0_24px_70px_rgba(54,36,28,.12)] lg:grid-cols-[.92fr_1.08fr]">
        <aside className="relative hidden min-h-[660px] flex-col justify-between overflow-hidden bg-[#901a1c] p-9 text-white sm:p-11 lg:flex">
          <div aria-hidden="true" className="absolute -right-28 -top-24 h-80 w-80 rounded-full border border-white/10 bg-white/[.03]" />
          <div aria-hidden="true" className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border border-white/10" />
          <Link to="/" aria-label="Sano Bazar home" className="relative inline-flex w-fit rounded-md bg-white px-2 py-1.5"><img src="/sanobazar-logo.svg" alt="Sano Bazar" className="h-12 w-auto sm:h-14" /></Link>

          <div className="relative max-w-md">
            <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#f0c4c8]">{t('Join the bazaar')}</p>
            <h1 className="mt-4 text-4xl font-black leading-[1.08] tracking-[-.04em]">{t('Find useful things for everyday life.')}</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">{t('Create an account to keep your orders and saved products together.')}</p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm font-semibold"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><PackageCheck className="h-4 w-4" /></span>{t('Browse the shop')}</div>
              <div className="flex items-center gap-3 text-sm font-semibold"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><UserPlus className="h-4 w-4" /></span>{t('Keep your account in one place')}</div>
            </div>
          </div>

          <p className="relative text-xs font-medium text-white/60">{t('सानो बजार, ठूलो खुसी!')}</p>
        </aside>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <Link to="/" aria-label="Sano Bazar home" className="mb-7 inline-flex rounded-md bg-white px-2 py-1.5 shadow-sm ring-1 ring-[#eee6df] lg:hidden"><img src="/sanobazar-logo.svg" alt="Sano Bazar" className="h-11 w-auto" /></Link>
            <div className="mb-6">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#901a1c]">{t('Create your account')}</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#302622]">{t('Create Account')}</h2>
              <p className="mt-2 text-sm leading-6 text-[#81756e]">{t('Join SANOBAZAR for a modern shopping experience')}</p>
            </div>

            {error && <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium text-rose-700"><AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
            {success && <div role="status" className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm font-medium text-emerald-800"><CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /><span>{success}</span></div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="register-name" className="block text-xs font-bold text-[#514741]">{t('Full Name')}</label>
                <div className="relative mt-2"><User aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#968a82]" /><input id="register-name" type="text" autoComplete="name" required value={fullName} onChange={event => setFullName(event.target.value)} placeholder="Sanjay Thapa" className={inputClass} /></div>
              </div>
              <div>
                <label htmlFor="register-email" className="block text-xs font-bold text-[#514741]">{t('Email Address')}</label>
                <div className="relative mt-2"><Mail aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#968a82]" /><input id="register-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" className={inputClass} /></div>
              </div>
              <div>
                <label htmlFor="register-password" className="block text-xs font-bold text-[#514741]">{t('Password')}</label>
                <div className="relative mt-2"><Lock aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#968a82]" /><input id="register-password" type="password" autoComplete="new-password" required minLength="6" value={password} onChange={event => setPassword(event.target.value)} placeholder="••••••••" className={inputClass} /></div>
              </div>
              <div>
                <label htmlFor="register-confirm-password" className="block text-xs font-bold text-[#514741]">{t('Confirm Password')}</label>
                <div className="relative mt-2"><Lock aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#968a82]" /><input id="register-confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="••••••••" className={inputClass} /></div>
              </div>

              <button type="submit" disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#901a1c] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#511721] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#901a1c] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
                <UserPlus aria-hidden="true" className="h-4 w-4" />{loading ? t('Creating Account...') : t('Register')}<ArrowRight aria-hidden="true" className="ml-auto h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 border-t border-[#eee6df] pt-5 text-center text-sm text-[#81756e]">
              {t('Already have an account?')}{' '}<Link to="/login" className="font-bold text-[#901a1c] hover:text-[#741416]">{t('Sign In')}</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
