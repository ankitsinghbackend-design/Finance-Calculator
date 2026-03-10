import React from 'react'
import { type LoanMode, type LoanResults } from '../../../backend/calculations/loan'

type LoanCalculatorResultsProps = {
  mode: LoanMode
  result: LoanResults | null
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

function formatPayoffTime(months: number | null): string {
  if (months == null) {
    return '—'
  }

  const years = Math.floor(months / 12)
  const remainderMonths = months % 12

  if (years === 0) {
    return `${remainderMonths} month${remainderMonths === 1 ? '' : 's'}`
  }

  if (remainderMonths === 0) {
    return `${years} year${years === 1 ? '' : 's'}`
  }

  return `${years} year${years === 1 ? '' : 's'} ${remainderMonths} month${remainderMonths === 1 ? '' : 's'}`
}

export default function LoanCalculatorResults({ mode, result }: LoanCalculatorResultsProps) {
  const primaryLabel = mode === 'fixed-term' ? 'Monthly Payment' : 'Loan Payoff Time'
  const primaryValue =
    !result
      ? '—'
      : mode === 'fixed-term'
        ? currencyFormatter.format(result.monthlyPayment)
        : formatPayoffTime(result.payoffMonths)

  return (
    <section className="rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
      <div className="text-center">
        <p className="text-[16px] font-medium text-sub">{primaryLabel}</p>
        <p className="mt-3 text-[40px] font-semibold leading-none text-heading">{primaryValue}</p>
      </div>

      <div className="my-8 h-px w-full bg-[#a7f3d0]" />

      {result ? (
        <div className="space-y-4 text-[19px]">
          <Row label="Loan Amount" value={currencyFormatter.format(result.loanAmount)} strong />
          <Row label="Interest Rate" value={`${result.interestRate.toFixed(2)}%`} />
          {mode === 'fixed-term' ? (
            <Row label="Loan Term" value={`${result.loanTermYears?.toFixed(2) ?? '0.00'} years`} />
          ) : (
            <Row label="Monthly Payment" value={currencyFormatter.format(result.monthlyPayment)} />
          )}
          <Row label="Total Payments" value={currencyFormatter.format(result.totalPayments)} />
          <Row label="Total Interest" value={currencyFormatter.format(result.totalInterest)} strong />
        </div>
      ) : (
        <div className="px-6 text-center text-[16px] leading-[25.6px] text-sub">
          Choose a mode and enter your loan details to calculate the monthly payment or payoff time.
        </div>
      )}
    </section>
  )
}

type RowProps = {
  label: string
  value: string
  strong?: boolean
}

function Row({ label, value, strong = false }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className={strong ? 'font-semibold text-heading' : 'font-medium text-body'}>{label}</p>
      <p className="font-semibold text-heading">{value}</p>
    </div>
  )
}
