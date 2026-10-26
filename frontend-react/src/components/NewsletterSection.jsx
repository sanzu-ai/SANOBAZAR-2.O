import { useState } from 'react';
import { Mail, Send } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setMessage('Thanks for your interest. Newsletter sign-up is not connected yet.');
    setEmail('');
  };

  return (
    <section id="newsletter" className="scroll-mt-24 bg-[#0e3c38] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-3"><Mail className="h-8 w-8 shrink-0 text-teal-100" strokeWidth={1.5} /><div><h2 className="font-extrabold">Stay Updated with Sano Bazar</h2><p className="mt-1 text-xs text-teal-100">Get the latest offers and new arrivals in your inbox.</p></div></div>
        <form onSubmit={handleSubmit} className="flex w-full max-w-lg gap-2">
          <label className="sr-only" htmlFor="newsletter-email">Email address</label>
          <input id="newsletter-email" type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="Enter your email address" className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-blue-400 placeholder:text-slate-400 focus:ring-2" />
          <button className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#1766d1] px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"><span className="hidden sm:inline">Subscribe</span><Send className="h-4 w-4" /></button>
        </form>
        {message && <p role="status" className="text-xs text-teal-100 md:max-w-40">{message}</p>}
      </div>
    </section>
  );
}
