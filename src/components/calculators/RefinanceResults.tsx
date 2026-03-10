import React from 'react'
import type { RefinanceResults as RefinanceResult } from '../../../backend/calculations/refinance'

type RefinanceResultsProps = {
  result: RefinanceResult | null
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

const formatCurrency = (value: number): string => currencyFormatter.format(value)

const formatMonthsAsYearsAndMonths = (months: number): string => {
  if (!Number.isFinite(months)) {
    return 'Not recovered'
  }

  const roundedMonths = Math.max(0, Math.round(months))
  const years = Math.floor(roundedMonths / 12)
  const remainingMonths = roundedMonths % 12

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`
  }

  if (remainingMonths === 0) {
    return `${years} year${years === 1 ? '' : 's'}`
  }

  return `${years} year${years === 1 ? '' : 's'} and ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`
}

const formatLength = (months: number): string => {
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (remainingMonths === 0) {
    return `${years} years`
  }

  return `${years} years ${remainingMonths} months`
}

export default function RefinanceResults({ result }: RefinanceResultsProps) {
  if (!result) {
    return (
      <section className="rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-8 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
        <p className="text-[16px] leading-[25.6px] text-body">Enter your current mortgage and refinance terms to compare payments, interest, and break-even timing.</p>
      </section>
    )
  }

  const monthlySavings = result.currentLoan.monthlyPay - result.newLoan.monthlyPay
  const totalCurrentCost = result.currentLoan.totalPayments
  const totalNewCost = result.newLoan.totalPayments + result.newLoan.upfrontCost
  const totalLifetimeSavings = totalCurrentCost - totalNewCost

  return (
    <section className="rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-8 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
      <div className="flex flex-col items-center gap-[10px] text-center">
        <p className="text-[16px] font-medium text-sub">Total Monthly Payment</p>
        <p className="text-[40px] font-semibold leading-none text-heading">
          <span className="text-sub">$</span>
          <span> {result.totalMonthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </p>
      </div>

      <div className="my-8 h-px w-full bg-[#a7f3d0]" />

      <Section title="Current loan (remaining)" total={formatCurrency(result.currentLoan.totalPayments)}>
        <Row label="Principal/loan amount" value={formatCurrency(result.currentLoan.principal)} />
        <Row label="Monthly pay" value={formatCurrency(result.currentLoan.monthlyPay)} />
        <Row label="Length" value={formatLength(result.currentLoan.lengthMonths)} />
        <Row label="Interest rate/APR" value={`${result.currentLoan.interestRate.toFixed(2)}%`} />
        <Row label="Total monthly payments" value={formatCurrency(result.currentLoan.totalPayments)} />
        <Row label="Total interest" value={formatCurrency(result.currentLoan.totalInterest)} />
      </Section>

      <Section title="New loan" total={formatCurrency(result.newLoan.totalPayments)} className="mt-6">
        <Row label="Principal/loan amount" value={formatCurrency(result.newLoan.principal)} />
        <Row label="Monthly pay" value={formatCurrency(result.newLoan.monthlyPay)} />
        <Row label="Length" value={formatLength(result.newLoan.lengthMonths)} />
        <Row label="Interest rate/APR" value={`${result.newLoan.interestRate.toFixed(2)}%`} />
        <Row label="Total monthly payments" value={formatCurrency(result.newLoan.totalPayments)} />
        <Row label="Total interest" value={formatCurrency(result.newLoan.totalInterest)} />
        <Row label="Cost + points (upfront)" value={formatCurrency(result.newLoan.upfrontCost)} />
        <Row label="Time to recover cost/point" value={formatMonthsAsYearsAndMonths(result.newLoan.breakEvenMonths)} />
      </Section>

      <Section title="Total monthly cost on the house" total={formatCurrency(totalNewCost)} className="mt-6">
        <Row label="Current remaining total cost" value={formatCurrency(totalCurrentCost)} />
        <Row label="Refinance total cost" value={formatCurrency(totalNewCost)} />
        <Row label="Monthly savings" value={formatCurrency(monthlySavings)} />
        <Row label="Interest savings" value={formatCurrency(result.currentLoan.totalInterest - result.newLoan.totalInterest)} />
        <Row label="Lifetime savings after upfront cost" value={formatCurrency(totalLifetimeSavings)} />
        <Row label="Break-even" value={formatMonthsAsYearsAndMonths(result.newLoan.breakEvenMonths)} />
      </Section>
    </section>
  )
}

function Section({ title, total, className = '', children }: { title: string; total: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-4">
        <p className="flex-1 text-[19px] font-semibold text-black">{title}</p>
        <p className="text-[16px] leading-[25.6px] text-heading">{total}</p>
      </div>
      <div className="mt-2 space-y-2 text-[16px] leading-[25.6px]">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="flex-1 text-body">{label}</p>
      <p className="text-sub">{value}</p>
    </div>
  )
}
