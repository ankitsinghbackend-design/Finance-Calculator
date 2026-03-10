import React from 'react'
import { type HouseAffordabilityResults } from '../../../backend/calculations/houseAffordability'

type HouseAffordabilityResultsProps = {
  result: HouseAffordabilityResults | null
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

const formatPercent = (value: number): string => `${(value * 100).toFixed(0)}%`

export default function HouseAffordabilityResults({ result }: HouseAffordabilityResultsProps) {
  const propertyTaxMonthly = result ? result.propertyTaxAnnual / 12 : 0
  const insuranceMonthly = result ? result.insuranceAnnual / 12 : 0
  const hoaMonthly = result ? result.hoaAnnual / 12 : 0

  return (
    <div className="bg-[#f9fafb] border border-cardBorder rounded-[16px] px-6 py-10 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)] min-h-[408px]">
      <div className="text-center">
        <p className="text-[16px] font-medium text-sub">You can afford a house up to</p>
        <p className="text-[40px] leading-none font-semibold text-heading mt-3">
          {result ? formatCurrency(result.housePrice) : '—'}
        </p>
      </div>

      <div className="h-px bg-[#a7f3d0] my-8" />

      {result ? (
        <div className="space-y-7">
          <div>
            <h3 className="text-[19px] font-semibold text-heading text-center">Loan Summary</h3>
            <div className="mt-4 space-y-3 text-[16px] leading-[1.6]">
              {[
                ['Loan Amount', formatCurrency(result.loanAmount)],
                ['Home Price', formatCurrency(result.housePrice)],
                ['Down Payment', formatCurrency(result.downPayment)],
                ['Estimated Closing Cost (3%)', formatCurrency(result.closingCost)]
              ].map(([label, value], index) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <p className={index < 2 ? 'text-heading font-semibold' : 'text-body font-medium'}>{label}</p>
                  <p className={index < 2 ? 'text-heading font-semibold text-right' : 'text-sub font-semibold text-right'}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[19px] font-semibold text-heading text-center">DTI Metrics</h3>
            <div className="mt-4 space-y-3 text-[16px] leading-[1.6]">
              {[
                ['Front-end DTI', formatPercent(result.frontEndDTI)],
                ['Back-end DTI', formatPercent(result.backEndDTI)]
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <p className="text-body font-medium">{label}</p>
                  <p className="text-sub font-semibold text-right">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[19px] font-semibold text-heading text-center">Monthly Housing Cost</h3>
            <div className="mt-4 space-y-3 text-[16px] leading-[1.6]">
              {[
                ['Mortgage Payment', formatCurrency(result.mortgagePayment)],
                ['Property Tax', formatCurrency(propertyTaxMonthly)],
                ['Insurance', formatCurrency(insuranceMonthly)],
                ['HOA Fee', formatCurrency(hoaMonthly)],
                ['Total Monthly Cost', formatCurrency(result.totalMonthlyCost)]
              ].map(([label, value], index, items) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <p className={index === items.length - 1 ? 'text-heading font-semibold' : 'text-body font-medium'}>{label}</p>
                  <p className={index === items.length - 1 ? 'text-heading font-semibold text-right' : 'text-sub font-semibold text-right'}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-[260px] flex items-center justify-center text-center text-sub text-[16px] leading-[25.6px] px-6">
          Enter your income, debts, and housing cost assumptions to estimate the maximum house price and loan amount you can comfortably afford.
        </div>
      )}
    </div>
  )
}
