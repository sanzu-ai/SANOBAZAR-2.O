import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import PasswordRecoveryLayout from '../components/PasswordRecoveryLayout';
import { API_BASE, apiRequest, readApiJson } from '../lib/api';

const inputClass = 'w-full rounded-xl border border-[#e8dfd7] bg-[#faf8f5] py-3 pl-10 pr-4 text-sm text-[#302622] outline-none transition placeholder:text-[#a49a94] focus:border-[#901a1c]/50 focus:bg-white focus:ring-4 focus:ring-[#901a1c]/[.07]';
const genericSuccess = 'If an account matches that email address, the password reset request has been recorded.';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiRequest(`${API_BASE}/forgot_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await readApiJson(response);

      if (response.ok && data.status === 'success') {
        setSuccess(true);
      } else if (response.status === 429) {
        setError('Too many requests. Please wait a while and try again.');
      } else if (response.status === 422) {
        setError('Enter a valid email address and try again.');
      } else {
        setError('We could not process your request right now. Please try again later.');
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
      title="Forgot password?"
      description="Enter the email address for your account. If it matches, we’ll send you a link to reset your password."
    >
      {error && <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium text-rose-700"><AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}

      {success ? (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
          <div className="flex items-start gap-2.5"><CheckCircle2 aria-hidden="true" className="mt-1 h-4 w-4 shrink-0" /><p>{genericSuccess}</p></div>
          <p className="mt-2 pl-6 text-emerald-700">Check your inbox and spam folder.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="forgot-email" className="block text-xs font-bold text-[#514741]">Email Address</label>
            <div className="relative mt-2"><Mail aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#968a82]" /><input id="forgot-email" type="email" name="email" autoComplete="email" inputMode="email" maxLength={100} required value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" className={inputClass} /></div>
          </div>
          <button type="submit" disabled={loading} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#901a1c] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#511721] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#901a1c] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">
            {loading ? 'Sending request…' : 'Send reset link'}{!loading && <ArrowRight aria-hidden="true" className="ml-auto h-4 w-4" />}
          </button>
        </form>
      )}

      <div className="mt-7 border-t border-[#eee6df] pt-5 text-center text-sm">
        <Link to="/login" className="inline-flex items-center gap-2 font-bold text-[#901a1c] hover:text-[#741416]"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back to Login</Link>
      </div>
    </PasswordRecoveryLayout>
  );
}
