import React, { FormEvent } from 'react'

export type SalesTaxFormState = {
  beforeTaxPrice: string
  salesTaxRate: string
  afterTaxPrice: string
}

type SalesTaxFormProps = {
  form: SalesTaxFormState
  onChange: (field: keyof SalesTaxFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

export default function SalesTaxForm({
  form,
  onChange,
  onSubmit,
  onClear,
  isCalculating,
  error
}: SalesTaxFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5 backdrop-blur-[10.5px]">
      <h2 className="text-[19px] font-semibold text-heading">Basic</h2>

      <div className="mt-5 grid grid-cols-1 gap-x-2 gap-y-5 sm:grid-cols-2">
        <Field
          label="Before Tax Price"
          value={form.beforeTaxPrice}
          placeholder="$"
          onChange={(value) => onChange('beforeTaxPrice', value)}
        />
        <Field
          label="Sales Tax Rate (%)"
          value={form.salesTaxRate}
          placeholder="%"
          onChange={(value) => onChange('salesTaxRate', value)}
        />
        <div className="sm:col-span-2">
          <Field
            label="After Tax Price"
            value={form.afterTaxPrice}
            placeholder="$"
            onChange={(value) => onChange('afterTaxPrice', value)}
          />
        </div>
      </div>

      <p className="mt-3 text-[14px] leading-[20px] text-body">Fill any two fields and leave the third empty to solve it automatically.</p>

      <div className="mt-5 grid grid-cols-2 gap-[15px]">
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
        <p className="mt-3 text-sm text-red-600" role="status" aria-live="polite">
          {error}
        </p>
      ) : null}
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