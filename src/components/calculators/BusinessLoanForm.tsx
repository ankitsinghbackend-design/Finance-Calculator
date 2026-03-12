import type { FormEvent } from 'react'
import type { BusinessLoanInputs } from '../../../backend/calculations/businessLoan'

export type BusinessLoanFormState = {
  loanAmount: string
  interestRate: string
  compound: BusinessLoanInputs['compound']
  loanTerm: string
  payBack: BusinessLoanInputs['payBack']
  originationFee: string
  documentationFee: string
  otherFees: string
}

type BusinessLoanFormProps = {
  form: BusinessLoanFormState
  onChange: <K extends keyof BusinessLoanFormState>(field: K, value: BusinessLoanFormState[K]) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

const inputClassName =
  'h-[42px] w-full rounded-[6px] border border-[#e5e7eb] bg-[#f9fafb] px-3 text-[16px] font-medium text-[#111827] outline-none transition focus:border-[#22c55e] focus:ring-2 focus:ring-[#bbf7d0]'

const labelClassName = 'text-[16px] font-medium text-sub'

export default function BusinessLoanForm({
  form,
  onChange,
  onSubmit,
  onClear,
  isCalculating,
  error
}: BusinessLoanFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[28px] border border-[#e5e7eb] bg-[#f9fafb] p-5 shadow-[0px_2px_6px_rgba(205,205,205,0.18)] backdrop-blur-[10.5px]"
    >
      <div className="space-y-5">
        <h2 className="text-[19px] font-semibold text-sub">Basic</h2>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
          <label className="block">
            <span className={labelClassName}>Loan amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.loanAmount}
              onChange={(event) => onChange('loanAmount', event.target.value)}
              className={inputClassName}
              placeholder="100000"
            />
          </label>

          <label className="block">
            <span className={labelClassName}>Interest rate</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.interestRate}
              onChange={(event) => onChange('interestRate', event.target.value)}
              className={inputClassName}
              placeholder="8.5"
            />
          </label>

          <label className="block">
            <span className={labelClassName}>Compound</span>
            <select
              value={form.compound}
              onChange={(event) => onChange('compound', event.target.value as BusinessLoanFormState['compound'])}
              className={`${inputClassName} pr-10`}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semi-annually">Semi-annually</option>
              <option value="annually">Annually</option>
            </select>
          </label>

          <label className="block">
            <span className={labelClassName}>Loan term</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.loanTerm}
              onChange={(event) => onChange('loanTerm', event.target.value)}
              className={inputClassName}
              placeholder="5"
            />
          </label>

          <label className="block">
            <span className={labelClassName}>Pay back</span>
            <select
              value={form.payBack}
              onChange={(event) => onChange('payBack', event.target.value as BusinessLoanFormState['payBack'])}
              className={`${inputClassName} pr-10`}
            >
              <option value="monthly">Monthly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>

          <label className="block">
            <span className={labelClassName}>Origination fee</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.originationFee}
              onChange={(event) => onChange('originationFee', event.target.value)}
              className={inputClassName}
              placeholder="2"
            />
            <span className="mt-1 block text-xs text-body">Enter a percent like `2` or a flat amount over `100`.</span>
          </label>

          <label className="block">
            <span className={labelClassName}>Documentation fee</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.documentationFee}
              onChange={(event) => onChange('documentationFee', event.target.value)}
              className={inputClassName}
              placeholder="450"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className={labelClassName}>Other fees</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.otherFees}
              onChange={(event) => onChange('otherFees', event.target.value)}
              className={inputClassName}
              placeholder="300"
            />
          </label>
        </div>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

        <div className="grid grid-cols-2 gap-[15px] pt-1">
          <button
            type="submit"
            disabled={isCalculating}
            className="rounded-[8px] bg-[#22c55e] px-[14px] py-[9px] text-[16px] font-medium text-white shadow-[0px_4px_4px_rgba(205,205,205,0.32)] transition hover:bg-[#16a34a] disabled:cursor-not-allowed disabled:bg-[#86efac]"
          >
            {isCalculating ? 'Calculating…' : 'Calculate'}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-[8px] border border-[#e1e6ef] bg-white px-[14px] py-[9px] text-[16px] font-medium text-[#1d2433] shadow-[0px_4px_4px_rgba(205,205,205,0.32)] transition hover:bg-[#f8fafc]"
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  )
}
