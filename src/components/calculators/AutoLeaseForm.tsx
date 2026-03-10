import React, { FormEvent } from 'react'

export type AutoLeaseFormState = {
  autoPrice: string
  leaseTermMonths: string
  interestRate: string
  cashIncentives: string
  downPayment: string
  tradeInValue: string
  salesTaxRate: string
  residualValue: string
}

type AutoLeaseFormProps = {
  form: AutoLeaseFormState
  onChange: (field: keyof AutoLeaseFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

const fields: Array<{ key: keyof AutoLeaseFormState; label: string; placeholder: string }> = [
  { key: 'autoPrice', label: 'Auto Price', placeholder: '$' },
  { key: 'leaseTermMonths', label: 'Lease Term', placeholder: 'Months' },
  { key: 'interestRate', label: 'Interest Rate', placeholder: '%' },
  { key: 'cashIncentives', label: 'Cash Incentives', placeholder: '$' },
  { key: 'downPayment', label: 'Down Payment', placeholder: '$' },
  { key: 'tradeInValue', label: 'Trade-in Value', placeholder: '$' },
  { key: 'salesTaxRate', label: 'Sales Tax', placeholder: '%' },
  { key: 'residualValue', label: 'Residual Value', placeholder: '$' }
]

export default function AutoLeaseForm({
  form,
  onChange,
  onSubmit,
  onClear,
  isCalculating,
  error
}: AutoLeaseFormProps) {
  return (
    <form onSubmit={onSubmit} className="w-full rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5 backdrop-blur-[10.5px]">
      <h2 className="text-[19px] font-semibold text-heading">Total Price</h2>

      <div className="mt-5 grid grid-cols-1 gap-x-2 gap-y-5 sm:grid-cols-2">
        {fields.map((field) => (
          <Field
            key={field.key}
            label={field.label}
            value={form[field.key]}
            placeholder={field.placeholder}
            onChange={(value) => onChange(field.key, value)}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-[15px]">
          <button
            type="submit"
            disabled={isCalculating}
            className="h-[42px] rounded-lg bg-primary text-[16px] font-medium text-white shadow-card"
          >
            {isCalculating ? 'Calculating...' : 'Calculate'}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="h-[42px] rounded-lg border border-[#e1e6ef] bg-white text-[16px] font-medium text-[#1d2433] shadow-card"
          >
            Clear
          </button>
        </div>

        {error ? (
          <p className="text-sm text-red-600" role="status" aria-live="polite">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  )
}

type FieldProps = {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}

function Field({ label, value, placeholder, onChange }: FieldProps) {
  return (
    <div className="min-w-0">
      <p className="text-[16px] font-medium text-sub">{label}</p>
      <input
        type="number"
        min="0"
        step="any"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub"
      />
    </div>
  )
}