import React, { FormEvent } from 'react'

export type HelocFormState = {
  loanAmount: string
  interestRate: string
  drawPeriodMonths: string
  repaymentPeriodYears: string
  includeClosingCosts: boolean
}

type HelocFormProps = {
  form: HelocFormState
  onChange: (field: keyof HelocFormState, value: string | boolean) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

export default function HelocForm({ form, onChange, onSubmit, onClear, isCalculating, error }: HelocFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5">
      <h2 className="text-[19px] font-semibold text-heading">Home Equity Loan Calculator</h2>

      <div className="mt-5 space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-2">
          <Field
            label="Loan Amount"
            value={form.loanAmount}
            placeholder="$0"
            onChange={(value) => onChange('loanAmount', value)}
          />
          <Field
            label="Interest Rate"
            value={form.interestRate}
            placeholder="%"
            onChange={(value) => onChange('interestRate', value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-[10px]">
          <Field
            label="Draw Period"
            value={form.drawPeriodMonths}
            placeholder="Months"
            onChange={(value) => onChange('drawPeriodMonths', value)}
          />
          <Field
            label="Payment Period"
            value={form.repaymentPeriodYears}
            placeholder="Years"
            onChange={(value) => onChange('repaymentPeriodYears', value)}
          />
        </div>

        <label className="flex items-center gap-[6px] text-[16px] font-medium text-sub">
          <input
            type="checkbox"
            checked={form.includeClosingCosts}
            onChange={(event) => onChange('includeClosingCosts', event.target.checked)}
            className="size-[18px] rounded border-cardBorder accent-primary"
          />
          Include Closing Costs
        </label>

        <p className="text-[14px] leading-[21px] text-body">
          HELOC payments vary depending on interest rates and repayment terms.
        </p>
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

function Field({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return (
    <div>
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
