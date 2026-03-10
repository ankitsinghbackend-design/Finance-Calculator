import React from 'react'
import type { DownPaymentResults as DownPaymentResult } from '../../../backend/calculations/downPayment'

type DownPaymentResultsProps = {
  result: DownPaymentResult | null
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

export default function DownPaymentResults({ result }: DownPaymentResultsProps) {
  if (!result) {
    return (
      <section className="rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
        <p className="text-[16px] leading-[25.6px] text-body">Enter your cash and timeline assumptions to estimate an affordable down payment and resulting loan amount.</p>
      </section>
    )
  }

  return (
    <section className="rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
      <div className="flex flex-col items-center gap-[10px] text-center">
        <p className="text-[16px] font-medium text-sub">Total Monthly Payment</p>
        <p className="text-[40px] font-semibold leading-none text-heading">{currencyFormatter.format(result.totalMonthlyPayment)}</p>
      </div>

      <div className="my-10 h-px w-full bg-[#a7f3d0]" />

      <div className="w-full">
        <p className="text-[19px] font-medium text-heading">Down Payment Calculator</p>
      </div>

      <div className="mt-6 space-y-4 text-[19px] font-semibold">
        <SummaryRow label="Home Price" value={currencyFormatter.format(result.homePrice)} />
        <SummaryRow label="Down Payment" value={currencyFormatter.format(result.downPayment)} />
        <SummaryRow label="Closing Costs" value={currencyFormatter.format(result.closingCosts)} />
        <SummaryRow label="Loan Amount" value={currencyFormatter.format(result.loanAmount)} />
        <SummaryRow label="Monthly Payment" value={currencyFormatter.format(result.monthlyPayment)} />
      </div>
    </section>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="flex-1 text-body">{label}</p>
      <p className="text-sub">{value}</p>
    </div>
  )
}
