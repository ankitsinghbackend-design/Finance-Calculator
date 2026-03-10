import React from 'react'
import { type AutoLeaseResults as AutoLeaseResult } from '../../../backend/calculations/autoLease'

type AutoLeaseResultsProps = {
  result: AutoLeaseResult | null
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

export default function AutoLeaseResults({ result }: AutoLeaseResultsProps) {
  const primaryValue = result ? currencyFormatter.format(result.totalMonthlyPayment) : '—'

  return (
    <section className="rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
      <div className="text-center">
        <p className="text-[16px] font-medium text-sub">Total Monthly Payment</p>
        <p className="mt-3 text-[40px] font-semibold leading-none text-heading">{primaryValue}</p>
      </div>

      <div className="my-8 h-px w-full bg-[#a7f3d0]" />

      {result ? (
        <>
          <div className="flex items-center justify-center">
            <h3 className="text-[19px] font-semibold text-heading">Lease Summary</h3>
          </div>

          <div className="mt-8 space-y-4 text-[19px]">
            <Row label={`Total of ${result.leaseTermMonths} monthly payments`} value={currencyFormatter.format(result.totalLeasePayments)} strong />
            <Row label="Total finance cost" value={currencyFormatter.format(result.totalFinanceCost)} strong />
            <Row label="Monthly sales tax" value={currencyFormatter.format(result.monthlySalesTax)} />
            <Row label="Adjusted capitalized cost" value={currencyFormatter.format(result.adjustedCapitalizedCost)} />
          </div>
        </>
      ) : (
        <div className="px-6 text-center text-[16px] leading-[25.6px] text-sub">
          Enter your lease details to estimate the monthly payment, total payments, and finance cost.
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
      <p className="text-right font-semibold text-heading">{value}</p>
    </div>
  )
}