import React, { ChangeEvent, FormEvent } from 'react'

export type AutoLoanMode = 'monthly-payment' | 'vehicle-price'

export type AutoLoanTab = {
  id: AutoLoanMode
  label: string
}

export const AUTO_LOAN_TABS: AutoLoanTab[] = [
  { id: 'monthly-payment', label: 'Monthly Payment' },
  { id: 'vehicle-price', label: 'Vehicle Price' }
]

export type AutoLoanFormState = {
  autoPrice: string
  desiredMonthlyPayment: string
  loanTermMonths: string
  interestRate: string
  cashIncentives: string
  downPayment: string
  tradeInValue: string
  amountOwedOnTradeIn: string
  salesTaxRate: string
  titleFees: string
}

export type AutoLoanRequestInputs =
  | {
      mode: 'monthly-payment'
      autoPrice: number
      loanTermMonths: number
      interestRate: number
      cashIncentives: number
      downPayment: number
      tradeInValue: number
      amountOwedOnTradeIn: number
      salesTaxRate: number
      titleFees: number
    }
  | {
      mode: 'vehicle-price'
      desiredMonthlyPayment: number
      loanTermMonths: number
      interestRate: number
      cashIncentives: number
      downPayment: number
      tradeInValue: number
      amountOwedOnTradeIn: number
      salesTaxRate: number
      titleFees: number
    }

export type AutoLoanResult = {
  mode: AutoLoanMode
  vehiclePrice: number
  maximumVehiclePrice: number
  loanAmount: number
  monthlyPayment: number
  desiredMonthlyPayment: number
  totalPayments: number
  totalInterest: number
  salesTax: number
  totalCost: number
  loanTermMonths: number
  interestRate: number
  downPayment: number
  tradeInCredit: number
  titleFees: number
  cashIncentives: number
}

type AutoLoanFormProps = {
  mode: AutoLoanMode
  form: AutoLoanFormState
  onChange: (field: keyof AutoLoanFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

type FieldDefinition = {
  key: keyof AutoLoanFormState
  label: string
  placeholder: string
  min?: string
  step?: string
}

const baseFields: FieldDefinition[] = [
  { key: 'loanTermMonths', label: 'Loan Term', placeholder: 'Months', min: '1', step: '1' },
  { key: 'interestRate', label: 'Interest Rate', placeholder: 'Year', min: '0', step: 'any' },
  { key: 'cashIncentives', label: 'Cash Incentives', placeholder: 'Monthly', min: '0', step: 'any' },
  { key: 'downPayment', label: 'Down Payment', placeholder: 'Year', min: '0', step: 'any' },
  { key: 'tradeInValue', label: 'Trade-in Value', placeholder: 'Monthly', min: '0', step: 'any' },
  { key: 'amountOwedOnTradeIn', label: 'Amount Owed on Trade-in', placeholder: 'Year', min: '0', step: 'any' },
  { key: 'salesTaxRate', label: 'Sales Tax', placeholder: 'Year', min: '0', step: 'any' },
  { key: 'titleFees', label: 'Title, Registration and Other Fees', placeholder: 'Year', min: '0', step: 'any' }
]

export default function AutoLoanForm({
  mode,
  form,
  onChange,
  onSubmit,
  onClear,
  isCalculating,
  error
}: AutoLoanFormProps) {
  const firstField: FieldDefinition =
    mode === 'monthly-payment'
      ? { key: 'autoPrice', label: 'Auto Price', placeholder: '$', min: '0', step: 'any' }
      : { key: 'desiredMonthlyPayment', label: 'Desired Monthly Payment', placeholder: '$', min: '0', step: 'any' }

  const fields = [firstField, ...baseFields]

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    onChange(name as keyof AutoLoanFormState, value)
  }

  return (
    <form onSubmit={onSubmit} className="border border-cardBorder rounded-[28px] p-5 bg-[#f9fafb]">
      <h2 className="text-[19px] font-semibold text-heading">{mode === 'monthly-payment' ? 'Monthly Payment' : 'Vehicle Price'}</h2>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
        {fields.map((field) => (
          <div key={field.key}>
            <p className="text-[16px] text-sub font-medium">{field.label}</p>
            <input
              type="number"
              step={field.step ?? 'any'}
              min={field.min ?? '0'}
              name={field.key}
              value={form[field.key]}
              onChange={handleInputChange}
              placeholder={field.placeholder}
              className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
            />
          </div>
        ))}
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
