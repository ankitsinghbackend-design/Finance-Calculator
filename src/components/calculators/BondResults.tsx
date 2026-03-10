import React from 'react'
import type { BondResults as BondResult } from '../../../backend/calculations/bondCalc'

type BondResultsProps = {
  result: BondResult | null
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

export default function BondResults({ result }: BondResultsProps) {
  if (!result) {
    return (
      <section className="rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
        <p className="text-[16px] leading-[25.6px] text-body">
          Calculate a bond&apos;s price or yield to maturity, inspect accrued interest, and compare coupon cash flow across trading conventions.
        </p>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
      <div className="pointer-events-none absolute right-[-120px] top-1/2 h-[320px] w-[320px] -translate-y-1/2 rounded-full border-[44px] border-[rgba(167,243,208,0.35)]" />
      <div className="pointer-events-none absolute right-[-20px] top-[90px] h-[180px] w-[180px] rounded-full border-2 border-[rgba(167,243,208,0.7)]" />

      <div className="relative flex flex-col items-center gap-[10px] text-center">
        <p className="text-[16px] font-medium text-sub">Total Monthly Payment</p>
        <p className="text-[40px] font-semibold leading-none text-heading">{currencyFormatter.format(result.totalValue)}</p>
        <p className="text-[16px] leading-[25.6px] text-body">Solved YTM: {result.ytm.toFixed(2)}% · Accrued interest: {currencyFormatter.format(result.accruedInterest)}</p>
      </div>

      <div className="relative my-10 h-px w-full bg-[#a7f3d0]" />

      <div className="relative w-full text-center">
        <p className="text-[19px] font-semibold text-heading">Amortization</p>
      </div>

      <div className="relative mt-6 space-y-4">
        <ResultRow label={`Total of ${result.couponPaymentsCount} payments`} value={currencyFormatter.format(result.totalCouponPayments)} />
        <ResultRow label="Total interest" value={currencyFormatter.format(result.totalInterest)} />
      </div>
    </section>
  )
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="flex-1 text-[16px] font-semibold text-heading">{label}</p>
      <p className="text-[16px] font-semibold text-heading">{value}</p>
    </div>
  )
}
