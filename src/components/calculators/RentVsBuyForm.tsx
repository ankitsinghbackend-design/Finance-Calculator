import React, { FormEvent } from 'react'
import type { RentVsBuyInputs } from '../../../backend/calculations/rentVsBuy'

export type RentVsBuyFormState = {
  homePrice: string
  downPayment: string
  interestRate: string
  loanTermYears: string
  buyingClosingCosts: string
  propertyTax: string
  propertyTaxIncrease: string
  homeInsurance: string
  hoaFee: string
  maintenanceCost: string
  homeValueAppreciation: string
  costInsuranceIncrease: string
  sellingClosingCosts: string
  monthlyRent: string
  rentIncreaseRate: string
  rentersInsurance: string
  securityDeposit: string
  upfrontCost: string
  averageInvestmentReturn: string
  marginalFederalTaxRate: string
  marginalStateTaxRate: string
  taxFilingStatus: RentVsBuyInputs['taxFilingStatus']
}

type RentVsBuyFormProps = {
  form: RentVsBuyFormState
  onChange: (field: keyof RentVsBuyFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

type FieldConfig = {
  key: keyof RentVsBuyFormState
  label: string
  placeholder: string
}

const homePurchaseFields: FieldConfig[] = [
  { key: 'homePrice', label: 'Home Price', placeholder: '$0' },
  { key: 'downPayment', label: 'Down Payment', placeholder: '$0' },
  { key: 'interestRate', label: 'Interest Rate', placeholder: '%' },
  { key: 'loanTermYears', label: 'Loan Term', placeholder: 'Years' },
  { key: 'buyingClosingCosts', label: 'Buying Closing Costs', placeholder: '$0' },
  { key: 'propertyTax', label: 'Property Tax', placeholder: '$0 / year' },
  { key: 'propertyTaxIncrease', label: 'Property Tax Increase', placeholder: '% / year' },
  { key: 'homeInsurance', label: 'Home Insurance', placeholder: '$0 / year' },
  { key: 'hoaFee', label: 'HOA Fee', placeholder: '$0 / year' },
  { key: 'maintenanceCost', label: 'Maintenance Cost', placeholder: '$0 / year' },
  { key: 'homeValueAppreciation', label: 'Home Value Appreciation', placeholder: '% / year' },
  { key: 'costInsuranceIncrease', label: 'Cost / Insurance Increase', placeholder: '% / year' },
  { key: 'sellingClosingCosts', label: 'Selling Closing Costs', placeholder: '% / year' }
]

const homeRentFields: FieldConfig[] = [
  { key: 'monthlyRent', label: 'Monthly Rental Fee', placeholder: '$0' },
  { key: 'rentIncreaseRate', label: 'Rental Fee Increase', placeholder: '%' },
  { key: 'rentersInsurance', label: "Renter's Insurance", placeholder: '$0 / month' },
  { key: 'securityDeposit', label: 'Security Deposit', placeholder: '$0' },
  { key: 'upfrontCost', label: 'Upfront Cost', placeholder: '$0' }
]

const infoFields: FieldConfig[] = [
  { key: 'averageInvestmentReturn', label: 'Average Investment Return', placeholder: '% / year' },
  { key: 'marginalFederalTaxRate', label: 'Marginal Federal Tax Rate', placeholder: '% / year' },
  { key: 'marginalStateTaxRate', label: 'Marginal State Tax Rate', placeholder: '% / year' }
]

const filingOptions: RentVsBuyInputs['taxFilingStatus'][] = [
  'Single',
  'Married Filing Jointly',
  'Married Filing Separately'
]

export default function RentVsBuyForm({ form, onChange, onSubmit, onClear, isCalculating, error }: RentVsBuyFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5 backdrop-blur-[10.5px]">
      <Section title="Home Purchase" fields={homePurchaseFields} form={form} onChange={onChange} />
      <Section title="Home Rent" fields={homeRentFields} form={form} onChange={onChange} className="mt-5" />

      <div className="mt-5">
        <p className="text-[19px] font-semibold text-heading">Your Information</p>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-2">
          {infoFields.map((field) => (
            <Field key={field.key} field={field} value={form[field.key]} onChange={onChange} />
          ))}
          <div>
            <p className="text-[16px] font-medium text-sub">Tax Filing Status</p>
            <select
              value={form.taxFilingStatus}
              onChange={(event) => onChange('taxFilingStatus', event.target.value)}
              className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub"
            >
              {filingOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
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

function Section({ title, fields, form, onChange, className = '' }: { title: string; fields: FieldConfig[]; form: RentVsBuyFormState; onChange: (field: keyof RentVsBuyFormState, value: string) => void; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[19px] font-semibold text-heading">{title}</p>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-2">
        {fields.map((field) => (
          <Field key={field.key} field={field} value={form[field.key]} onChange={onChange} />
        ))}
      </div>
    </div>
  )
}

function Field({ field, value, onChange }: { field: FieldConfig; value: string; onChange: (field: keyof RentVsBuyFormState, value: string) => void }) {
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
