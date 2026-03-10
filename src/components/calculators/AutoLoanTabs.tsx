import React from 'react'
import { AUTO_LOAN_TABS, type AutoLoanMode } from './AutoLoanForm'

type AutoLoanTabsProps = {
  activeTab: AutoLoanMode
  onChange: (mode: AutoLoanMode) => void
}

export default function AutoLoanTabs({ activeTab, onChange }: AutoLoanTabsProps) {
  return (
    <div className="inline-flex w-full rounded-xl border border-cardBorder bg-white p-1 shadow-card">
      {AUTO_LOAN_TABS.map((tab) => {
        const isActive = tab.id === activeTab

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={[
              'h-[42px] flex-1 rounded-[10px] text-[16px] font-medium transition-colors',
              isActive ? 'bg-primary text-white' : 'text-sub hover:text-heading'
            ].join(' ')}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
