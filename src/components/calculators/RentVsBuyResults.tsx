import React from 'react'
import type { RentVsBuyResults as RentVsBuyResult } from '../../../backend/calculations/rentVsBuy'

type RentVsBuyResultsProps = {
  result: RentVsBuyResult | null
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

export default function RentVsBuyResults({ result }: RentVsBuyResultsProps) {
  const savingsValue = result ? currencyFormatter.format(Math.abs(result.rentVsBuyDifference)) : '—'
  const heading = result ? (result.recommendedOption === 'buy' ? 'Buying Saves You' : 'Renting Saves You') : 'Comparison Result'

  return (
    <section className="rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
      <div className="text-center">
        <p className="text-[16px] font-medium text-sub">{heading}</p>
        <p className="mt-3 text-[40px] font-semibold leading-none text-heading">{savingsValue}</p>
        <p className="mt-3 text-[16px] leading-[25.6px] text-body">Over the selected time period.</p>
      </div>

      <div className="my-8 h-px w-full bg-[#a7f3d0]" />

      {result ? (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard label="Total Cost of Buying" value={currencyFormatter.format(result.totalBuyCost)} />
            <MetricCard label="Total Cost of Renting" value={currencyFormatter.format(result.totalRentCost)} />
          </div>

          <div>
            <h3 className="text-[19px] font-semibold text-heading">Breakdown</h3>
            <div className="mt-4 space-y-4 text-[19px]">
              <Row label="Final Home Value" value={currencyFormatter.format(result.homeValueEnd)} />
              <Row label="Equity After Sale" value={currencyFormatter.format(result.equityAfterSale)} />
              <Row label="Remaining Mortgage Balance" value={currencyFormatter.format(result.remainingMortgageBalance)} />
              <Row label="Investment Value of Down Payment" value={currencyFormatter.format(result.investmentValue)} />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-[16px] leading-[25.6px] text-sub">
          Enter your assumptions to compare the long-term financial impact of renting and buying.
        </div>
      )}
    </section>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-cardBorder bg-white px-4 py-4">
      <p className="text-[16px] font-medium text-sub">{label}</p>
      <p className="mt-2 text-[28px] font-medium leading-none text-heading">{value}</p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="font-medium text-body">{label}</p>
      <p className="text-right font-semibold text-heading">{value}</p>
    </div>
  )
}
