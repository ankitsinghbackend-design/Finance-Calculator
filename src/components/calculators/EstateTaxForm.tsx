import React, { FormEvent } from 'react'

export type EstateTaxFormState = {
  residenceRealEstate: string
  stocksBonds: string
  savingsChecking: string
  vehiclesBoats: string
  retirementPlans: string
  lifeInsuranceBenefit: string
  otherAssets: string
  debts: string
  funeralExpenses: string
  charitableContributions: string
  stateEstateTaxes: string
  lifetimeGiftedAmount: string
}

type EstateTaxFormProps = {
  form: EstateTaxFormState
  onChange: (field: keyof EstateTaxFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

type FieldConfig = {
  key: keyof EstateTaxFormState
  label: string
  placeholder: string
}

const assetFields: FieldConfig[] = [
  { key: 'residenceRealEstate', label: 'Residence & Other Real Estate', placeholder: '$' },
  { key: 'stocksBonds', label: 'Stocks, Bonds, and Other', placeholder: 'Year' },
  { key: 'savingsChecking', label: 'Savings, CDs, and Checking', placeholder: 'Months' },
  { key: 'vehiclesBoats', label: 'Vehicles, Boats, and Other', placeholder: 'Months' },
  { key: 'retirementPlans', label: 'Retirement Plans', placeholder: 'Year' },
  { key: 'lifeInsuranceBenefit', label: 'Life Insurance Benefit', placeholder: 'Monthly' },
  { key: 'otherAssets', label: 'Other Assets', placeholder: 'Year' }
]

const deductionFields: FieldConfig[] = [
  { key: 'debts', label: 'Debts (mortgages, loan, credit cards, etc)', placeholder: '$' },
  { key: 'funeralExpenses', label: 'Funeral, Administration, and Claims Expenses', placeholder: 'Months' },
  { key: 'charitableContributions', label: 'Charitable Contributions', placeholder: 'Year' },
  { key: 'stateEstateTaxes', label: 'State Inheritance or Estate Taxes', placeholder: 'Year' },
  { key: 'lifetimeGiftedAmount', label: 'Lifetime Gifted Amount', placeholder: 'Year' }
]

export default function EstateTaxForm({
  form,
  onChange,
  onSubmit,
  onClear,
  isCalculating,
  error
}: EstateTaxFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5 backdrop-blur-[10.5px]"
    >
      <div className="grid gap-5 xl:grid-cols-[476px_476px] xl:gap-5">
        <FieldColumn title="Assets" fields={assetFields} form={form} onChange={onChange} columns={2} />
        <FieldColumn title="Liability, Costs, and Deductibles" fields={deductionFields} form={form} onChange={onChange} columns={1} />
      </div>

      <div className="mt-5 xl:ml-[496px] xl:w-[476px]">
        <div className="grid grid-cols-2 gap-[15px]">
          <button
            type="submit"
            disabled={isCalculating}
            className="h-[42px] rounded-lg bg-primary text-white text-[16px] font-medium shadow-card"
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
      </div>
    </form>
  )
}

type FieldColumnProps = {
  title: string
  fields: FieldConfig[]
  form: EstateTaxFormState
  onChange: (field: keyof EstateTaxFormState, value: string) => void
  columns: 1 | 2
}

function FieldColumn({ title, fields, form, onChange, columns }: FieldColumnProps) {
  const gridClass = columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-1'

  return (
    <div className="min-w-0 flex flex-col gap-5">
      <p className="w-full text-[19px] font-semibold text-heading">{title}</p>
      <div className={`grid grid-cols-1 gap-x-2 gap-y-5 ${gridClass}`}>
        {fields.map((field) => (
          <div
            key={field.key}
            className={field.key === 'otherAssets' ? (columns === 2 ? 'sm:max-w-[234px]' : '') : 'min-w-0'}
          >
            <p className="text-[16px] font-medium text-sub">{field.label}</p>
            <input
              type="number"
              min="0"
              step="any"
              value={form[field.key]}
              onChange={(event) => onChange(field.key, event.target.value)}
              placeholder={field.placeholder}
              className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
