import React, { FormEvent } from 'react'

/* ── Form state type ── */
export type DTIFormState = {
  salaryIncome: string
  pensionIncome: string
  investmentIncome: string
  otherIncome: string
  rentalCost: string
  mortgage: string
  propertyTax: string
  hoaFees: string
  homeownerInsurance: string
  studentLoan: string
  autoLoan: string
  otherLiabilities: string
}

type DTIFormProps = {
  form: DTIFormState
  onChange: (field: keyof DTIFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

/* ── Field definitions ── */
type Field = { key: keyof DTIFormState; label: string }

const incomeFields: Field[] = [
  { key: 'salaryIncome', label: 'Salary & Earned Income' },
  { key: 'pensionIncome', label: 'Pension & Social Security' },
  { key: 'investmentIncome', label: 'Investment & Savings' },
  { key: 'otherIncome', label: 'Other Income' }
]

const debtFields: Field[] = [
  { key: 'rentalCost', label: 'Rental Cost' },
  { key: 'mortgage', label: 'Mortgage' },
  { key: 'propertyTax', label: 'Property Tax' },
  { key: 'hoaFees', label: 'HOA Fees' },
  { key: 'homeownerInsurance', label: 'Homeowner Insurance' },
  { key: 'studentLoan', label: 'Student Loan' },
  { key: 'autoLoan', label: 'Auto Loan' },
  { key: 'otherLiabilities', label: 'Other Loans and Liabilities' }
]

/**
 * DTI calculator form — matches Figma node 162:942.
 *
 * Card: 516 px, rounded-[28px], border #e5e7eb, padding 20 px.
 * Two equal-width columns per row (field + "Per Year" / "Year").
 */
export default function DTIForm({
  form,
  onChange,
  onSubmit,
  onClear,
  isCalculating,
  error
}: DTIFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-[15px] rounded-[28px] border border-cardBorder p-5"
    >
      {/* ── Income section ── */}
      <p className="text-[19px] font-semibold text-heading">Debt-to-Income</p>

      <div className="flex flex-col gap-[20px]">
        {incomeFields.map((f) => (
          <FieldRow key={f.key} field={f} value={form[f.key]} onChange={onChange} />
        ))}
      </div>

      {/* ── Debts section ── */}
      <p className="text-[19px] font-semibold text-heading">Debts / Expenses</p>

      <div className="flex flex-col gap-[6px]">
        {debtFields.map((f) => (
          <FieldRow key={f.key} field={f} value={form[f.key]} onChange={onChange} />
        ))}
      </div>

      {/* ── Buttons — Figma 162:964 ── */}
      <div className="flex gap-[15px]">
        <button
          type="submit"
          disabled={isCalculating}
          className="flex h-[38px] flex-1 items-center justify-center rounded-lg bg-primary text-[16px] font-medium text-white shadow-[0px_4px_4px_0px_rgba(205,205,205,0.32)]"
        >
          {isCalculating ? 'Calculating…' : 'Calculate'}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="flex h-[38px] flex-1 items-center justify-center rounded-lg border border-[#e1e6ef] bg-white text-[16px] font-medium text-[#1d2433] shadow-[0px_4px_4px_0px_rgba(205,205,205,0.32)]"
        >
          Clear
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="status" aria-live="polite">
          {error}
        </p>
      )}
    </form>
  )
}

/* ── Single field row (two equal columns) ── */
type FieldRowProps = {
  field: Field
  value: string
  onChange: (key: keyof DTIFormState, value: string) => void
}

function FieldRow({ field, value, onChange }: FieldRowProps) {
  return (
    <div className="flex gap-[10px] items-center">
      {/* Left column — label + input */}
      <div className="flex flex-1 flex-col gap-[6px] min-w-0">
        <p className="text-[16px] font-medium text-sub">{field.label}</p>
        <input
          type="number"
          min="0"
          step="any"
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder="$0"
          className="h-[42px] w-full rounded-[6px] border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub"
        />
      </div>

      {/* Right column — "Per Year" + static "Year" */}
      <div className="flex flex-1 flex-col gap-[6px] min-w-0">
        <p className="text-[16px] font-medium text-sub">Per Year</p>
        <div className="flex h-[42px] items-center rounded-[6px] border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-[#9ca3af]">
          Year
        </div>
      </div>
    </div>
  )
}
