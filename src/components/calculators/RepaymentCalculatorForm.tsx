import React, { ChangeEvent, FormEvent } from 'react'
import { type RepaymentMode } from '../../../backend/calculations/repayment'

export type RepaymentFormState = {
  loanBalance: string
  interestRate: string
  compoundMonths: string
  loanTermMonths: string
  monthlyPayment: string
}

type RepaymentCalculatorFormProps = {
  form: RepaymentFormState
  mode: RepaymentMode
  onModeChange: (mode: RepaymentMode) => void
  onChange: (field: keyof RepaymentFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

export default function RepaymentCalculatorForm({
  form,
  mode,
  onModeChange,
  onChange,
  onSubmit,
  onClear,
  isCalculating,
  error
}: RepaymentCalculatorFormProps) {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    onChange(name as keyof RepaymentFormState, value)
  }

  return (
    <form onSubmit={onSubmit} className="border border-cardBorder rounded-[28px] p-5 bg-[#f9fafb]">
      <h2 className="text-[19px] font-semibold text-heading">Basic</h2>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
        <div>
          <p className="text-[16px] text-sub font-medium">Loan balance</p>
          <input
            type="number"
            step="any"
            min="0"
            name="loanBalance"
            value={form.loanBalance}
            onChange={handleInputChange}
            placeholder="$"
            className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
          />
        </div>

        <div>
          <p className="text-[16px] text-sub font-medium">Interest rate</p>
          <input
            type="number"
            step="any"
            min="0"
            name="interestRate"
            value={form.interestRate}
            onChange={handleInputChange}
            placeholder="Year"
            className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
          />
        </div>

        <div>
          <p className="text-[16px] text-sub font-medium">Compound</p>
          <input
            type="number"
            step="1"
            min="1"
            name="compoundMonths"
            value={form.compoundMonths}
            onChange={handleInputChange}
            placeholder="Months"
            className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
          />
        </div>

        {mode === 'monthly-payment' ? (
          <div>
            <p className="text-[16px] text-sub font-medium">Pay back</p>
            <input
              type="number"
              step="1"
              min="1"
              name="loanTermMonths"
              value={form.loanTermMonths}
              onChange={handleInputChange}
              placeholder="Months"
              className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
            />
          </div>
        ) : (
          <div>
            <p className="text-[16px] text-sub font-medium">Monthly payment</p>
            <input
              type="number"
              step="any"
              min="0"
              name="monthlyPayment"
              value={form.monthlyPayment}
              onChange={handleInputChange}
              placeholder="$"
              className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 text-[16px] text-sub font-medium">
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="repaymentMode"
            checked={mode === 'monthly-payment'}
            onChange={() => onModeChange('monthly-payment')}
            className="h-4 w-4 border border-cardBorder text-primary focus:ring-primary"
          />
          Repay within a fixed time
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="repaymentMode"
            checked={mode === 'payoff-time'}
            onChange={() => onModeChange('payoff-time')}
            className="h-4 w-4 border border-cardBorder text-primary focus:ring-primary"
          />
          Calculate payoff time from payment
        </label>
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
