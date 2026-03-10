import React from 'react'
import type { SocialSecurityResults as SocialSecurityResult } from '../../../backend/calculations/socialSecurity'

type SocialSecurityResultsProps = {
  result: SocialSecurityResult | null
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

export default function SocialSecurityResults({ result }: SocialSecurityResultsProps) {
  return (
    <section className="flex min-h-[402px] flex-col items-center gap-10 rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
      <div className="flex flex-col gap-[10px] text-center">
        <p className="text-[16px] font-medium text-sub">Total Monthly Payment</p>
        <p className="text-[40px] font-semibold leading-none text-heading">
          {result ? currencyFormatter.format(result.monthlyPayment) : '—'}
        </p>
      </div>

      <div className="h-px w-full bg-[#a7f3d0]" />

      <div className="w-full text-left">
        <h3 className="text-[19px] font-semibold text-heading">Amortization</h3>
      </div>

      {result ? (
        <div className="w-full space-y-4 text-[19px]">
          <Row label={`Total of ${result.totalMonths} monthly payments`} value={currencyFormatter.format(result.totalLifetimePayments)} strong />
          <Row label="Total interest" value={currencyFormatter.format(result.totalInterest)} />
          <Row label="Full retirement age" value={`${result.fraAge.toFixed(3)} years`} />
          <Row label="Benefit start age" value={`${result.effectiveStartAge.toFixed(3)} years`} />
          {result.usedEstimatedBenefit ? (
            <p className="pt-2 text-[14px] leading-[21px] text-body">
              Using estimated national average Social Security benefit.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center px-6 text-center text-[16px] leading-[25.6px] text-sub">
          Enter your Social Security details to estimate lifetime benefits and investment growth.
        </div>
      )}
    </section>
  )
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className={strong ? 'font-semibold text-heading' : 'font-medium text-body'}>{label}</p>
      <p className="text-right font-semibold text-heading">{value}</p>
    </div>
  )
}
