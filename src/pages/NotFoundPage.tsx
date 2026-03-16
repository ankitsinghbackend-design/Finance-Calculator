import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="bg-[#f5f7fa] py-12 sm:py-16">
      <div className="mx-auto max-w-[1200px] px-6 xl:px-10">
        <div className="rounded-2xl border border-cardBorder bg-white p-8 text-center shadow-card sm:p-12">
          <p className="text-[16px] font-medium text-sub">404</p>
          <h1 className="mt-2 text-[34px] font-semibold leading-[1.1] text-heading sm:text-[44px]">
            Page Not Found
          </h1>
          <p className="mx-auto mt-3 max-w-[680px] text-[16px] leading-[25.6px] text-body">
            The page you are looking for may have been moved, deleted, or is temporarily unavailable.
            Use one of the links below to continue browsing Finovo.
          </p>

          <div className="mx-auto mt-8 grid max-w-[780px] grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              to="/"
              className="inline-flex h-[44px] items-center justify-center rounded-lg bg-primary px-5 text-[16px] font-medium text-white transition hover:bg-primaryDark"
            >
              Homepage
            </Link>
            <Link
              to="/finance"
              className="inline-flex h-[44px] items-center justify-center rounded-lg border border-[#e1e6ef] bg-white px-5 text-[16px] font-medium text-[#1d2433] transition hover:bg-slate-50"
            >
              Calculators
            </Link>
            <Link
              to="/blogs"
              className="inline-flex h-[44px] items-center justify-center rounded-lg border border-[#e1e6ef] bg-white px-5 text-[16px] font-medium text-[#1d2433] transition hover:bg-slate-50"
            >
              Blog
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
