import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import DepreciationForm, { type DepreciationFormState } from '../components/calculators/DepreciationForm'
import DepreciationResults from '../components/calculators/DepreciationResults'
import {
  calculate,
  schema,
  type DepreciationInputs,
  type DepreciationResults as DepreciationResult
} from '../../backend/calculations/depreciation'

const depreciationGraphic = 'https://www.figma.com/api/mcp/asset/cde2268c-462e-42af-858e-d486cfcfabc9'

const initialForm: DepreciationFormState = {
  method: 'straight-line',
  assetCost: '25000',
  salvageValue: '2500',
  depreciationYears: '5',
  depreciationFactor: '1.5',
  roundToDollars: false,
  partialYearDepreciation: false
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildInputs(form: DepreciationFormState): DepreciationInputs {
  return {
    method: form.method,
    assetCost: Math.max(0, toNumber(form.assetCost)),
    salvageValue: Math.max(0, toNumber(form.salvageValue)),
    depreciationYears: Math.max(0.01, toNumber(form.depreciationYears)),
    depreciationFactor: Math.max(0.01, toNumber(form.depreciationFactor)),
    roundToDollars: form.roundToDollars,
    partialYearDepreciation: form.partialYearDepreciation
  }
}

const initialResult = (() => {
  const parsed = schema.safeParse(buildInputs(initialForm))
  return parsed.success ? calculate(parsed.data) : null
})()

export default function DepreciationCalculatorPage() {
  const [form, setForm] = useState<DepreciationFormState>(initialForm)
  const [result, setResult] = useState<DepreciationResult | null>(initialResult)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = useMemo(() => buildInputs(form), [form])

  const handleChange = <K extends keyof DepreciationFormState>(field: K, value: DepreciationFormState[K]) => {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const handleCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCalculateError(null)

    const parsed = schema.safeParse(currentInputs)

    if (!parsed.success) {
      setResult(null)
      setCalculateError(parsed.error.issues[0]?.message ?? 'Invalid inputs. Please check your values.')
      return
    }

    try {
      setIsCalculating(true)
      const response = await axios.post<{ results: DepreciationResult }>(apiUrl('/api/calculators/depreciation'), {
        inputs: parsed.data
      })
      setResult(response.data.results)
    } catch {
      setResult(calculate(parsed.data))
      setCalculateError('Unable to reach server. Showing local calculation results.')
    } finally {
      setIsCalculating(false)
    }
  }

  const handleClear = () => {
    setForm(initialForm)
    setResult(initialResult)
    setCalculateError(null)
  }

  return (
    <>
      <section className="relative overflow-hidden bg-[#f5f7fa]">
        <img
          src={depreciationGraphic}
          alt=""
          aria-hidden
          className="pointer-events-none absolute left-[calc(37.5%+32px)] top-[42px] hidden h-[883px] w-[868px] select-none object-contain xl:block"
        />

        <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[140px] pt-[131px] xl:px-0">
          <p className="text-[19px] font-semibold text-sub">Home / Finance / Depreciation Calculator</p>

          <h1 className="mt-2 max-w-[586px] text-[48px] font-semibold leading-[1.1] text-heading">Depreciation Calculator</h1>
          <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
            The following calculator is for depreciation calculation in accounting. It takes the straight line,
            declining balance, or sum of the years&apos; digits method. If you are using the double declining balance
            method, select declining balance and set the depreciation factor to 2.
          </p>

          <div className="mt-10 grid gap-8 xl:grid-cols-[565px_516px] xl:justify-between xl:gap-[120px]">
            <DepreciationForm
              form={form}
              onChange={handleChange}
              onSubmit={handleCalculate}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calculateError}
            />

            <DepreciationResults result={result} />
          </div>
        </div>
      </section>

      <CalculatorMarketingSections loginRedirectPath="/calculators/depreciation" />
    </>
  )
}
