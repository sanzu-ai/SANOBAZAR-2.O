import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, PackageCheck, Phone, User, UserPlus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE, apiRequest, readApiJson } from '../lib/api';
import GoogleSignInButton from '../components/GoogleSignInButton';

const inputClass = 'w-full rounded-xl border border-[#e8dfd7] bg-[#faf8f5] py-3 pl-10 pr-4 text-sm text-[#302622] outline-none transition placeholder:text-[#a49a94] focus:border-[#901a1c]/50 focus:bg-white focus:ring-4 focus:ring-[#901a1c]/[.07]';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [googleNotice, setGoogleNotice] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleGoogleCredential = async credential => {
    if (!credential) return;
    if (googleLoading) return;
    if (!termsAccepted) {
      setGoogleNotice(t('Please accept the Terms & Conditions before creating an account with Google.'));
      return;
    }

    setGoogleNotice('');
    setGoogleLoading(true);
    try {
      const response = await apiRequest(`${API_BASE}/google_login.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, flow: 'register', terms_accepted: termsAccepted })
      });
      const data = await readApiJson(response);
      if (!response.ok || data.status !== 'success' || !data.user) {
        setGoogleNotice(t(data.message || 'Google registration could not be completed.'));
        return;
      }

      const userObj = data.user;
      localStorage.setItem('sanobazar_user', JSON.stringify(userObj));
      window.dispatchEvent(new CustomEvent('sanobazar:auth-change', { detail: { user: userObj } }));
      navigate(userObj.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      console.error('Google registration error:', err);
      setGoogleNotice(t(err.message || 'Google registration could not be completed. Please try again later.'));
    } finally {
      setGoogleLoading(false);
    }
  };
  const strengthChecks = [password.length >= 8, /[a-z]/.test(password), /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)];
  const passwordStrength = strengthChecks.filter(Boolean).length;
  const strengthLabel = passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Fair' : 'Strong';

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError(t('Passwords do not match.'));
      return;
    }

    if (password.length < 8 || password.length > 72) {
      setError(t('Password must be between 8 and 72 characters long.'));
      return;
    }
    if (!/^[+0-9().\s-]{7,30}$/.test(phone) || (phone.match(/\d/g) || []).length < 7) {
      setError(t('Enter a valid phone number.'));
      return;
    }
    if (!termsAccepted) {
      setError(t('Please accept the Terms & Conditions to continue.'));
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest(`${API_BASE}/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone_number: phone,
          password,
          terms_accepted: termsAccepted
        })
      });

      const data = await readApiJson(response);

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
      setError(t('Unable to connect to the server. Please try again later.'));
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
            {googleNotice && <div role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{googleNotice}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="register-name" className="block text-xs font-bold text-[#514741]">{t('Full Name')}</label>
                <div className="relative mt-2"><User aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#968a82]" /><input id="register-name" type="text" autoComplete="name" maxLength={100} required value={fullName} onChange={event => setFullName(event.target.value)} placeholder="Sanjay Thapa" className={inputClass} /></div>
              </div>
              <div>
                <label htmlFor="register-email" className="block text-xs font-bold text-[#514741]">{t('Email Address')}</label>
                <div className="relative mt-2"><Mail aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#968a82]" /><input id="register-email" type="email" autoComplete="email" maxLength={100} required value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" className={inputClass} /></div>
              </div>
              <div>
                <label htmlFor="register-phone" className="block text-xs font-bold text-[#514741]">{t('Phone Number')}</label>
                <div className="relative mt-2"><Phone aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#968a82]" /><input id="register-phone" type="tel" autoComplete="tel" inputMode="tel" minLength={7} maxLength={30} required value={phone} onChange={event => setPhone(event.target.value)} placeholder="+977 98XXXXXXXX" className={inputClass} /></div>
              </div>
              <div>
                <label htmlFor="register-password" className="block text-xs font-bold text-[#514741]">{t('Password')}</label>
                <div className="relative mt-2"><Lock aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#968a82]" /><input id="register-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength="8" maxLength="72" value={password} onChange={event => setPassword(event.target.value)} placeholder="••••••••" className={`${inputClass} pr-12`} /><button type="button" aria-label={showPassword ? t('Hide password') : t('Show password')} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#716963] hover:text-[#901a1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#901a1c]"><span className="sr-only">{showPassword ? t('Hide password') : t('Show password')}</span>{showPassword ? <EyeOff aria-hidden="true" size={18}/> : <Eye aria-hidden="true" size={18}/>}</button></div>
                {password && <div className="mt-2" role="meter" aria-label={t('Password strength')} aria-valuemin={0} aria-valuemax={5} aria-valuenow={passwordStrength} aria-valuetext={t(strengthLabel)}><div className="flex gap-1" aria-hidden="true">{strengthChecks.map((passed, index) => <span key={index} className={`h-1.5 flex-1 rounded-full transition-colors ${index < passwordStrength ? passwordStrength <= 2 ? 'bg-rose-500' : passwordStrength <= 3 ? 'bg-amber-500' : 'bg-emerald-600' : 'bg-[#eee6df]'}`} />)}</div><p className="mt-1 text-[11px] text-[#716963]">{t('Password strength')}: <span className="font-bold">{t(strengthLabel)}</span></p></div>}
              </div>
              <div>
                <label htmlFor="register-confirm-password" className="block text-xs font-bold text-[#514741]">{t('Confirm Password')}</label>
                <div className="relative mt-2"><Lock aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#968a82]" /><input id="register-confirm-password" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required minLength="8" maxLength="72" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="••••••••" className={`${inputClass} pr-12`} /><button type="button" aria-label={showConfirmPassword ? t('Hide password') : t('Show password')} aria-pressed={showConfirmPassword} onClick={() => setShowConfirmPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#716963] hover:text-[#901a1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#901a1c]"><span className="sr-only">{showConfirmPassword ? t('Hide password') : t('Show password')}</span>{showConfirmPassword ? <EyeOff aria-hidden="true" size={18}/> : <Eye aria-hidden="true" size={18}/>}</button></div>
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-[#514741]"><input type="checkbox" required checked={termsAccepted} onChange={event => setTermsAccepted(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#901a1c]" /><span>{t('I agree to the Sano Bazar Terms & Conditions.')}</span></label>

              <button type="submit" disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#901a1c] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#511721] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#901a1c] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
                <UserPlus aria-hidden="true" className="h-4 w-4" />{loading ? t('Creating Account...') : t('Register')}<ArrowRight aria-hidden="true" className="ml-auto h-4 w-4" />
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.12em] text-[#a49a94]">
              <span className="h-px flex-1 bg-[#eee6df]" />
              <span>{t('Or sign up with')}</span>
              <span className="h-px flex-1 bg-[#eee6df]" />
            </div>
            {googleLoading && <p role="status" className="mb-2 text-center text-xs text-[#81756e]">{t('Verifying your Google account...')}</p>}
            <GoogleSignInButton onCredential={handleGoogleCredential} mode="signup" />

            <div className="mt-6 border-t border-[#eee6df] pt-5 text-center text-sm text-[#81756e]">
              {t('Already have an account?')}{' '}<Link to="/login" className="font-bold text-[#901a1c] hover:text-[#741416]">{t('Sign In')}</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
