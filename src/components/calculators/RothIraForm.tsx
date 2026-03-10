import React, { FormEvent } from 'react'

export type RothIraFormState = {
  currentBalance: string
  annualContribution: string
  maximizeContributions: string
  contributionTiming: 'beginning' | 'end'
  expectedRateOfReturn: string
  currentAge: string
  retirementAge: string
  marginalTaxRate: string
}

type RothIraFormProps = {
  form: RothIraFormState
  onChange: <K extends keyof RothIraFormState>(field: K, value: RothIraFormState[K]) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

const topFields: Array<{ key: keyof Pick<RothIraFormState, 'currentBalance' | 'annualContribution' | 'maximizeContributions'>; label: string; placeholder: string }> = [
  { key: 'currentBalance', label: 'Current balance', placeholder: '$' },
  { key: 'annualContribution', label: 'Annual contribution', placeholder: '$' },
  { key: 'maximizeContributions', label: 'Maximize contributions?', placeholder: 'Year' }
]

const fieldRows: Array<Array<{ key: keyof Pick<RothIraFormState, 'expectedRateOfReturn' | 'currentAge' | 'retirementAge' | 'marginalTaxRate'>; label: string; placeholder: string }>> = [
  [
    { key: 'expectedRateOfReturn', label: 'Expected rate of return', placeholder: '%' },
    { key: 'currentAge', label: 'Current age', placeholder: 'Age' }
  ],
  [
    { key: 'retirementAge', label: 'Retirement age', placeholder: 'Age' },
    { key: 'marginalTaxRate', label: 'Marginal tax rate', placeholder: '%' }
  ]
]

export default function RothIraForm({ form, onChange, onSubmit, onClear, isCalculating, error }: RothIraFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5 backdrop-blur-[10.5px]">
      <p className="text-[19px] font-semibold text-heading">Basic info</p>

      <div className="mt-5 space-y-5">
        {topFields.map((field) => (
          <NumericField key={field.key} field={field} value={form[field.key]} onChange={onChange} />
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <p className="text-[16px] font-medium text-sub">Add at each period&apos;s</p>
        <div className="flex items-center gap-5">
          <label className="inline-flex items-center gap-2 text-[16px] font-medium text-sub">
            <input
              type="radio"
              name="contributionTiming"
              checked={form.contributionTiming === 'beginning'}
              onChange={() => onChange('contributionTiming', 'beginning')}
              className="h-4 w-4 border border-cardBorder text-primary focus:ring-primary"
            />
            Beginning
          </label>
          <label className="inline-flex items-center gap-2 text-[16px] font-medium text-sub">
            <input
              type="radio"
              name="contributionTiming"
              checked={form.contributionTiming === 'end'}
              onChange={() => onChange('contributionTiming', 'end')}
              className="h-4 w-4 border border-cardBorder text-primary focus:ring-primary"
            />
            End
          </label>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {fieldRows.map((row, index) => (
          <div key={index} className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-[10px]">
            {row.map((field) => (
              <NumericField key={field.key} field={field} value={form[field.key]} onChange={onChange} />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-5 flex gap-[15px]">
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

function NumericField<K extends keyof RothIraFormState>({
  field,
  value,
  onChange
}: {
  field: { key: K; label: string; placeholder: string }
  value: RothIraFormState[K]
  onChange: <T extends keyof RothIraFormState>(field: T, value: RothIraFormState[T]) => void
}) {
  return (
    <div>
      <p className="text-[16px] font-medium text-sub">{field.label}</p>
      <input
        type="number"
        min="0"
        step="any"
        value={value}
        onChange={(event) => onChange(field.key, event.target.value as RothIraFormState[K])}
        placeholder={field.placeholder}
        className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub placeholder:text-[#9ca3af]"
      />
    </div>
  )
}
