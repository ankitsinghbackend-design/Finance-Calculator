import React from 'react'
import type { AnnuityResults as AnnuityResult } from '../../../backend/calculations/annuityCalc'

type AnnuityResultsProps = {
  result: AnnuityResult | null
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

export default function AnnuityResults({ result }: AnnuityResultsProps) {
  if (!result) {
    return (
      <section className="rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
        <p className="text-[16px] leading-[25.6px] text-body">
          Estimate how your annuity grows over time using an opening balance, annual additions, monthly additions, and a fixed growth rate.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
      <div className="flex flex-col items-center gap-[10px] text-center">
        <p className="text-[16px] font-medium text-sub">Total Monthly Payment</p>
        <p className="text-[40px] font-semibold leading-none text-heading">{currencyFormatter.format(result.totalValue)}</p>
      </div>

      <div className="my-10 h-px w-full bg-[#a7f3d0]" />

      <div className="w-full text-center">
        <p className="text-[19px] font-semibold text-heading">Amortization</p>
      </div>

      <div className="mt-6 space-y-4">
        <ResultRow label={`Total of ${result.periodMonths} monthly payments`} value={currencyFormatter.format(result.totalValue)} />
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
