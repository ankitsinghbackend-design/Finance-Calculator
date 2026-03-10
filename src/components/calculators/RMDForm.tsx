import React, { FormEvent } from 'react'

export type RMDFormState = {
  yearOfBirth: string
  yearOfRmd: string
  accountBalance: string
  isSpousePrimaryBeneficiary: 'yes' | 'no'
  spouseDateOfBirth: string
  estimatedRateOfReturn: string
}

type RMDFormProps = {
  form: RMDFormState
  onChange: <K extends keyof RMDFormState>(field: K, value: RMDFormState[K]) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

export default function RMDForm({ form, onChange, onSubmit, onClear, isCalculating, error }: RMDFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5 backdrop-blur-[10.5px]">
      <p className="text-[19px] font-semibold text-heading">Basic info</p>

      <div className="mt-5 space-y-5">
        <Field label="Your year of birth">
          <input
            type="number"
            min="1900"
            step="1"
            value={form.yearOfBirth}
            onChange={(event) => onChange('yearOfBirth', event.target.value)}
            className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub placeholder:text-[#9ca3af]"
          />
        </Field>

        <Field label="Year of RMD">
          <input
            type="number"
            min="2023"
            step="1"
            value={form.yearOfRmd}
            onChange={(event) => onChange('yearOfRmd', event.target.value)}
            placeholder="Year"
            className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub placeholder:text-[#9ca3af]"
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-[10px]">
          <Field label={`Account balance as of 12/31/${Math.max(0, Number(form.yearOfRmd || 0) - 1) || 2025}`}>
            <input
              type="number"
              min="0"
              step="any"
              value={form.accountBalance}
              onChange={(event) => onChange('accountBalance', event.target.value)}
              className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub placeholder:text-[#9ca3af]"
            />
          </Field>

          <div>
            <p className="text-[16px] font-medium text-sub">Is your spouse the primary beneficiary?</p>
            <div className="mt-3 flex h-[42px] items-center gap-5 rounded-md border border-cardBorder bg-[#f9fafb] px-3">
              <label className="inline-flex items-center gap-2 text-[16px] font-medium text-sub">
                <input
                  type="radio"
                  name="isSpousePrimaryBeneficiary"
                  checked={form.isSpousePrimaryBeneficiary === 'yes'}
                  onChange={() => onChange('isSpousePrimaryBeneficiary', 'yes')}
                  className="h-4 w-4 border border-cardBorder text-primary focus:ring-primary"
                />
                Yes
              </label>
              <label className="inline-flex items-center gap-2 text-[16px] font-medium text-sub">
                <input
                  type="radio"
                  name="isSpousePrimaryBeneficiary"
                  checked={form.isSpousePrimaryBeneficiary === 'no'}
                  onChange={() => onChange('isSpousePrimaryBeneficiary', 'no')}
                  className="h-4 w-4 border border-cardBorder text-primary focus:ring-primary"
                />
                No
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-[10px]">
          <Field label="Your spouse's date of birth">
            <input
              type="date"
              value={form.spouseDateOfBirth}
              onChange={(event) => onChange('spouseDateOfBirth', event.target.value)}
              disabled={form.isSpousePrimaryBeneficiary !== 'yes'}
              className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub disabled:cursor-not-allowed disabled:opacity-60"
            />
          </Field>

          <Field label="Estimated rate of return (Optional)">
            <input
              type="number"
              min="0"
              step="any"
              value={form.estimatedRateOfReturn}
              onChange={(event) => onChange('estimatedRateOfReturn', event.target.value)}
              placeholder="%"
              className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub placeholder:text-[#9ca3af]"
            />
          </Field>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[16px] font-medium text-sub">{label}</p>
      {children}
    </div>
  )
}
