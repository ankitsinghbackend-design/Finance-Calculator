import React, { FormEvent } from 'react'

export type MutualFundFormState = {
  initialInvestment: string
  annualContribution: string
  monthlyContribution: string
  rateOfReturn: string
  holdingLength: string
  holdingUnit: 'months' | 'years'
  salesCharge: string
  deferredSalesCharge: string
  operatingExpenses: string
}

type MutualFundFormProps = {
  form: MutualFundFormState
  onChange: <K extends keyof MutualFundFormState>(field: K, value: MutualFundFormState[K]) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

export default function MutualFundForm({ form, onChange, onSubmit, onClear, isCalculating, error }: MutualFundFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5 backdrop-blur-[10.5px]">
      <p className="text-[19px] font-semibold text-heading">Basic</p>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-[10px]">
        <NumericField label="Initial investment" value={form.initialInvestment} onChange={(value) => onChange('initialInvestment', value)} placeholder="$" />
        <NumericField label="Annual contribution" value={form.annualContribution} onChange={(value) => onChange('annualContribution', value)} placeholder="$" />
        <NumericField label="Monthly contribution" value={form.monthlyContribution} onChange={(value) => onChange('monthlyContribution', value)} placeholder="$" />
        <NumericField label="Rate of return" value={form.rateOfReturn} onChange={(value) => onChange('rateOfReturn', value)} placeholder="%" />

        <div>
          <p className="text-[16px] font-medium text-sub">Holding length</p>
          <div className="mt-1.5 flex gap-2">
            <input
              type="number"
              min="0"
              step="any"
              value={form.holdingLength}
              onChange={(event) => onChange('holdingLength', event.target.value)}
              className="h-[42px] min-w-0 flex-1 rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub placeholder:text-[#9ca3af]"
            />
            <select
              value={form.holdingUnit}
              onChange={(event) => onChange('holdingUnit', event.target.value as MutualFundFormState['holdingUnit'])}
              className="h-[42px] w-[120px] rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub"
            >
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>
      </div>

      <p className="mt-6 text-[19px] font-semibold text-heading">Fees</p>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-[10px]">
        <NumericField label="Sales charge" value={form.salesCharge} onChange={(value) => onChange('salesCharge', value)} placeholder="%" />
        <NumericField label="Deferred sales charge" value={form.deferredSalesCharge} onChange={(value) => onChange('deferredSalesCharge', value)} placeholder="%" />
        <div className="sm:col-span-2">
          <NumericField label="Operating expenses" value={form.operatingExpenses} onChange={(value) => onChange('operatingExpenses', value)} placeholder="%" />
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

function NumericField({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
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
        className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub placeholder:text-[#9ca3af]"
      />
    </div>
  )
}
