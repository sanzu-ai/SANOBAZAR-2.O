import { HelpCircle, MapPin, PackageCheck, Truck } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-[#15243b] text-slate-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-[11px] sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 font-medium"><Truck className="h-3.5 w-3.5 text-blue-300" />Free Shipping on Orders Over NPR 2,000</p>
        <div className="hidden items-center gap-5 sm:flex">
          <a className="flex items-center gap-1.5 hover:text-blue-200" href="#footer"><PackageCheck className="h-3.5 w-3.5" />Track Order</a>
          <a className="flex items-center gap-1.5 hover:text-blue-200" href="#footer"><HelpCircle className="h-3.5 w-3.5" />Help</a>
          <label className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <select aria-label="Language" defaultValue="en" className="cursor-pointer bg-transparent text-slate-100 outline-none">
              <option value="en" className="text-slate-900">English</option>
              <option value="ne" className="text-slate-900">नेपाली</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
