import React, { FormEvent } from 'react'

export type MortgageAprFormState = {
  houseValue: string
  downPaymentPercent: string
  loanTermMonths: string
  nominalRate: string
  loanFeeYear: string
  loansFeesMonthly: string
  points: string
  pmiInsurance: string
}

type MortgageAprFormProps = {
  form: MortgageAprFormState
  onChange: (field: keyof MortgageAprFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

const fields: Array<{ key: keyof MortgageAprFormState; label: string; placeholder: string }> = [
  { key: 'houseValue', label: 'House Value', placeholder: '$0' },
  { key: 'downPaymentPercent', label: 'Down Payment (%)', placeholder: '0.00' },
  { key: 'loanTermMonths', label: 'Loan Term (Months)', placeholder: '360' },
  { key: 'nominalRate', label: 'Nominal Rate (%)', placeholder: '0.00' },
  { key: 'loanFeeYear', label: 'Loan Fees / Year', placeholder: '$0' },
  { key: 'loansFeesMonthly', label: 'Loan Fees / Month', placeholder: '$0' },
  { key: 'points', label: 'Points (%)', placeholder: '0.00' },
  { key: 'pmiInsurance', label: 'PMI / Year', placeholder: '$0' }
]

export default function MortgageAprForm({ form, onChange, onSubmit, onClear, isCalculating, error }: MortgageAprFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5">
      <h2 className="text-[19px] font-semibold text-heading">Mortgage APR Inputs</h2>

      <div className="mt-4 grid grid-cols-1 gap-[10px] sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.key}>
            <p className="text-[16px] font-medium text-sub">{field.label}</p>
            <input
              type="number"
              min="0"
              step="any"
              value={form[field.key]}
              onChange={(event) => onChange(field.key, event.target.value)}
              placeholder={field.placeholder}
              className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-white px-3 text-[16px] font-medium text-sub"
            />
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
