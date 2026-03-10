import React from 'react'
import { type InterestRateResults } from '../../../backend/calculations/interestRate'

type InterestRateResultsProps = {
  result: InterestRateResults | null
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

const percentFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export default function InterestRateResults({ result }: InterestRateResultsProps) {
  return (
    <div className="bg-[#f9fafb] border border-cardBorder rounded-[16px] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)] min-h-[310px] flex flex-col gap-10 items-center">
      <div className="text-center flex flex-col gap-[10px]">
        <p className="text-[16px] font-medium text-sub">Total Monthly Payment</p>
        <p className="text-[40px] leading-none font-semibold text-heading">
          {result ? currencyFormatter.format(result.monthlyPayment) : '—'}
        </p>
        <p className="text-[16px] text-sub font-medium">
          {result
            ? `APR ${percentFormatter.format(result.annualInterestRate)}% • Monthly ${percentFormatter.format(result.monthlyInterestRate)}%`
            : 'Calculate to estimate the implied annual and monthly interest rate.'}
        </p>
      </div>

      <div className="h-px bg-[#a7f3d0] w-full" />

      <div className="w-full text-center">
        <h3 className="text-[19px] font-semibold text-heading">Amortization</h3>
      </div>

      {result ? (
        <div className="flex flex-col gap-4 w-full text-[19px]">
          <div className="flex items-center justify-between gap-4">
            <p className="text-heading font-semibold">Total of {result.loanTermYears * 12} monthly payments</p>
            <p className="text-heading font-semibold">{currencyFormatter.format(result.totalPayments)}</p>
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-heading font-semibold">Total interest</p>
            <p className="text-heading font-semibold">{currencyFormatter.format(result.totalInterest)}</p>
          </div>
        </div>
      ) : (
        <div className="w-full text-center text-sub text-[16px] leading-[25.6px] px-6">
          Enter the loan amount, term, and monthly payment to solve for the implied interest rate.
        </div>
      )}
    </div>
  )
}
