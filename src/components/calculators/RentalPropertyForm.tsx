import React, { FormEvent } from 'react'

export type RentalPropertyFormState = {
  purchasePrice: string
  downPayment: string
  interestRate: string
  useLoan: 'yes' | 'no'
  loanTerm: string
  closingCost: string
  needRepairsPurchase: 'yes' | 'no'
  monthlyRent: string
  rentAnnualIncrease: string
  otherIncome: string
  otherAnnualIncrease: string
  vacancyRate: string
  managementFees: string
  needRepairsIncome: 'yes' | 'no'
  propertyTaxes: string
  propertyTaxesIncrease: string
  totalInsurance: string
  totalInsuranceIncrease: string
  hoaFees: string
  hoaFeesIncrease: string
  valueAppreciation: string
  holdingLength: string
  costToSell: string
  doYouKnowSellPrice: 'yes' | 'no'
}

type RentalPropertyFormProps = {
  form: RentalPropertyFormState
  onChange: (field: keyof RentalPropertyFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

type FieldConfig = {
  key: keyof RentalPropertyFormState
  label: string
  placeholder: string
}

const purchaseFieldsOne: FieldConfig[] = [
  { key: 'purchasePrice', label: 'Purchase Price', placeholder: '$0' },
  { key: 'downPayment', label: 'Down Payment', placeholder: '$0' },
  { key: 'interestRate', label: 'Interest Rate', placeholder: '%' }
]
const purchaseFieldsTwo: FieldConfig[] = [
  { key: 'loanTerm', label: 'Loan Term', placeholder: 'Years' },
  { key: 'closingCost', label: 'Closing Cost', placeholder: '$0' }
]

const incomeFields: FieldConfig[] = [
  { key: 'monthlyRent', label: 'Monthly Rent', placeholder: '$0' },
  { key: 'rentAnnualIncrease', label: 'Annual Increase', placeholder: '%' },
  { key: 'otherIncome', label: 'Other Monthly Income', placeholder: '$0' },
  { key: 'otherAnnualIncrease', label: 'Annual Increase', placeholder: '%' },
  { key: 'vacancyRate', label: 'Vacancy Rate', placeholder: '%' },
  { key: 'managementFees', label: 'Management Fees', placeholder: '$0' }
]

const expenseFields: FieldConfig[] = [
  { key: 'propertyTaxes', label: 'Property Taxes', placeholder: '$0' },
  { key: 'propertyTaxesIncrease', label: 'Annual Increase', placeholder: '%' },
  { key: 'totalInsurance', label: 'Total Insurance', placeholder: '$0' },
  { key: 'totalInsuranceIncrease', label: 'Annual Increase', placeholder: '%' },
  { key: 'hoaFees', label: 'HOA Fees', placeholder: '$0' },
  { key: 'hoaFeesIncrease', label: 'Annual Increase', placeholder: '%' }
]

const sellFields: FieldConfig[] = [
  { key: 'valueAppreciation', label: 'Value Appreciation', placeholder: '%' },
  { key: 'holdingLength', label: 'Holding Length', placeholder: 'Years' },
  { key: 'costToSell', label: 'Cost to Sell', placeholder: '$0' }
]

export default function RentalPropertyForm({ form, onChange, onSubmit, onClear, isCalculating, error }: RentalPropertyFormProps) {
  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5 backdrop-blur-[10.5px]">
      <div className="grid gap-[10px] xl:grid-cols-2">
        <Panel title="Purchase">
          <div className="grid gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-2">
              <Field field={purchaseFieldsOne[0]} value={form.purchasePrice} onChange={onChange} />
              <Field field={purchaseFieldsOne[1]} value={form.downPayment} onChange={onChange} />
            </div>
            <div className="max-w-[233px]">
              <Field field={purchaseFieldsOne[2]} value={form.interestRate} onChange={onChange} />
            </div>
            <RadioGroup label="Use Loan?" value={form.useLoan} onChange={(value) => onChange('useLoan', value)} />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-2">
              {purchaseFieldsTwo.map((field) => (
                <Field key={field.key} field={field} value={form[field.key]} onChange={onChange} />
              ))}
            </div>
            <RadioGroup label="Need Repairs?" value={form.needRepairsPurchase} onChange={(value) => onChange('needRepairsPurchase', value)} />
          </div>
        </Panel>

        <Panel title="Income">
          <div className="grid gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-2">
              {incomeFields.map((field) => (
                <Field key={field.key} field={field} value={form[field.key]} onChange={onChange} />
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Recurring Operating Expenses">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-2">
            {expenseFields.map((field) => (
              <Field key={field.key} field={field} value={form[field.key]} onChange={onChange} />
            ))}
          </div>
        </Panel>

        <Panel title="Sell">
          <div className="grid gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-2">
              <Field field={sellFields[0]} value={form.valueAppreciation} onChange={onChange} />
              <Field field={sellFields[1]} value={form.holdingLength} onChange={onChange} />
            </div>
            <Field field={sellFields[2]} value={form.costToSell} onChange={onChange} />
            <RadioGroup label="Do You Know the Sell Price?" value={form.doYouKnowSellPrice} onChange={(value) => onChange('doYouKnowSellPrice', value)} />
          </div>
        </Panel>
      </div>

      <div className="mt-5 flex w-full max-w-[476px] gap-[15px]">
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[19px] font-semibold text-heading">{title}</p>
      <div className="mt-5">{children}</div>
    </div>
  )
}

function Field({ field, value, onChange }: { field: FieldConfig; value: string; onChange: (field: keyof RentalPropertyFormState, value: string) => void }) {
  return (
    <div>
      <p className="text-[16px] font-medium text-sub">{field.label}</p>
      <input
        type="number"
        min="0"
        step="any"
        value={value}
        onChange={(event) => onChange(field.key, event.target.value)}
        placeholder={field.placeholder}
        className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub"
      />
    </div>
  )
}

function RadioGroup({ label, value, onChange }: { label: string; value: 'yes' | 'no'; onChange: (value: 'yes' | 'no') => void }) {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <p className="text-[16px] font-medium text-sub">{label}</p>
      <label className="flex items-center gap-[6px] text-[16px] font-medium text-sub">
        <input type="radio" name={label} checked={value === 'yes'} onChange={() => onChange('yes')} className="h-5 w-5 accent-primary" />
        Yes
      </label>
      <label className="flex items-center gap-[6px] text-[16px] font-medium text-sub">
        <input type="radio" name={label} checked={value === 'no'} onChange={() => onChange('no')} className="h-5 w-5 accent-primary" />
        No
      </label>
    </div>
  )
}
