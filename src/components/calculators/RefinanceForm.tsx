import React, { FormEvent } from 'react'
import type { RefinanceInputs } from '../../../backend/calculations/refinance'

export type RefinanceFormState = {
  balanceMode: RefinanceInputs['balanceMode']
  remainingBalance: string
  monthlyPayment: string
  currentInterestRate: string
  newLoanTerm: string
  newInterestRate: string
  points: string
  costsAndFees: string
}

type RefinanceFormProps = {
  form: RefinanceFormState
  onChange: (field: keyof RefinanceFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
  warning: string | null
}

type FieldConfig = {
  key: keyof Pick<RefinanceFormState, 'remainingBalance' | 'monthlyPayment' | 'currentInterestRate' | 'newLoanTerm' | 'newInterestRate' | 'points' | 'costsAndFees'>
  label: string
  placeholder: string
}

const currentLoanFields: FieldConfig[] = [
  { key: 'remainingBalance', label: 'Remaining Balance', placeholder: '$0' },
  { key: 'monthlyPayment', label: 'Monthly Payment', placeholder: '$0' },
  { key: 'currentInterestRate', label: 'Interest Rate', placeholder: '%' }
]

const newLoanFields: FieldConfig[] = [
  { key: 'newLoanTerm', label: 'New Loan Term', placeholder: 'Years' },
  { key: 'newInterestRate', label: 'Interest Rate', placeholder: '%' },
  { key: 'points', label: 'Points', placeholder: '0' },
  { key: 'costsAndFees', label: 'Costs and Fees', placeholder: '$0' }
]

const balanceModeOptions: { label: string; value: RefinanceInputs['balanceMode'] }[] = [
  { label: 'I know my remaining balance', value: 'remaining-balance' },
  { label: 'I know the original loan amount', value: 'original-loan-amount' }
]

export default function RefinanceForm({ form, onChange, onSubmit, onClear, isCalculating, error, warning }: RefinanceFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5 backdrop-blur-[10.5px]">
      <Section title="Current Loan">
        <div>
          <p className="text-[16px] font-medium text-sub">Balance Mode</p>
          <select
            value={form.balanceMode}
            onChange={(event) => onChange('balanceMode', event.target.value)}
            className="mt-1.5 h-[35px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub"
          >
            {balanceModeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-2">
          <Field field={currentLoanFields[0]} value={form.remainingBalance} onChange={onChange} />
          <Field field={currentLoanFields[1]} value={form.monthlyPayment} onChange={onChange} />
        </div>

        <div className="mt-5 max-w-[233px]">
          <Field field={currentLoanFields[2]} value={form.currentInterestRate} onChange={onChange} />
        </div>
      </Section>

      <Section title="New Loan" className="mt-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-2">
          {newLoanFields.map((field) => (
            <Field key={field.key} field={field} value={form[field.key]} onChange={onChange} />
          ))}
        </div>
      </Section>

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

      {warning ? (
        <p className="mt-3 text-sm text-amber-600" role="status" aria-live="polite">
          {warning}
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

function Section({ title, className = '', children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <p className="text-[19px] font-semibold text-heading">{title}</p>
      <div className="mt-5">{children}</div>
    </div>
  )
}

function Field({
  field,
  value,
  onChange
}: {
  field: FieldConfig
  value: string
  onChange: (field: keyof RefinanceFormState, value: string) => void
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
