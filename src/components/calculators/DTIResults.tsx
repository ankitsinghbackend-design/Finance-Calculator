import React from 'react'
import type { DebtToIncomeResults } from '../../../backend/calculations/debtToIncome'

type DTIResultsProps = {
  result: DebtToIncomeResults | null
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
})

/**
 * DTI result strip — matches Figma node 162:928.
 *
 * Dollar labels sit above the three-color strip.
 * The strip uses CSS Grid so green / yellow / red always get equal width.
 */
export default function DTIResults({ result }: DTIResultsProps) {
  return (
    <div className="w-full">
      {/* ── Dollar labels above the strip (Figma 162:936 / 162:937) ── */}
      <div className="mb-1 flex items-end justify-between px-[85px]">
        <p className="whitespace-nowrap text-[19px] font-semibold text-sub">
          {result ? currency.format(result.totalMonthlyIncome) : '—'}
        </p>
        <p className="whitespace-nowrap text-[19px] font-semibold text-sub">
          {result ? currency.format(result.totalMonthlyDebt) : '—'}
        </p>
      </div>

      {/* ── Three-color strip (Figma 162:929) ── */}
      <div className="w-full overflow-hidden bg-white px-[8px] py-[6px]">
        <div className="grid w-full grid-cols-3">
          <div className="flex items-center justify-center bg-[#22c55e] py-[6px]">
            <span className="text-[16px] font-medium text-black">Safe</span>
          </div>
          <div className="flex items-center justify-center bg-[#ffd633] py-[6px]">
            <span className="text-[16px] font-medium text-black">Acceptable</span>
          </div>
          <div className="flex items-center justify-center bg-[#ff7171] py-[6px]">
            <span className="text-[16px] font-medium text-black">Aggressive</span>
          </div>
        </div>
      </div>
    </div>
  )
}
