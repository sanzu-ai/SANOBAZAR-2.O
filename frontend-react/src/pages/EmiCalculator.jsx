import { useState } from 'react';
import { ArrowRight, Calculator, CreditCard, Info, Landmark, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { formatNPR } from '../lib/currency';

const fieldClass = 'mt-2 h-12 w-full rounded-xl border border-[#e9e0d8] bg-white px-4 text-sm text-[#302622] outline-none transition placeholder:text-[#a49a94] focus:border-[#901a1c]/50 focus:ring-4 focus:ring-[#901a1c]/[.07]';

function calculateEmi(principal, annualRate, months) {
  if (principal <= 0 || months <= 0) return null;
  const monthlyRate = annualRate / 100 / 12;
  const monthlyEmi = monthlyRate === 0
    ? principal / months
    : principal * monthlyRate * ((1 + monthlyRate) ** months) / (((1 + monthlyRate) ** months) - 1);
  const totalPayment = monthlyEmi * months;
  return { monthlyEmi, totalPayment, totalInterest: Math.max(0, totalPayment - principal), principal };
}

function AmountField({ id, label, value, onChange, min, max, step, suffix, hint, t }) {
  return <div>
    <div className="flex items-end justify-between gap-3">
      <label htmlFor={id} className="text-sm font-bold text-[#39302c]">{t(label)}</label>
      {suffix && <span className="text-xs font-medium text-[#81756e]">{t(suffix)}</span>}
    </div>
    <input id={id} type="number" inputMode="decimal" min={min} max={max} step={step} required value={value} onChange={onChange} className={fieldClass} />
    <input type="range" aria-label={t(label)} min={min} max={max} step={step} value={value} onChange={onChange} className="mt-3 h-1.5 w-full cursor-pointer accent-[#901a1c]" />
    <div className="mt-1 flex justify-between text-[11px] text-[#938982]"><span>{hint[0]}</span><span>{hint[1]}</span></div>
  </div>;
}

export default function EmiCalculator() {
  const { t } = useLanguage();
  const [amount, setAmount] = useState('100000');
  const [annualRate, setAnnualRate] = useState('12');
  const [months, setMonths] = useState('12');
  const [result, setResult] = useState(null);

  const updateValue = setter => event => {
    setter(event.target.value);
    setResult(null);
  };

  const submit = event => {
    event.preventDefault();
    const principal = Number(amount);
    const rate = Number(annualRate);
    const tenure = Number(months);
    if (principal < 1000 || principal > 5000000 || rate < 0 || rate > 30 || tenure < 1 || tenure > 360) return;
    setResult(calculateEmi(principal, rate, tenure));
  };

  const principal = result?.principal || 0;
  const totalInterest = result?.totalInterest || 0;
  const totalPayment = result?.totalPayment || 0;
  const principalShare = totalPayment > 0 ? (principal / totalPayment) * 100 : 0;
  const interestShare = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

  return <div className="bg-[#fbf8f2]">
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-7 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8">
      <nav aria-label={t('Breadcrumb')} className="mb-6 flex items-center gap-2 text-xs font-medium text-[#837872]">
        <Link to="/" className="transition hover:text-[#901a1c]">{t('Home')}</Link><span aria-hidden="true">/</span><span className="text-[#302622]">{t('EMI Calculator')}</span>
      </nav>

      <header className="mb-8 max-w-3xl sm:mb-10">
        <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#901a1c]">{t('Plan your purchase')}</p>
        <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-[#261f1c] sm:text-4xl lg:text-[42px]">{t('Calculate your EMI and plan with confidence.')}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#716963] sm:text-base">{t('Enter an amount, interest rate, and repayment period to estimate your monthly payment.')}</p>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[1.03fr_.97fr] lg:gap-6">
        <form onSubmit={submit} className="rounded-2xl border border-[#ece3db] bg-white p-5 shadow-[0_12px_34px_rgba(52,38,30,.04)] sm:p-7">
          <div className="mb-7 flex items-start gap-3 border-b border-[#f0e9e2] pb-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7edef] text-[#901a1c]"><Calculator aria-hidden="true" className="h-5 w-5" /></span>
            <div><h2 className="text-lg font-extrabold text-[#302622]">{t('Loan details')}</h2><p className="mt-1 text-sm text-[#81756e]">{t('Adjust the values to see your estimated EMI.')}</p></div>
          </div>

          <div className="space-y-7">
            <AmountField id="emi-amount" label="Loan amount" value={amount} onChange={updateValue(setAmount)} min="1000" max="5000000" step="1000" suffix="NPR" hint={[t('NPR 1,000'), t('NPR 50,00,000')]} t={t} />
            <AmountField id="emi-rate" label="Annual interest rate" value={annualRate} onChange={updateValue(setAnnualRate)} min="0" max="30" step="0.1" suffix="%" hint={['0%', '30%']} t={t} />
            <AmountField id="emi-tenure" label="Loan tenure" value={months} onChange={updateValue(setMonths)} min="1" max="360" step="1" suffix="Months" hint={[t('1 month'), t('30 years')]} t={t} />
          </div>

          <button type="submit" className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#901a1c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#511721] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#901a1c] focus-visible:ring-offset-2 sm:w-auto">
            {t('Calculate EMI')}<ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#81756e]"><Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#901a1c]" />{t('This is an estimate for planning. Your bank or lender sets the final rate, fees, and eligibility.')}</p>
        </form>

        <section aria-live="polite" aria-label={t('EMI calculation results')} className="rounded-2xl border border-[#ece3db] bg-white p-5 shadow-[0_12px_34px_rgba(52,38,30,.04)] sm:p-7">
          <div className="flex items-start justify-between gap-4 border-b border-[#f0e9e2] pb-5">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-[#901a1c]">{t('Your estimate')}</p><h2 className="mt-1 text-xl font-extrabold text-[#302622]">{t('EMI calculation results')}</h2></div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f5f1eb] text-[#901a1c]"><Wallet aria-hidden="true" className="h-5 w-5" /></span>
          </div>

          <div className="mt-5 rounded-xl bg-[#901a1c] p-5 text-white sm:p-6">
            <p className="text-xs font-semibold text-white/75">{t('Estimated monthly EMI')}</p>
            <p className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{formatNPR(result?.monthlyEmi || 0)}</p>
            {!result && <p className="mt-2 text-xs text-white/75">{t('Update the loan details and calculate to view your estimate.')}</p>}
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#f0e9e2] p-4"><dt className="text-[11px] font-semibold text-[#81756e]">{t('Total amount')}</dt><dd className="mt-1 text-sm font-extrabold text-[#302622]">{formatNPR(totalPayment)}</dd></div>
            <div className="rounded-xl border border-[#f0e9e2] p-4"><dt className="text-[11px] font-semibold text-[#81756e]">{t('Total interest')}</dt><dd className="mt-1 text-sm font-extrabold text-[#302622]">{formatNPR(totalInterest)}</dd></div>
            <div className="col-span-2 rounded-xl border border-[#f0e9e2] p-4"><dt className="text-[11px] font-semibold text-[#81756e]">{t('Principal amount')}</dt><dd className="mt-1 text-sm font-extrabold text-[#302622]">{formatNPR(principal)}</dd></div>
          </dl>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-extrabold text-[#302622]">{t('Payment breakdown')}</h3><span className="text-[11px] font-medium text-[#81756e]">{t('Over the full tenure')}</span></div>
            <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-[#f2ece6]" role="img" aria-label={`${t('Principal')} ${principalShare.toFixed(1)}%, ${t('Interest')} ${interestShare.toFixed(1)}%`}>
              {principalShare > 0 && <span className="bg-[#901a1c]" style={{ width: `${principalShare}%` }} />}
              {interestShare > 0 && <span className="bg-[#d9a452]" style={{ width: `${interestShare}%` }} />}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2.5"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#901a1c]" /><div><p className="text-xs font-bold text-[#514741]">{t('Principal')} <span className="font-medium text-[#81756e]">{principalShare.toFixed(1)}%</span></p><p className="mt-1 text-sm font-extrabold text-[#302622]">{formatNPR(principal)}</p></div></div>
              <div className="flex items-start gap-2.5"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#d9a452]" /><div><p className="text-xs font-bold text-[#514741]">{t('Interest')} <span className="font-medium text-[#81756e]">{interestShare.toFixed(1)}%</span></p><p className="mt-1 text-sm font-extrabold text-[#302622]">{formatNPR(totalInterest)}</p></div></div>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-3" aria-label={t('EMI information')}>
        {[
          { Icon: Calculator, title: 'Clear estimate', body: 'See how amount, rate, and term affect a monthly payment.' },
          { Icon: Landmark, title: 'Confirm with your lender', body: 'Rates and fees can vary by bank, product, and eligibility.' },
          { Icon: CreditCard, title: 'Plan before you shop', body: 'Use this estimate as a starting point for your budget.' }
        ].map(({ Icon, title, body }) => <article key={title} className="rounded-2xl border border-[#ece3db] bg-white p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7edef] text-[#901a1c]"><Icon aria-hidden="true" className="h-[18px] w-[18px]" /></span>
          <h2 className="mt-4 text-sm font-extrabold text-[#302622]">{t(title)}</h2>
          <p className="mt-1.5 text-xs leading-5 text-[#81756e]">{t(body)}</p>
        </article>)}
      </section>

      <div className="mt-7 flex flex-col items-start justify-between gap-3 rounded-2xl bg-[#f1ebe3] p-5 sm:flex-row sm:items-center sm:px-6">
        <div><p className="text-sm font-extrabold text-[#302622]">{t('Need help choosing a payment option?')}</p><p className="mt-1 text-xs text-[#716963]">{t('Contact our team for current payment information.')}</p></div>
        <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-[#d8ccc1] bg-white px-4 py-2.5 text-xs font-bold text-[#901a1c] transition hover:border-[#901a1c]/40">{t('Contact us')}<ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></Link>
      </div>
    </div>
  </div>;
}
