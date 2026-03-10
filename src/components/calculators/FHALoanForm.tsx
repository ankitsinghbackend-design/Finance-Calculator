import React, { FormEvent, useState } from 'react'

export type FHALoanFormState = {
  homePrice: string
  downPaymentPercent: string
  loanTermMonths: string
  interestRate: string
  upfrontMIPRate: string
  annualMIPRate: string
  mipDurationYears: string
  propertyTaxRate: string
  homeInsurance: string
  hoaFee: string
  otherCosts: string
  pmiInsurance: string
}

type FHALoanFormProps = {
  form: FHALoanFormState
  onChange: (field: keyof FHALoanFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
  fhaWarning: string | null
}

type FieldConfig = {
  key: keyof FHALoanFormState
  label: string
  placeholder: string
}

const mortgageFields: FieldConfig[] = [
  { key: 'homePrice', label: 'Home Price', placeholder: '$0' },
  { key: 'downPaymentPercent', label: 'Down Payment', placeholder: '%' },
  { key: 'loanTermMonths', label: 'Loan Term', placeholder: 'Months' },
  { key: 'interestRate', label: 'Interest Rate', placeholder: '%' }
]

const mipFields: FieldConfig[] = [
  { key: 'upfrontMIPRate', label: 'Upfront FHA MIP', placeholder: '% / year' },
  { key: 'annualMIPRate', label: 'Annual FHA MIP', placeholder: '% / year' },
  { key: 'mipDurationYears', label: 'Annual FHA MIP Duration', placeholder: 'Years' },
  { key: 'pmiInsurance', label: 'PMI Insurance', placeholder: '$0 / year' }
]

const moreOptionFields: FieldConfig[] = [
  { key: 'propertyTaxRate', label: 'Property Taxes', placeholder: '%' },
  { key: 'homeInsurance', label: 'Home Insurance', placeholder: '$0 / year' },
  { key: 'hoaFee', label: 'HOA Fee', placeholder: '$0 / year' },
  { key: 'otherCosts', label: 'Other Costs', placeholder: '$0 / year' }
]

export default function FHALoanForm({ form, onChange, onSubmit, onClear, isCalculating, error, fhaWarning }: FHALoanFormProps) {
  const [showMoreOptions, setShowMoreOptions] = useState(true)
  const [makeExtraPayments, setMakeExtraPayments] = useState(false)

  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5 backdrop-blur-[10.5px]">
      <Section title="Mortgage APR Calculator" fields={mortgageFields} form={form} onChange={onChange} />
      <Section title="MIP Details" fields={mipFields} form={form} onChange={onChange} className="mt-5" />

      <label className="mt-5 flex cursor-pointer items-center gap-[10px]">
        <input
          type="checkbox"
          checked={makeExtraPayments}
          onChange={(event) => setMakeExtraPayments(event.target.checked)}
          className="h-5 w-5 rounded border border-cardBorder accent-primary"
        />
        <span className="text-[19px] font-semibold text-heading">Optional: make extra payments</span>
      </label>

      <button
        type="button"
        onClick={() => setShowMoreOptions((current) => !current)}
        className="mt-5 text-[19px] font-semibold text-heading"
      >
        {showMoreOptions ? '−More Options' : '+More Options'}
      </button>

      {showMoreOptions ? <Section fields={moreOptionFields} form={form} onChange={onChange} className="mt-5" /> : null}

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

      {fhaWarning ? (
        <p className="mt-3 text-sm text-amber-600" role="status" aria-live="polite">
          {fhaWarning}
        </p>
      ) : null}

      {error ? (
        <p className="mt-2 text-sm text-red-600" role="status" aria-live="polite">
          {error}
        </p>
      ) : null}
    </form>
  )
}

function Section({
  title,
  fields,
  form,
  onChange,
  className = ''
}: {
  title?: string
  fields: FieldConfig[]
  form: FHALoanFormState
  onChange: (field: keyof FHALoanFormState, value: string) => void
  className?: string
}) {
  return (
    <div className={className}>
      {title ? <p className="text-[19px] font-semibold text-heading">{title}</p> : null}
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-2">
        {fields.map((field) => (
          <Field key={field.key} field={field} value={form[field.key]} onChange={onChange} />
        ))}
      </div>
    </div>
  )
}

function Field({ field, value, onChange }: { field: FieldConfig; value: string; onChange: (field: keyof FHALoanFormState, value: string) => void }) {
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
