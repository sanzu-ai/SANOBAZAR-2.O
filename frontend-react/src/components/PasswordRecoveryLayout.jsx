import { Link } from 'react-router-dom';

export default function PasswordRecoveryLayout({ eyebrow, title, description, children }) {
  return (
    <div className="flex min-h-[76vh] items-center justify-center bg-[#fbf8f2] px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#eadfd5] bg-white shadow-[0_24px_70px_rgba(54,36,28,.12)] lg:grid-cols-[.92fr_1.08fr]">
        <aside className="relative hidden min-h-[500px] flex-col justify-between overflow-hidden bg-[#901a1c] p-9 text-white sm:p-11 lg:flex">
          <div aria-hidden="true" className="absolute -right-28 -top-24 h-80 w-80 rounded-full border border-white/10 bg-white/[.03]" />
          <div aria-hidden="true" className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border border-white/10" />
          <Link to="/" aria-label="Sano Bazar home" className="relative inline-flex w-fit rounded-md bg-white px-2 py-1.5">
            <img src="/sanobazar-logo.svg" alt="Sano Bazar" className="h-12 w-auto sm:h-14" />
          </Link>
          <div className="relative max-w-md">
            <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#f0c4c8]">SANOBAZAR ACCOUNT</p>
            <h1 className="mt-4 text-4xl font-black leading-[1.08] tracking-[-.04em]">Your account, safely back in reach.</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">We’ll help you get back to shopping and managing your orders.</p>
          </div>
          <p className="relative text-xs font-medium text-white/60">सानो बजार, ठूलो खुसी!</p>
        </aside>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <Link to="/" aria-label="Sano Bazar home" className="mb-8 inline-flex rounded-md bg-white px-2 py-1.5 shadow-sm ring-1 ring-[#eee6df] lg:hidden">
              <img src="/sanobazar-logo.svg" alt="Sano Bazar" className="h-11 w-auto" />
            </Link>
            <div className="mb-7">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#901a1c]">{eyebrow}</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#302622]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#81756e]">{description}</p>
            </div>
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
