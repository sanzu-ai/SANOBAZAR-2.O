import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import PasswordRecoveryLayout from '../components/PasswordRecoveryLayout';
import { API_BASE, apiRequest, readApiJson } from '../lib/api';

const inputClass = 'w-full rounded-xl border border-[#e8dfd7] bg-[#faf8f5] py-3 pl-10 pr-12 text-sm text-[#302622] outline-none transition placeholder:text-[#a49a94] focus:border-[#901a1c]/50 focus:bg-white focus:ring-4 focus:ring-[#901a1c]/[.07]';

export default function ResetPassword() {
  const capturedToken = useRef(false);
  const [token, setToken] = useState('');
  const [tokenReady, setTokenReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [invalidLink, setInvalidLink] = useState(false);

  useLayoutEffect(() => {
    if (capturedToken.current) return;
    capturedToken.current = true;
    const captured = new URLSearchParams(window.location.search).get('token') || '';

    // Remove all query parameters (including the reset token) before the page paints.
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.hash}`);
    setToken(captured);
    setTokenReady(true);
  }, []);

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');

    if (password.length < 8 || password.length > 72) {
      setError('Your password must be between 8 and 72 characters.');
      return;
    }
    if (password !== confirmation) {
      setError('The passwords do not match.');
      return;
    }
    if (!token) {
      setInvalidLink(true);
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest(`${API_BASE}/reset_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, password_confirmation: confirmation })
      });
      const data = await readApiJson(response);

      if (response.ok && data.status === 'success') {
        setSuccess(true);
        setToken('');
        setPassword('');
        setConfirmation('');
      } else if (response.status === 400 || response.status === 422) {
        setInvalidLink(true);
      } else if (response.status === 429) {
        setError('Too many attempts. Please wait a while and try again.');
      } else {
        setError('We could not reset your password right now. Please try again later.');
      }
    } catch {
      setError('Unable to connect right now. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PasswordRecoveryLayout
      eyebrow="Account recovery"
      title={success ? 'Password updated' : 'Set a new password'}
      description={success ? 'Your password has been changed. You can now sign in with your new password.' : 'Choose a new password for your SANOBAZAR account.'}
    >
      {error && <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium text-rose-700"><AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}

      {success ? (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
          <div className="flex items-start gap-2.5"><CheckCircle2 aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" /><p>Your password has been reset successfully.</p></div>
          <Link to="/login" className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#901a1c] px-5 py-3 text-sm font-bold text-white hover:bg-[#511721] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#901a1c] focus-visible:ring-offset-2">Go to Login<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div>
      ) : (invalidLink || (tokenReady && !/^[a-f0-9]{64}$/i.test(token))) ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <p>This reset link is invalid or has expired. Request a new one to continue.</p>
          <Link to="/forgot-password" className="mt-4 inline-flex items-center gap-2 font-bold text-[#901a1c] hover:underline">Request a new link<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" aria-busy={loading || !tokenReady}>
          <div>
            <label htmlFor="reset-password" className="block text-xs font-bold text-[#514741]">New Password</label>
            <div className="relative mt-2"><Lock aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#968a82]" /><input id="reset-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={72} required value={password} onChange={event => setPassword(event.target.value)} placeholder="8 to 72 characters" className={inputClass} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#716963] hover:text-[#901a1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#901a1c]"><span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>{showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}</button></div>
            <p className="mt-1.5 text-[11px] text-[#81756e]">Use 8–72 characters.</p>
          </div>
          <div>
            <label htmlFor="reset-confirm-password" className="block text-xs font-bold text-[#514741]">Confirm New Password</label>
            <div className="relative mt-2"><Lock aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#968a82]" /><input id="reset-confirm-password" type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={72} required value={confirmation} onChange={event => setConfirmation(event.target.value)} placeholder="Re-enter your password" className={inputClass} /><button type="button" aria-label={showConfirmation ? 'Hide password' : 'Show password'} aria-pressed={showConfirmation} onClick={() => setShowConfirmation(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#716963] hover:text-[#901a1c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#901a1c]"><span className="sr-only">{showConfirmation ? 'Hide password' : 'Show password'}</span>{showConfirmation ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}</button></div>
          </div>
          <button type="submit" disabled={loading || !tokenReady || invalidLink || !/^[a-f0-9]{64}$/i.test(token)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#901a1c] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#511721] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#901a1c] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
            {loading ? 'Updating password…' : 'Reset Password'}{!loading && <ArrowRight aria-hidden="true" className="ml-auto h-4 w-4" />}
          </button>
          <p className="text-center text-sm"><Link to="/login" className="inline-flex items-center gap-2 font-bold text-[#901a1c] hover:text-[#741416]"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back to Login</Link></p>
        </form>
      )}
    </PasswordRecoveryLayout>
  );
}
