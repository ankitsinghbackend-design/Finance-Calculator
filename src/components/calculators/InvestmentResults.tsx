import React from 'react'

export type InvestmentResult = {
  futureValue: number
  startingAmount: number
  additionalContribution: number
  returnRate: number
  investmentYears: number
  totalContributions: number
  totalInterestEarned: number
}

type InvestmentResultsProps = {
  result: InvestmentResult
  compoundFrequencyLabel: string
  contributionFrequencyLabel: string
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
})

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2
})

export default function InvestmentResults({
  result,
  compoundFrequencyLabel,
  contributionFrequencyLabel
}: InvestmentResultsProps) {
  return (
    <section className="rounded-[28px] border border-cardBorder bg-white p-5 shadow-card lg:p-6">
      <div className="rounded-[24px] bg-[#f4f8ff] p-5 text-center">
        <p className="text-[15px] font-medium text-sub">Investment Value</p>
        <p className="mt-2 text-[36px] font-semibold tracking-[-0.02em] text-primary sm:text-[44px]">
          {currencyFormatter.format(result.futureValue)}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <ResultRow label="Starting Investment" value={currencyFormatter.format(result.startingAmount)} />
        <ResultRow label="Total Contributions" value={currencyFormatter.format(result.totalContributions)} />
        <ResultRow label="Interest Earned" value={currencyFormatter.format(result.totalInterestEarned)} />
        <ResultRow label="Estimated Return Rate" value={`${numberFormatter.format(result.returnRate)}%`} />
        <ResultRow label="Investment Length" value={`${numberFormatter.format(result.investmentYears)} years`} />
        <ResultRow label="Recurring Contribution" value={currencyFormatter.format(result.additionalContribution)} />
        <ResultRow label="Contribution Frequency" value={contributionFrequencyLabel} />
        <ResultRow label="Compounding" value={compoundFrequencyLabel} />
      </div>
    </section>
  )
}

type ResultRowProps = {
  label: string
  value: string
}

function ResultRow({ label, value }: ResultRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#f9fafb] px-4 py-3">
      <span className="text-[15px] font-medium text-sub">{label}</span>
      <span className="text-right text-[15px] font-semibold text-[#1d2433]">{value}</span>
    </div>
  )
}
