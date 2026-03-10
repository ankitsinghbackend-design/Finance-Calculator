import React, { FormEvent } from 'react'

export type CashBackComparisonFormState = {
  cashBackAmount: string
  interestRateHigh: string
  interestRateLow: string
  autoPrice: string
  loanTerm: string
  downPayment: string
  tradeInValue: string
  stateName: string
  salesTaxRate: string
  fees: string
}

type CashBackComparisonFormProps = {
  form: CashBackComparisonFormState
  onChange: <K extends keyof CashBackComparisonFormState>(field: K, value: CashBackComparisonFormState[K]) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

type FieldConfig = {
  key: keyof CashBackComparisonFormState
  label: string
  placeholder: string
  type?: 'number' | 'text'
}

const cashBackFields: FieldConfig[] = [
  { key: 'cashBackAmount', label: 'Cash Back Amount', placeholder: '$0' },
  { key: 'interestRateHigh', label: 'Interest Rate (High)', placeholder: '%' }
]

const lowInterestFields: FieldConfig[] = [
  { key: 'interestRateLow', label: 'Interest Rate (Low)', placeholder: '%' }
]

const firstInfoRow: FieldConfig[] = [
  { key: 'autoPrice', label: 'Auto Price', placeholder: '$0' },
  { key: 'loanTerm', label: 'Loan Term', placeholder: 'Months' }
]

const secondInfoRow: FieldConfig[] = [
  { key: 'downPayment', label: 'Down Payment', placeholder: '$0' },
  { key: 'tradeInValue', label: 'Trade-in Value', placeholder: '$0' }
]

const thirdInfoRow: FieldConfig[] = [
  { key: 'stateName', label: 'Your State', placeholder: 'Optional', type: 'text' },
  { key: 'salesTaxRate', label: 'Sales Tax', placeholder: '%' }
]

const feeField: FieldConfig = {
  key: 'fees',
  label: 'Title, Registration and Other Fees',
  placeholder: '$0'
}

export default function CashBackComparisonForm({ form, onChange, onSubmit, onClear, isCalculating, error }: CashBackComparisonFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5 backdrop-blur-[10.5px]">
      <SectionTitle title="Cash Back Offer" />
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-2">
        {cashBackFields.map((field) => (
          <Field key={field.key} field={field} value={form[field.key]} onChange={onChange} />
        ))}
      </div>

      <SectionTitle title="Low Interest Rate Offer" className="mt-6" />
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-2">
        {lowInterestFields.map((field) => (
          <Field key={field.key} field={field} value={form[field.key]} onChange={onChange} />
        ))}
        <div className="hidden sm:block" aria-hidden />
      </div>

      <SectionTitle title="Other Information" className="mt-6" />
      <div className="mt-5 space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-2">
          {firstInfoRow.map((field) => (
            <Field key={field.key} field={field} value={form[field.key]} onChange={onChange} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-2">
          {secondInfoRow.map((field) => (
            <Field key={field.key} field={field} value={form[field.key]} onChange={onChange} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-2">
          {thirdInfoRow.map((field) => (
            <Field key={field.key} field={field} value={form[field.key]} onChange={onChange} />
          ))}
        </div>

        <Field field={feeField} value={form.fees} onChange={onChange} />
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

function SectionTitle({ title, className = '' }: { title: string; className?: string }) {
  return <p className={`text-[19px] font-semibold text-heading ${className}`.trim()}>{title}</p>
}

function Field({
  field,
  value,
  onChange
}: {
  field: FieldConfig
  value: string
  onChange: <K extends keyof CashBackComparisonFormState>(field: K, value: CashBackComparisonFormState[K]) => void
}) {
  const isText = field.type === 'text'

  return (
    <div>
      <p className="text-[16px] font-medium text-sub">{field.label}</p>
      <input
        type={isText ? 'text' : 'number'}
        min={isText ? undefined : '0'}
        step={isText ? undefined : 'any'}
        value={value}
        onChange={(event) => onChange(field.key, event.target.value as CashBackComparisonFormState[typeof field.key])}
        placeholder={field.placeholder}
        className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub placeholder:text-[#9ca3af]"
      />
    </div>
  )
}
