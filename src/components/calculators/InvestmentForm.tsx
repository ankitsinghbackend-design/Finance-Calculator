import React, { ChangeEvent, FormEvent } from 'react'
import {
  type InvestmentMode,
  type InvestmentInputs
} from '../../../backend/calculations/investment'
import InvestmentTabs from './InvestmentTabs'

export type InvestmentFormState = {
  startingAmount: string
  targetEndAmount: string
  returnRate: string
  investmentYears: string
  compoundFrequency: string
  additionalContribution: string
  contributionFrequency: string
  contributeTiming: 'beginning' | 'end'
}

type InvestmentFormProps = {
  mode: InvestmentMode
  form: InvestmentFormState
  onModeChange: (mode: InvestmentMode) => void
  onChange: (field: keyof InvestmentFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

const frequencyOptions = [
  { value: '1', label: 'Yearly' },
  { value: '2', label: 'Semiannual' },
  { value: '4', label: 'Quarterly' },
  { value: '12', label: 'Monthly' },
  { value: '365', label: 'Daily' }
]

const modeFields: Record<InvestmentMode, Array<{ key: keyof InvestmentFormState; label: string; placeholder: string; type?: 'select' | 'radio' }>> = {
  'end-amount': [
    { key: 'startingAmount', label: 'Starting Amount', placeholder: '$' },
    { key: 'investmentYears', label: 'After', placeholder: 'Year' },
    { key: 'returnRate', label: 'Return Rate', placeholder: '%' },
    { key: 'compoundFrequency', label: 'Compound', placeholder: 'Months', type: 'select' },
    { key: 'additionalContribution', label: 'Additional Contribution', placeholder: '$' },
    { key: 'contributionFrequency', label: 'Contribution Frequency', placeholder: 'Monthly', type: 'select' },
    { key: 'contributeTiming', label: 'Contribute at the', placeholder: '', type: 'radio' }
  ],
  'additional-contribution': [
    { key: 'startingAmount', label: 'Starting Amount', placeholder: '$' },
    { key: 'targetEndAmount', label: 'End Amount', placeholder: '$' },
    { key: 'returnRate', label: 'Return Rate', placeholder: '%' },
    { key: 'investmentYears', label: 'After', placeholder: 'Year' },
    { key: 'compoundFrequency', label: 'Compound', placeholder: 'Months', type: 'select' },
    { key: 'contributionFrequency', label: 'Contribution Frequency', placeholder: 'Monthly', type: 'select' }
  ],
  'return-rate': [
    { key: 'startingAmount', label: 'Starting Amount', placeholder: '$' },
    { key: 'targetEndAmount', label: 'End Amount', placeholder: '$' },
    { key: 'additionalContribution', label: 'Additional Contribution', placeholder: '$' },
    { key: 'investmentYears', label: 'After', placeholder: 'Year' },
    { key: 'compoundFrequency', label: 'Compound', placeholder: 'Months', type: 'select' },
    { key: 'contributionFrequency', label: 'Contribution Frequency', placeholder: 'Monthly', type: 'select' },
    { key: 'contributeTiming', label: 'Contribute at the', placeholder: '', type: 'radio' }
  ],
  'starting-amount': [
    { key: 'targetEndAmount', label: 'End Amount', placeholder: '$' },
    { key: 'investmentYears', label: 'After', placeholder: 'Year' },
    { key: 'returnRate', label: 'Return Rate', placeholder: '%' },
    { key: 'compoundFrequency', label: 'Compound', placeholder: 'Months', type: 'select' },
    { key: 'additionalContribution', label: 'Additional Contribution', placeholder: '$' },
    { key: 'contributionFrequency', label: 'Contribution Frequency', placeholder: 'Monthly', type: 'select' },
    { key: 'contributeTiming', label: 'Contribute at the', placeholder: '', type: 'radio' }
  ],
  'investment-length': [
    { key: 'startingAmount', label: 'Starting Amount', placeholder: '$' },
    { key: 'targetEndAmount', label: 'End Amount', placeholder: '$' },
    { key: 'returnRate', label: 'Return Rate', placeholder: '%' },
    { key: 'compoundFrequency', label: 'Compound', placeholder: 'Months', type: 'select' },
    { key: 'additionalContribution', label: 'Additional Contribution', placeholder: '$' },
    { key: 'contributionFrequency', label: 'Contribution Frequency', placeholder: 'Monthly', type: 'select' },
    { key: 'contributeTiming', label: 'Contribute at the', placeholder: '', type: 'radio' }
  ]
}

export default function InvestmentForm({
  mode,
  form,
  onModeChange,
  onChange,
  onSubmit,
  onClear,
  isCalculating,
  error
}: InvestmentFormProps) {
  const fields = modeFields[mode]

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    onChange(name as keyof InvestmentFormState, value)
  }

  return (
    <form onSubmit={onSubmit} className="border border-cardBorder rounded-[28px] p-5 bg-[#f9fafb]">
      <InvestmentTabs activeTab={mode} onChange={onModeChange} />

      <div className="mt-4 grid grid-cols-1 gap-[10px] sm:grid-cols-2">
        {fields.map((field) => {
          if (field.type === 'select') {
            return (
              <div key={field.key}>
                <p className="text-[16px] text-sub font-medium">{field.label}</p>
                <select
                  name={field.key}
                  value={form[field.key]}
                  onChange={handleInputChange}
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                >
                  {frequencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )
          }

          if (field.type === 'radio') {
            return (
              <div key={field.key} className="sm:col-span-2">
                <p className="text-[16px] text-sub font-medium">{field.label}</p>
                <div className="mt-3 flex flex-col gap-3 text-[16px] text-sub font-medium">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="contributeTiming"
                      checked={form.contributeTiming === 'beginning'}
                      onChange={() => onChange('contributeTiming', 'beginning')}
                      className="h-4 w-4 border border-cardBorder text-primary focus:ring-primary"
                    />
                    Beginning
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="contributeTiming"
                      checked={form.contributeTiming === 'end'}
                      onChange={() => onChange('contributeTiming', 'end')}
                      className="h-4 w-4 border border-cardBorder text-primary focus:ring-primary"
                    />
                    End
                  </label>
                </div>
              </div>
            )
          }

          return (
            <div key={field.key}>
              <p className="text-[16px] text-sub font-medium">{field.label}</p>
              <input
                type="number"
                step="any"
                min="0"
                name={field.key}
                value={form[field.key]}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
              />
            </div>
          )
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-[15px] sm:max-w-[516px]">
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
