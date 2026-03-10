import React from 'react'
import { type RepaymentMode, type RepaymentResults } from '../../../backend/calculations/repayment'

type RepaymentCalculatorResultsProps = {
  mode: RepaymentMode
  result: RepaymentResults | null
  loanTermMonths: number | null
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

const formatPayoffTime = (months: number | null): string => {
  if (months == null) {
    return '—'
  }

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`
  }

  if (remainingMonths === 0) {
    return `${years} year${years === 1 ? '' : 's'}`
  }

  return `${years} year${years === 1 ? '' : 's'} ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`
}

export default function RepaymentCalculatorResults({ mode, result, loanTermMonths }: RepaymentCalculatorResultsProps) {
  const primaryLabel = mode === 'monthly-payment' ? 'Monthly Payment' : 'Loan Payoff Time'
  const primaryValue =
    !result
      ? '—'
      : mode === 'monthly-payment'
        ? result.monthlyPayment == null
          ? '—'
          : formatCurrency(result.monthlyPayment)
        : formatPayoffTime(result.payoffMonths)

  return (
    <div className="bg-[#f9fafb] border border-cardBorder rounded-[16px] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)] min-h-[310px]">
      <div className="text-center">
        <p className="text-[16px] font-medium text-sub">{primaryLabel}</p>
        <p className="text-[40px] leading-none font-semibold text-heading mt-3">{primaryValue}</p>
      </div>

      <div className="h-px bg-[#a7f3d0] my-8" />

      {result ? (
        <div className="mt-6 space-y-4 text-[19px]">
          {mode === 'monthly-payment' ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <p className="text-heading font-semibold">Loan Balance</p>
                <p className="text-heading font-semibold">{formatCurrency(result.loanBalance)}</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-body font-medium">Interest Rate</p>
                <p className="text-sub font-semibold">{result.interestRate.toFixed(2)}%</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-body font-medium">Loan Term</p>
                <p className="text-sub font-semibold">{loanTermMonths ?? 0} months</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-body font-medium">Total Payments</p>
                <p className="text-sub font-semibold">{formatCurrency(result.totalPayments ?? 0)}</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-heading font-semibold">Total Interest</p>
                <p className="text-heading font-semibold">{formatCurrency(result.totalInterest ?? 0)}</p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4">
                <p className="text-heading font-semibold">Monthly Payment</p>
                <p className="text-heading font-semibold">{formatCurrency(result.monthlyPayment ?? 0)}</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-body font-medium">Total Payments</p>
                <p className="text-sub font-semibold">{formatCurrency(result.totalPayments ?? 0)}</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-heading font-semibold">Total Interest</p>
                <p className="text-heading font-semibold">{formatCurrency(result.totalInterest ?? 0)}</p>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="mt-6 min-h-[120px] flex items-center justify-center text-center text-sub text-[16px] leading-[25.6px] px-6">
          Choose a repayment mode and enter your loan inputs to estimate the monthly payment or the payoff time.
        </div>
      )}
    </div>
  )
}
