import { Headphones, RotateCcw, ShieldCheck, Truck } from 'lucide-react';

const benefits = [
  { title: 'Free Shipping', detail: 'On orders over NPR 2,000', Icon: Truck },
  { title: 'Secure Payments', detail: 'Safe checkout experience', Icon: ShieldCheck },
  { title: 'Customer Support', detail: 'We are here to help', Icon: Headphones },
  { title: 'Easy Returns', detail: 'Hassle-free returns', Icon: RotateCcw }
];

export default function ServiceBenefits() {
  return (
    <section aria-label="Shopping benefits" className="border-b border-slate-100 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-100 px-4 py-5 sm:px-6 md:grid-cols-4 lg:px-8">
        {benefits.map(({ title, detail, Icon }) => (
          <div key={title} className="flex items-center gap-3 px-3 py-2 sm:px-6">
            <Icon className="h-7 w-7 shrink-0 text-[#17263d]" strokeWidth={1.7} />
            <div><h3 className="text-xs font-extrabold text-slate-900 sm:text-sm">{title}</h3><p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">{detail}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}
