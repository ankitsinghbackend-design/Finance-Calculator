import React, { FormEvent } from 'react'

export type SocialSecurityFormState = {
  birthYear: string
  lifeExpectancy: string
  investmentReturn: string
  cola: string
  monthlyBenefitFRA: string
  startAge: string
}

type SocialSecurityFormProps = {
  form: SocialSecurityFormState
  onChange: (field: keyof SocialSecurityFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

const fields: Array<{ key: keyof SocialSecurityFormState; label: string; placeholder: string }> = [
  { key: 'birthYear', label: 'Your Birth Year', placeholder: '1960' },
  { key: 'lifeExpectancy', label: 'Your Life Expectancy', placeholder: '85' },
  { key: 'investmentReturn', label: 'Investment Return (%)', placeholder: '6.00' },
  { key: 'cola', label: 'Cost of Living Adjustment (%)', placeholder: '2.00' },
  { key: 'monthlyBenefitFRA', label: 'Monthly Benefit at FRA', placeholder: '$1,900' },
  { key: 'startAge', label: 'Start Age (62–70)', placeholder: '67' }
]

export default function SocialSecurityForm({ form, onChange, onSubmit, onClear, isCalculating, error }: SocialSecurityFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5 backdrop-blur-[10.5px]">
      <div className="space-y-5">
        <div>
          <h2 className="text-[19px] font-semibold text-heading">Basic info</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {fields.map((field) => (
            <div key={field.key}>
              <p className="text-[16px] font-medium text-sub">{field.label}</p>
              <input
                type="number"
                min={field.key === 'birthYear' ? '1900' : '0'}
                step="any"
                value={form[field.key]}
                onChange={(event) => onChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-[15px] pt-[5px]">
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
          <p className="text-sm text-red-600" role="status" aria-live="polite">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  )
}
