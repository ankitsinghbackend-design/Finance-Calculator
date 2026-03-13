import React, { ChangeEvent, FormEvent } from 'react'
import {
  DTI_OPTION_LABELS,
  type HouseAffordabilityDTIType
} from '../../../backend/calculations/houseAffordability'

export type HouseAffordabilityFormState = {
  annualIncome: string
  mortgageTermYears: string
  interestRate: string
  monthlyDebtPayments: string
  downPaymentPercent: string
  propertyTaxRate: string
  hoaMonthlyFee: string
  insuranceAnnual: string
  dtiRatioType: HouseAffordabilityDTIType
}

type HouseAffordabilityFormProps = {
  form: HouseAffordabilityFormState
  onChange: (field: keyof HouseAffordabilityFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

const dtiOptions: HouseAffordabilityDTIType[] = [
  'conventional',
  'fha',
  'va',
  'manual-10',
  'manual-15',
  'manual-20',
  'manual-25',
  'manual-30',
  'manual-35',
  'manual-40',
  'manual-45',
  'manual-50'
]

export default function HouseAffordabilityForm({
  form,
  onChange,
  onSubmit,
  onClear,
  isCalculating,
  error
}: HouseAffordabilityFormProps) {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    onChange(name as keyof HouseAffordabilityFormState, value)
  }

  return (
    <form onSubmit={onSubmit} className="border border-cardBorder rounded-[28px] p-5 bg-[#f9fafb]">
      <h2 className="text-[19px] font-semibold text-heading">House Affordability</h2>

      <div className="mt-3 grid grid-cols-2 gap-x-[10px] gap-y-5">
        {[
          { label: 'Annual household income', key: 'annualIncome', placeholder: '$0' },
          { label: 'Mortgage loan term', key: 'mortgageTermYears', placeholder: 'Year' },
          { label: 'Interest Rate', key: 'interestRate', placeholder: '%' },
          { label: 'Monthly debt payback', key: 'monthlyDebtPayments', placeholder: '$' },
          { label: 'Down payment', key: 'downPaymentPercent', placeholder: '%' },
          { label: 'Property tax', key: 'propertyTaxRate', placeholder: '%' },
          { label: 'HOA or co-op fee', key: 'hoaMonthlyFee', placeholder: '$' },
          { label: 'Insurance', key: 'insuranceAnnual', placeholder: '$' }
        ].map((field) => (
          <div key={field.key}>
            <p className="text-[16px] text-sub font-medium">{field.label}</p>
            <input
              type="number"
              step="any"
              min="0"
              name={field.key}
              value={form[field.key as keyof HouseAffordabilityFormState] as string}
              onChange={handleInputChange}
              placeholder={field.placeholder}
              className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium placeholder:text-[#9ca3af]"
            />
          </div>
        ))}
      </div>

      <div className="mt-2">
        <p className="text-[16px] text-sub font-medium">Debt-to-income (DTI) ratio</p>
        <select
          name="dtiRatioType"
          value={form.dtiRatioType}
          onChange={handleInputChange}
          className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
        >
          {dtiOptions.map((option) => (
            <option key={option} value={option}>
              {DTI_OPTION_LABELS[option]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-[15px]">
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
          className="h-[42px] rounded-lg bg-white border border-[#e1e6ef] text-[#1d2433] text-[16px] font-medium shadow-card"
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
