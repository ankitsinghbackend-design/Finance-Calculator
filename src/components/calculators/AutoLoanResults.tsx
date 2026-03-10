import React from 'react'
import { type AutoLoanMode, type AutoLoanResult } from './AutoLoanForm'

type AutoLoanResultsProps = {
  mode: AutoLoanMode
  result: AutoLoanResult | null
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export default function AutoLoanResults({ mode, result }: AutoLoanResultsProps) {
  const monthlyBreakdown = result
    ? [
        ['Vehicle Price', formatCurrency(result.vehiclePrice)],
        ['Loan Amount', formatCurrency(result.loanAmount)],
        ['Sales Tax', formatCurrency(result.salesTax)],
        ['Total Interest', formatCurrency(result.totalInterest)],
        ['Total Cost', formatCurrency(result.totalCost)],
        ['Loan Term', `${result.loanTermMonths} months`],
        ['Interest Rate', `${result.interestRate.toFixed(2)}%`]
      ]
    : []

  const vehicleBreakdown = result
    ? [
        ['Loan Amount', formatCurrency(result.loanAmount)],
        ['Down Payment', formatCurrency(result.downPayment)],
        ['Trade-in Credit', formatCurrency(result.tradeInCredit)],
        ['Sales Tax', formatCurrency(result.salesTax)],
        ['Total Cost', formatCurrency(result.totalCost)]
      ]
    : []

  const primaryLabel = mode === 'monthly-payment' ? 'Monthly Payment' : 'Maximum Vehicle Price'
  const primaryValue =
    !result ? '—' : mode === 'monthly-payment' ? formatCurrency(result.monthlyPayment) : formatCurrency(result.maximumVehiclePrice)
  const breakdown = mode === 'monthly-payment' ? monthlyBreakdown : vehicleBreakdown

  return (
    <div className="bg-[#f9fafb] border border-cardBorder rounded-[16px] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)] flex flex-col gap-10 items-center min-h-[452px]">
      <div className="text-center flex flex-col gap-[10px]">
        <p className="text-[16px] font-medium text-sub">{primaryLabel}</p>
        <p className="text-[40px] leading-none font-semibold text-heading">{primaryValue}</p>
      </div>

      <div className="h-px bg-[#a7f3d0] w-full" />

      <div className="w-full text-center">
        <h3 className="text-[19px] font-semibold text-heading">
          {mode === 'monthly-payment' ? 'Auto Loan Summary' : 'Affordability Breakdown'}
        </h3>
      </div>

      {result ? (
        <div className="flex flex-col gap-4 w-full text-[19px]">
          {breakdown.map(([label, value], index) => {
            const isEmphasis = index === 0 || index === breakdown.length - 1

            return (
              <div key={label} className="flex items-center justify-between gap-4">
                <p className={isEmphasis ? 'text-heading font-semibold' : 'text-body font-medium'}>{label}</p>
                <p className={isEmphasis ? 'text-heading font-semibold text-right' : 'text-sub font-semibold text-right'}>{value}</p>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="w-full flex-1 flex items-center justify-center text-center text-sub text-[16px] leading-[25.6px] px-6">
          Click Calculate to view your {mode === 'monthly-payment' ? 'estimated monthly auto payment' : 'maximum affordable vehicle price'} and the complete purchase breakdown.
        </div>
      )}
    </div>
  )
}
