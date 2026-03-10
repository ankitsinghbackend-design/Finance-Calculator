import React, { FormEvent } from 'react'
import type { VAMortgageInputs } from '../../../backend/calculations/vaMortgage'

export type VAMortgageFormState = {
  homePrice: string
  downPaymentPercent: string
  loanTermMonths: string
  interestRate: string
  serviceType: VAMortgageInputs['serviceType']
  usedVALoanBefore: 'yes' | 'no'
  hasDisability: 'yes' | 'no'
  fundingFeePaymentMethod: VAMortgageInputs['fundingFeePaymentMethod']
}

type VAMortgageFormProps = {
  form: VAMortgageFormState
  onChange: (field: keyof VAMortgageFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

type FieldConfig = {
  key: keyof Pick<VAMortgageFormState, 'homePrice' | 'downPaymentPercent' | 'loanTermMonths' | 'interestRate'>
  label: string
  placeholder: string
}

const mortgageFields: FieldConfig[] = [
  { key: 'homePrice', label: 'Home Price', placeholder: '$0' },
  { key: 'downPaymentPercent', label: 'Down Payment', placeholder: '%' },
  { key: 'loanTermMonths', label: 'Loan Term', placeholder: 'Months' },
  { key: 'interestRate', label: 'Interest Rate', placeholder: '%' }
]

const serviceOptions: { label: string; value: VAMortgageInputs['serviceType'] }[] = [
  { label: 'Active / Veteran', value: 'active-veteran' },
  { label: 'Reservist / National Guard', value: 'reservist-national-guard' },
  { label: 'Surviving Spouses', value: 'surviving-spouse' }
]

const yesNoOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' }
] as const

const paymentOptions: { label: string; value: VAMortgageInputs['fundingFeePaymentMethod'] }[] = [
  { label: 'Finance into loan', value: 'finance' },
  { label: 'Paid Upfront', value: 'upfront' }
]

export default function VAMortgageForm({ form, onChange, onSubmit, onClear, isCalculating, error }: VAMortgageFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5 backdrop-blur-[10.5px]">
      <p className="text-[19px] font-semibold text-heading">Mortgage APR Calculator</p>
      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-2">
        {mortgageFields.map((field) => (
          <Field key={field.key} field={field} value={form[field.key]} onChange={onChange} />
        ))}
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <p className="text-[16px] font-medium text-sub">VA Eligibility</p>
          <div className="mt-3 space-y-3">
            {serviceOptions.map((option) => (
              <RadioRow
                key={option.value}
                name="serviceType"
                label={option.label}
                checked={form.serviceType === option.value}
                onChange={() => onChange('serviceType', option.value)}
              />
            ))}
          </div>
        </div>

        <InlineRadioGroup
          label="Used VA Loan Before"
          name="usedVALoanBefore"
          value={form.usedVALoanBefore}
          options={yesNoOptions}
          onChange={(value) => onChange('usedVALoanBefore', value)}
        />

        <InlineRadioGroup
          label="Service-Related Disability (10%+)"
          name="hasDisability"
          value={form.hasDisability}
          options={yesNoOptions}
          onChange={(value) => onChange('hasDisability', value)}
        />

        <InlineRadioGroup
          label="VA Funding Fee"
          name="fundingFeePaymentMethod"
          value={form.fundingFeePaymentMethod}
          options={paymentOptions}
          onChange={(value) => onChange('fundingFeePaymentMethod', value)}
        />
      </div>

      <p className="mt-5 text-center text-[19px] font-semibold text-heading">+More Options</p>

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
  onChange: (field: keyof VAMortgageFormState, value: string) => void
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

function RadioRow({ name, label, checked, onChange }: { name: string; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-[6px]">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="h-5 w-5 accent-primary" />
      <span className="text-[16px] font-medium text-sub">{label}</span>
    </label>
  )
}

function InlineRadioGroup<T extends string>({
  label,
  name,
  value,
  options,
  onChange
}: {
  label: string
  name: string
  value: T
  options: readonly { label: string; value: T }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-4">
      <p className="text-[16px] font-medium text-sub">{label}</p>
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-[6px]">
            <input
              type="radio"
              name={name}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-5 w-5 accent-primary"
            />
            <span className="text-[16px] font-medium text-sub">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
