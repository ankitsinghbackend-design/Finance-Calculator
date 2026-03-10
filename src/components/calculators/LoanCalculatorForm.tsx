import React, { FormEvent } from 'react'
import { type LoanMode } from '../../../backend/calculations/loan'

export type LoanFormState = {
  loanAmount: string
  interestRate: string
  loanTermYears: string
  monthlyPayment: string
}

type LoanCalculatorFormProps = {
  mode: LoanMode
  form: LoanFormState
  onModeChange: (mode: LoanMode) => void
  onChange: (field: keyof LoanFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

export default function LoanCalculatorForm({
  mode,
  form,
  onModeChange,
  onChange,
  onSubmit,
  onClear,
  isCalculating,
  error
}: LoanCalculatorFormProps) {
  return (
    <form onSubmit={onSubmit} className="w-full rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5 backdrop-blur-[10.5px]">
      <div className="flex flex-wrap gap-3 border-b border-cardBorder pb-4">
        <TabButton label="Fixed term" isActive={mode === 'fixed-term'} onClick={() => onModeChange('fixed-term')} />
        <TabButton label="Fixed payment" isActive={mode === 'fixed-payment'} onClick={() => onModeChange('fixed-payment')} />
      </div>

      <div className="mt-5">
        <h2 className="text-[19px] font-semibold text-heading">Basic</h2>
        <div className="mt-5 grid grid-cols-1 gap-x-2 gap-y-5 sm:grid-cols-2">
          <Field
            label="Loan amount"
            value={form.loanAmount}
            placeholder="$"
            onChange={(value) => onChange('loanAmount', value)}
          />
          <Field
            label="Interest rate"
            value={form.interestRate}
            placeholder="Year"
            onChange={(value) => onChange('interestRate', value)}
          />
          {mode === 'fixed-term' ? (
            <Field
              label="Loan term"
              value={form.loanTermYears}
              placeholder="Year"
              onChange={(value) => onChange('loanTermYears', value)}
            />
          ) : (
            <Field
              label="Monthly payment"
              value={form.monthlyPayment}
              placeholder="Months"
              onChange={(value) => onChange('monthlyPayment', value)}
            />
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-[15px]">
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
            className="h-[42px] rounded-lg border border-[#e1e6ef] bg-white text-[16px] font-medium text-[#1d2433] shadow-card"
          >
            Clear
          </button>
        </div>

        {error ? (
          <p className="text-sm text-red-600" role="status" aria-live="polite">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  )
}

type FieldProps = {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}

function Field({ label, value, placeholder, onChange }: FieldProps) {
  return (
    <div className="min-w-0">
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

type TabButtonProps = {
  label: string
  isActive: boolean
  onClick: () => void
}

function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full px-4 py-2 text-[16px] font-medium transition-colors',
        isActive ? 'bg-primary text-white shadow-card' : 'bg-white text-sub border border-cardBorder hover:text-heading'
      ].join(' ')}
    >
      {label}
    </button>
  )
}
