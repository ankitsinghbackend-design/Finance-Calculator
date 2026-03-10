import React from 'react'
import { type InvestmentMode } from '../../../backend/calculations/investment'

export const INVESTMENT_TABS: Array<{ id: InvestmentMode; label: string }> = [
  { id: 'end-amount', label: 'End Amount' },
  { id: 'additional-contribution', label: 'Additional Contribution' },
  { id: 'return-rate', label: 'Return Rate' },
  { id: 'starting-amount', label: 'Starting Amount' },
  { id: 'investment-length', label: 'Investment Length' }
]

type InvestmentTabsProps = {
  activeTab: InvestmentMode
  onChange: (tab: InvestmentMode) => void
}

export default function InvestmentTabs({ activeTab, onChange }: InvestmentTabsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 border-b border-cardBorder pb-3 md:grid-cols-5 md:gap-4">
      {INVESTMENT_TABS.map((tab) => {
        const isActive = tab.id === activeTab

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={[
              'text-left text-[16px] md:text-[19px] font-semibold leading-tight transition-colors',
              isActive ? 'text-heading' : 'text-sub hover:text-heading'
            ].join(' ')}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
