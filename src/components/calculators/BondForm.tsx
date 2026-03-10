import React, { FormEvent } from 'react'

export type BondFormState = {
  price: string
  faceValue: string
  yield: string
  timeToMaturity: string
  maturityUnit: 'months' | 'years'
  annualCoupon: string
  couponFrequency: 'annual' | 'semi-annual' | 'quarterly'
  maturityDate: string
  settlementDate: string
  dayCountConvention: '30/360' | 'Actual/360' | 'Actual/365' | 'Actual/Actual'
}

type BondFormProps = {
  form: BondFormState
  onChange: <K extends keyof BondFormState>(field: K, value: BondFormState[K]) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

export default function BondForm({ form, onChange, onSubmit, onClear, isCalculating, error }: BondFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5 backdrop-blur-[10.5px]">
      <p className="text-[19px] font-semibold text-heading">Basic</p>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-[10px]">
        <NumericField label="Price" value={form.price} onChange={(value) => onChange('price', value)} placeholder="Leave blank to solve" />
        <NumericField label="Face value" value={form.faceValue} onChange={(value) => onChange('faceValue', value)} />
        <NumericField label="Yield" value={form.yield} onChange={(value) => onChange('yield', value)} placeholder="Leave blank to solve" />

        <div>
          <p className="text-[16px] font-medium text-sub">Time to maturity</p>
          <div className="mt-1.5 flex gap-2">
            <input
              type="number"
              min="0"
              step="any"
              value={form.timeToMaturity}
              onChange={(event) => onChange('timeToMaturity', event.target.value)}
              className="h-[42px] min-w-0 flex-1 rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub"
            />
            <select
              value={form.maturityUnit}
              onChange={(event) => onChange('maturityUnit', event.target.value as BondFormState['maturityUnit'])}
              className="h-[42px] w-[120px] rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub"
            >
              <option value="years">Years</option>
              <option value="months">Months</option>
            </select>
          </div>
        </div>

        <NumericField label="Annual coupon" value={form.annualCoupon} onChange={(value) => onChange('annualCoupon', value)} />

        <div>
          <p className="text-[16px] font-medium text-sub">Coupon frequency</p>
          <select
            value={form.couponFrequency}
            onChange={(event) => onChange('couponFrequency', event.target.value as BondFormState['couponFrequency'])}
            className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub"
          >
            <option value="annual">Annual</option>
            <option value="semi-annual">Semi-annual</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
      </div>

      <p className="mt-6 text-[19px] font-semibold text-heading">Bond pricing calculator</p>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-[10px]">
        <DateField label="Maturity date" value={form.maturityDate} onChange={(value) => onChange('maturityDate', value)} />
        <DateField label="Settlement date" value={form.settlementDate} onChange={(value) => onChange('settlementDate', value)} />
      </div>

      <div className="mt-5">
        <p className="text-[16px] font-medium text-sub">Day-count convention</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(['30/360', 'Actual/360', 'Actual/365', 'Actual/Actual'] as const).map((option) => (
            <label key={option} className="inline-flex items-center gap-2 text-[16px] font-medium text-sub">
              <input
                type="radio"
                name="dayCountConvention"
                checked={form.dayCountConvention === option}
                onChange={() => onChange('dayCountConvention', option)}
                className="h-4 w-4 border border-cardBorder text-primary focus:ring-primary"
              />
              {option}
            </label>
          ))}
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

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="text-[16px] font-medium text-sub">{label}</p>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub"
      />
    </div>
  )
}
