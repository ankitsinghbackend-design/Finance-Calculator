import React, { FormEvent } from 'react'

export type DownPaymentFormState = {
  upfrontCashAvailable: string
  downPaymentAmount: string
  drawPeriod: string
  paymentPeriod: string
  loanTerm: string
  includingClosingCosts: boolean
}

type DownPaymentFormProps = {
  form: DownPaymentFormState
  onChange: <K extends keyof DownPaymentFormState>(field: K, value: DownPaymentFormState[K]) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

type FieldConfig = {
  key: keyof Pick<DownPaymentFormState, 'upfrontCashAvailable' | 'downPaymentAmount' | 'drawPeriod' | 'paymentPeriod' | 'loanTerm'>
  label: string
  placeholder: string
}

const topFields: FieldConfig[] = [
  { key: 'upfrontCashAvailable', label: 'Upfront Cash Available', placeholder: '$0' },
  { key: 'downPaymentAmount', label: 'Down Payment', placeholder: '$0' }
]

const termFields: FieldConfig[] = [
  { key: 'drawPeriod', label: 'Draw Period', placeholder: 'Months' },
  { key: 'paymentPeriod', label: 'Payment Period', placeholder: 'Years' },
  { key: 'loanTerm', label: 'Loan Term', placeholder: 'Years' }
]

export default function DownPaymentForm({ form, onChange, onSubmit, onClear, isCalculating, error }: DownPaymentFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5 backdrop-blur-[10.5px]">
      <p className="text-[19px] font-semibold text-heading">Use the Upfront Cash Available</p>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-2">
        {topFields.map((field) => (
          <Field key={field.key} field={field} value={form[field.key]} onChange={onChange} />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-[10px]">
        {termFields.map((field) => (
          <Field key={field.key} field={field} value={form[field.key]} onChange={onChange} />
        ))}
      </div>

      <label className="mt-5 flex cursor-pointer items-center gap-[6px]">
        <input
          type="checkbox"
          checked={form.includingClosingCosts}
          onChange={(event) => onChange('includingClosingCosts', event.target.checked)}
          className="h-5 w-5 rounded border border-cardBorder accent-primary"
        />
        <span className="text-[16px] font-medium text-sub">Including Closing Costs</span>
      </label>

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

function Field({
  field,
  value,
  onChange
}: {
  field: FieldConfig
  value: string
  onChange: <K extends keyof DownPaymentFormState>(field: K, value: DownPaymentFormState[K]) => void
}) {
  return (
    <div>
      <p className="text-[16px] font-medium text-sub">{field.label}</p>
      <input
        type="number"
        min="0"
        step="any"
        value={value}
        onChange={(event) => onChange(field.key, event.target.value)}
        placeholder={field.placeholder}
        className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub"
      />
    </div>
  )
}
