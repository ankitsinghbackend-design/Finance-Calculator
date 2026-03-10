import React from 'react'
import type { CashBackComparisonResults as CashBackComparisonResult } from '../../../backend/calculations/cashBackComparison'

type CashBackComparisonResultsProps = {
  result: CashBackComparisonResult | null
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

const formatCurrency = (value: number): string => currencyFormatter.format(value)

export default function CashBackComparisonResults({ result }: CashBackComparisonResultsProps) {
  if (!result) {
    return (
      <section className="max-h-[760px] overflow-y-auto rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
        <p className="text-[16px] leading-[25.6px] text-body">
          Compare the rebate and promotional financing offer to see which option gives you the lower monthly payment and lower total cost.
        </p>
      </section>
    )
  }

  return (
    <section className="max-h-[760px] overflow-y-auto rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
      <div className="flex flex-col items-center gap-[10px] text-center">
        <p className="text-[16px] font-medium text-sub">Results</p>
        <p className="text-[40px] font-semibold leading-none text-heading">{formatCurrency(result.monthlySavings)}</p>
        <p className="text-[16px] leading-[25.6px] text-body">{result.recommendedOffer} is the lower total-cost offer.</p>
      </div>

      <div className="my-8 h-px w-full bg-[#a7f3d0]" />

      <ScenarioSection title="With Cash Back Offer" scenario={result.cashBackScenario} loanTerm={result.loanTerm} />
      <ScenarioSection title="With Low Interest Rate Offer" scenario={result.lowInterestScenario} loanTerm={result.loanTerm} className="mt-8" />
    </section>
  )
}

function ScenarioSection({
  title,
  scenario,
  loanTerm,
  className = ''
}: {
  title: string
  scenario: CashBackComparisonResult['cashBackScenario']
  loanTerm: number
  className?: string
}) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-4">
        <p className="flex-1 text-[19px] font-semibold text-heading">{title}</p>
      </div>

      <div className="mt-4 space-y-3">
        <SummaryRow label="Total Loan Amount" value={formatCurrency(scenario.loanAmount)} />
        <SummaryRow label="Sale Tax" value={formatCurrency(scenario.salesTax)} />
        <SummaryRow label="Upfront Payment" value={formatCurrency(scenario.upfront)} />
        <SummaryRow label="Monthly Pay" value={formatCurrency(scenario.monthly)} emphasize />
        <SummaryRow label={`Total of ${loanTerm} Loan Payments`} value={formatCurrency(scenario.totalPayments)} />
        <SummaryRow label="Total Loan Interest" value={formatCurrency(scenario.totalInterest)} />
        <SummaryRow label="Total Cost (price, interest, tax, fees)" value={formatCurrency(scenario.totalCost)} />
      </div>
    </div>
  )
}

function SummaryRow({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className={`flex-1 text-[16px] ${emphasize ? 'font-semibold text-heading' : 'font-medium text-body'}`}>{label}</p>
      <p className={`text-right text-[16px] ${emphasize ? 'font-semibold text-heading' : 'font-semibold text-sub'}`}>{value}</p>
    </div>
  )
}
