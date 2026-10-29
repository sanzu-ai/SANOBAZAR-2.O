import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const response = await fetch('http://localhost/SANOBAZAR/backend/register.php', {
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" aria-label="Sano Bazar home" className="inline-flex justify-center">
            <img src="/sanobazar-logo.svg" alt="" className="h-12 w-auto max-w-[230px]" />
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">{t('Create Account')}</h2>
          <p className="text-xs text-gray-500">{t('Join SANOBAZAR for a modern shopping experience')}</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Notification */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-[#087f5b] text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#087f5b]" />
            <span>{success}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{t('Full Name')}</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Sanjay Thapa"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#087f5b] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{t('Email Address')}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#087f5b] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{t('Password')}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#087f5b] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{t('Confirm Password')}</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-[#087f5b] focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#087f5b] hover:bg-[#066347] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-98 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? t('Creating Account...') : t('Register')}
          </button>
        </form>

        {/* Redirect Link to Separate Login Page */}
        <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
          {t('Already have an account?')}{' '}
          <Link to="/login" className="font-bold text-[#087f5b] hover:underline">
            {t('Sign In')}
          </Link>
        </div>

      </div>
    </div>
  );
}
