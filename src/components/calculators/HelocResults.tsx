import React from 'react'
import type { HelocResults as HelocResult } from '../../../backend/calculations/heloc'

type HelocResultsProps = {
  result: HelocResult | null
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

export default function HelocResults({ result }: HelocResultsProps) {
  return (
    <section className="flex flex-col items-center gap-[40px] rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
      <div className="flex flex-col items-center gap-[10px] text-center">
        <p className="text-[16px] font-medium text-sub">Total Monthly Payment</p>
        <p className="text-[40px] font-semibold leading-none text-heading">
          {result ? currencyFormatter.format(result.monthlyPayment) : '—'}
        </p>
      </div>

      <div className="h-px w-full bg-[#a7f3d0]" />

      <div className="w-full">
        <p className="text-[19px] font-medium text-heading">HELOC Summary</p>
      </div>

      {result ? (
        <div className="w-full space-y-[10px] text-[19px]">
          <Row label={`Total of ${result.repaymentMonths} loan payments`} value={currencyFormatter.format(result.totalLoanPayments)} />
          <Row label="Total interest" value={currencyFormatter.format(result.totalInterest)} />
          <Row label="Effective loan amount" value={currencyFormatter.format(result.effectiveLoanAmount)} />
        </div>
      ) : (
        <div className="w-full text-center text-[16px] leading-[25.6px] text-body">
          Calculate to estimate your HELOC payment, repayment summary, and total interest.
        </div>
      )}
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="font-semibold text-body">{label}</p>
      <p className="text-right font-semibold text-sub">{value}</p>
    </div>
  )
}
