import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function NewsletterSection() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setMessage(t('Thanks for your interest. Newsletter sign-up is not connected yet.'));
    setEmail('');
  };

  return (
    <section id="newsletter" className="scroll-mt-24 bg-gradient-to-r from-[#651417] via-[#901a1c] to-[#6f171b] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-3"><Mail className="h-8 w-8 shrink-0 text-[#f4c56d]" strokeWidth={1.5} /><div><h2 className="font-extrabold">{t('Stay Updated with Sano Bazar')}</h2><p className="mt-1 text-xs text-white/75">{t('Get the latest offers and new arrivals in your inbox.')}</p></div></div>
        <form onSubmit={handleSubmit} className="flex w-full max-w-lg gap-2">
          <label className="sr-only" htmlFor="newsletter-email">{t('Email address')}</label>
          <input id="newsletter-email" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder={t('Enter your email address')} className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white px-4 py-3 text-sm text-[#302622] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#f4c56d]" />
          <button className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#f4c56d] px-4 py-3 text-sm font-bold text-[#302622] transition hover:bg-[#eab54d]"><span className="hidden sm:inline">{t('Subscribe')}</span><Send className="h-4 w-4" /></button>
        </form>
        {message && <p role="status" className="text-xs text-white/80 md:max-w-40">{message}</p>}
      </div>
    </section>
  );
}
