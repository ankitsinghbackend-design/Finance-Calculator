import React, { FormEvent } from 'react'
import type { CompoundingPeriod } from '../../../backend/calculations/aprLogic'

export type GeneralAprFormState = {
  loanAmount: string
  loanTermYears: string
  loanTermMonths: string
  nominalRate: string
  compoundingPeriod: CompoundingPeriod
  backPayYear: string
  loanedFeesMonthly: string
  upfrontFees: string
}

type GeneralAprFormProps = {
  form: GeneralAprFormState
  onChange: (field: keyof GeneralAprFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

const compoundingOptions: CompoundingPeriod[] = ['Monthly', 'Biweekly', 'Weekly', 'Quarterly', 'Semi-Annual', 'Annual']

const fields: Array<{ key: keyof GeneralAprFormState; label: string; placeholder?: string; type?: 'number' | 'select' }> = [
  { key: 'loanAmount', label: 'Loan Amount', placeholder: '$0' },
  { key: 'loanTermYears', label: 'Loan Term (Years)', placeholder: '0' },
  { key: 'loanTermMonths', label: 'Extra Months', placeholder: '0' },
  { key: 'nominalRate', label: 'Nominal Rate (%)', placeholder: '0.00' },
  { key: 'compoundingPeriod', label: 'Compounding Period', type: 'select' },
  { key: 'backPayYear', label: 'Back-End Fees / Year', placeholder: '$0' },
  { key: 'loanedFeesMonthly', label: 'Rolled Fees / Month', placeholder: '$0' },
  { key: 'upfrontFees', label: 'Upfront Fees', placeholder: '$0' }
]

export default function GeneralAprForm({ form, onChange, onSubmit, onClear, isCalculating, error }: GeneralAprFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5">
      <h2 className="text-[19px] font-semibold text-heading">General APR Inputs</h2>

      <div className="mt-4 grid grid-cols-1 gap-[10px] sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key}>
            <p className="text-[16px] font-medium text-sub">{field.label}</p>
            {field.type === 'select' ? (
              <select
                value={form.compoundingPeriod}
                onChange={(event) => onChange('compoundingPeriod', event.target.value)}
                className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-white px-3 text-[16px] font-medium text-sub"
              >
                {compoundingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                min="0"
                step="any"
                value={form[field.key]}
                onChange={(event) => onChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-white px-3 text-[16px] font-medium text-sub"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-[15px] flex gap-[15px]">
        <button
          type="submit"
          disabled={isCalculating}
          className="flex h-[42px] flex-1 items-center justify-center rounded-lg bg-primary text-[16px] font-medium text-white shadow-card"
        >
          {isCalculating ? 'Calculating...' : 'Calculate'}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="flex h-[42px] flex-1 items-center justify-center rounded-lg border border-[#e1e6ef] bg-white text-[16px] font-medium text-[#1d2433] shadow-card"
        >
          Clear
        </button>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-600" role="status" aria-live="polite">
          {error}
        </p>
      ) : null}
    </form>
  )
}
