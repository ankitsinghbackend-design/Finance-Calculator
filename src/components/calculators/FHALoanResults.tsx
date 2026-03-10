import React from 'react'
import type { FHALoanInputs, FHALoanResults as FHALoanResult } from '../../../backend/calculations/fhaLoan'
import FHALoanChart from './FHALoanChart'

type FHALoanResultsProps = {
  result: FHALoanResult | null
  inputs: FHALoanInputs
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

const formatCurrency = (value: number): string => currencyFormatter.format(value)

export default function FHALoanResults({ result, inputs }: FHALoanResultsProps) {
  if (!result) {
    return (
      <section className="rounded-[6px] border border-cardBorder bg-[#f9fafb] p-6 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
        <p className="text-[16px] leading-[25.6px] text-body">Enter your FHA loan details to estimate monthly payments, mortgage insurance, and lifetime cost.</p>
      </section>
    )
  }

  const downPaymentAmount = inputs.homePrice * (inputs.downPaymentPercent / 100)
  const monthlyOther = inputs.hoaFee / 12 + inputs.otherCosts / 12 + inputs.pmiInsurance / 12
  const mipMonths = Math.min(inputs.loanTermMonths, Math.round(inputs.mipDurationYears * 12))
  const propertyTaxTotal = result.monthlyTax * inputs.loanTermMonths
  const insuranceTotal = result.monthlyInsurance * inputs.loanTermMonths
  const mipTotal = result.monthlyMIP * mipMonths
  const otherTotal = monthlyOther * inputs.loanTermMonths
  const averageMonthlyOutOfPocket = result.totalOutOfPocket / inputs.loanTermMonths

  const segments = [
    { label: 'P&I', value: result.monthlyPI, color: '#4472c4' },
    { label: 'Property Taxes', value: result.monthlyTax, color: '#c00000' },
    { label: 'Annual MIP', value: result.monthlyMIP, color: '#00b0f0' },
    { label: 'Home Insurance', value: result.monthlyInsurance, color: '#cc0099' },
    { label: 'Other Costs', value: monthlyOther, color: '#7030a0' }
  ]

  return (
    <section className="grid gap-4">
      <div className="overflow-hidden rounded-[6px] bg-[#f9fafb] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between bg-primary px-3 py-2.5 text-white">
          <p className="text-[24px] font-medium leading-8">
            Monthly Pay: <span className="font-bold">{formatCurrency(result.monthlyPayment)}</span>
          </p>
          <div className="flex flex-col items-center opacity-90">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M7 3.75h8.5L20.25 8.5v11.75a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.75a1 1 0 0 1 1-1Z" />
              <path d="M9 3.75v5h6v-5" />
              <path d="M9 17.25h6" />
            </svg>
            <span className="text-[10px] leading-[10px]">save</span>
          </div>
        </div>

        <div className="p-4">
          <div className="border-b border-black pb-2">
            <div className="grid grid-cols-[1fr_110px] text-right text-[14px] font-bold text-black">
              <span />
              <span>Monthly</span>
            </div>
            <div className="mt-1 grid grid-cols-[1fr_110px] text-right text-[14px] font-bold text-black">
              <span />
              <span>Total</span>
            </div>
          </div>

          <div className="mt-1 grid gap-0.5 text-[14px] text-black">
            <ResultRow label="Mortgage Payment (P&I)" monthly={result.monthlyPI} total={result.totalPaymentsSum} emphasized shaded />
            <ResultRow label="Property Tax" monthly={result.monthlyTax} total={propertyTaxTotal} />
            <ResultRow label="Home Insurance" monthly={result.monthlyInsurance} total={insuranceTotal} />
            <ResultRow label="Annual MIP" monthly={result.monthlyMIP} total={mipTotal} />
            <ResultRow label="Other Costs" monthly={monthlyOther} total={otherTotal} />
            <ResultRow label="Total Out-of-Pocket" monthly={averageMonthlyOutOfPocket} total={result.totalOutOfPocket} emphasized shadedDark />
          </div>
        </div>
      </div>

      <div className="rounded-[6px] bg-[#f9fafb] p-4 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
        <FHALoanChart segments={segments} />
      </div>

      <div className="overflow-hidden rounded-[6px] border border-cardBorder bg-[#f2f2f2] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
        <FooterRow label="House Price" value={formatCurrency(inputs.homePrice)} header />
        <FooterRow label="Loan Amount with Upfront MIP" value={formatCurrency(result.totalLoanAmount)} />
        <FooterRow label="Down Payment" value={formatCurrency(downPaymentAmount)} />
        <FooterRow label="Upfront MIP" value={formatCurrency(result.upfrontMIP)} />
        <FooterRow label={`Total of ${inputs.loanTermMonths} Mortgage Payments`} value={formatCurrency(result.totalPaymentsSum)} />
        <FooterRow label="Total Interest" value={formatCurrency(result.totalInterest)} />
        <FooterRow label="Mortgage Payoff Date" value={result.payoffDate} last />
      </div>
    </section>
  )
}

function ResultRow({
  label,
  monthly,
  total,
  emphasized = false,
  shaded = false,
  shadedDark = false
}: {
  label: string
  monthly: number
  total: number
  emphasized?: boolean
  shaded?: boolean
  shadedDark?: boolean
}) {
  const rowClassName = shadedDark ? 'bg-[#d9d9d9] border-t border-[#99a1af]' : shaded ? 'bg-[#f2f2f2]' : 'bg-transparent'
  const textClassName = emphasized ? 'font-bold' : 'font-normal'

  return (
    <div className={`grid grid-cols-[1fr_110px] gap-4 px-1 py-2 ${rowClassName}`}>
      <div>
        <p className={`${textClassName} leading-5`}>{label}</p>
        <p className={`${textClassName} mt-1 leading-5`}>{formatCurrency(monthly)}</p>
        <p className={`${textClassName} mt-1 leading-5`}>{formatCurrency(total)}</p>
      </div>
      <div className="grid grid-rows-3 items-start text-right">
        <span className="invisible">.</span>
        <span className={textClassName}>{formatCurrency(monthly)}</span>
        <span className={textClassName}>{formatCurrency(total)}</span>
      </div>
    </div>
  )
}

function FooterRow({ label, value, header = false, last = false }: { label: string; value: string; header?: boolean; last?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 px-3 py-[7px] text-[14px] ${header ? 'bg-[#e0e0e0] font-bold' : ''} ${!last ? 'border-b border-white' : ''}`}>
      <span className={header ? 'font-bold text-black' : 'text-black'}>{label}</span>
      <span className={header ? 'font-bold text-black' : 'text-black'}>{value}</span>
    </div>
  )
}
