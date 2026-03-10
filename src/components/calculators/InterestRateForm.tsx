import React, { FormEvent } from 'react'

export type InterestRateFormState = {
  loanAmount: string
  loanTermYears: string
  monthlyPayment: string
}

type InterestRateFormProps = {
  form: InterestRateFormState
  onChange: (field: keyof InterestRateFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

export default function InterestRateForm({
  form,
  onChange,
  onSubmit,
  onClear,
  isCalculating,
  error
}: InterestRateFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="border border-cardBorder rounded-[28px] p-5 bg-[#f9fafb] backdrop-blur-[10.5px]"
    >
      <h2 className="text-[19px] font-semibold text-heading">Basic</h2>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-5">
        <div>
          <p className="text-[16px] text-sub font-medium">Loan Amount</p>
          <input
            type="number"
            step="any"
            min="0"
            value={form.loanAmount}
            onChange={(event) => onChange('loanAmount', event.target.value)}
            placeholder="$"
            className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
          />
        </div>

        <div>
          <p className="text-[16px] text-sub font-medium">Loan Term</p>
          <input
            type="number"
            step="1"
            min="1"
            value={form.loanTermYears}
            onChange={(event) => onChange('loanTermYears', event.target.value)}
            placeholder="Year"
            className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
          />
        </div>

        <div className="sm:col-span-2">
          <p className="text-[16px] text-sub font-medium">Monthly Payment</p>
          <input
            type="number"
            step="any"
            min="0"
            value={form.monthlyPayment}
            onChange={(event) => onChange('monthlyPayment', event.target.value)}
            placeholder="Months"
            className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-[15px]">
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
