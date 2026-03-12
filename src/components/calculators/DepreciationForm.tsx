import type { FormEvent } from 'react'
import type { DepreciationInputs } from '../../../backend/calculations/depreciation'

export type DepreciationFormState = {
  method: DepreciationInputs['method']
  assetCost: string
  salvageValue: string
  depreciationYears: string
  depreciationFactor: string
  roundToDollars: boolean
  partialYearDepreciation: boolean
}

type DepreciationFormProps = {
  form: DepreciationFormState
  onChange: <K extends keyof DepreciationFormState>(field: K, value: DepreciationFormState[K]) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClear: () => void
  isCalculating: boolean
  error: string | null
}

const inputClassName =
  'h-[42px] w-full rounded-[6px] border border-[#e5e7eb] bg-[#f9fafb] px-3 text-[16px] font-medium text-[#111827] outline-none transition focus:border-[#22c55e] focus:ring-2 focus:ring-[#bbf7d0]'

const labelClassName = 'text-[16px] font-medium text-sub'

const radioOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false }
] as const

export default function DepreciationForm({
  form,
  onChange,
  onSubmit,
  onClear,
  isCalculating,
  error
}: DepreciationFormProps) {
  return (
    <form
    onSubmit={onSubmit}
    className="self-start rounded-[28px] border border-[#e5e7eb] bg-[#f9fafb] p-4 shadow-[0px_2px_6px_rgba(205,205,205,0.18)] backdrop-blur-[10.5px]"
    >
      <div className="space-y-5">
        <div>
          <h2 className="text-[19px] font-semibold text-sub">Basic</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-4">
          <label className="block">
            <span className={labelClassName}>Depreciation method</span>
            <select
              value={form.method}
              onChange={(event) => onChange('method', event.target.value as DepreciationFormState['method'])}
              className={`${inputClassName} pr-10`}
            >
              <option value="straight-line">Straight line</option>
              <option value="declining-balance">Declining balance</option>
              <option value="sum-of-years-digits">Sum of years&apos; digits</option>
            </select>
          </label>

          <label className="block">
            <span className={labelClassName}>Asset cost</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.assetCost}
              onChange={(event) => onChange('assetCost', event.target.value)}
              className={inputClassName}
              placeholder="25000"
            />
          </label>

          <label className="block">
            <span className={labelClassName}>Salvage value</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.salvageValue}
              onChange={(event) => onChange('salvageValue', event.target.value)}
              className={inputClassName}
              placeholder="2500"
            />
          </label>

          <label className="block">
            <span className={labelClassName}>Depreciation years</span>
            <input
              type="number"
              min="0.01"
              step={form.partialYearDepreciation ? '0.01' : '1'}
              value={form.depreciationYears}
              onChange={(event) => onChange('depreciationYears', event.target.value)}
              className={inputClassName}
              placeholder="5"
            />
          </label>
        </div>

        {form.method === 'declining-balance' ? (
          <label className="block sm:max-w-[calc(50%-8px)]">
            <span className={labelClassName}>Depreciation factor</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.depreciationFactor}
              onChange={(event) => onChange('depreciationFactor', event.target.value)}
              className={inputClassName}
              placeholder="1.5"
            />
          </label>
        ) : null}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-[16px] font-medium text-sub">
            <span>Round to dollars?</span>
            {radioOptions.map((option) => (
              <label key={option.label} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="roundToDollars"
                  checked={form.roundToDollars === option.value}
                  onChange={() => onChange('roundToDollars', option.value)}
                  className="h-4 w-4 border-[#9ca3af] text-[#22c55e] focus:ring-[#86efac]"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[16px] font-medium text-sub">
            <span>Partial year depreciation?</span>
            {radioOptions.map((option) => (
              <label key={option.label} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="partialYearDepreciation"
                  checked={form.partialYearDepreciation === option.value}
                  onChange={() => onChange('partialYearDepreciation', option.value)}
                  className="h-4 w-4 border-[#9ca3af] text-[#22c55e] focus:ring-[#86efac]"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
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
