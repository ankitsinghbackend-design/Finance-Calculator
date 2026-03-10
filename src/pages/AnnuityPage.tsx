import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import AnnuityForm, { type AnnuityFormState } from '../components/calculators/AnnuityForm'
import AnnuityResults from '../components/calculators/AnnuityResults'
import { calculate, schema, type AnnuityInputs, type AnnuityResults as AnnuityResult } from '../../backend/calculations/annuityCalc'

const annuityGraphic = 'https://www.figma.com/api/mcp/asset/4a7c6c18-b268-4f47-a1cc-273e0f67d3d6'

const initialForm: AnnuityFormState = {
  startingPrincipal: '100000',
  annualAddition: '6000',
  monthlyAddition: '250',
  contributionTiming: 'end',
  annualGrowthRate: '6.5',
  yearsToGrow: '15'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildInputs(form: AnnuityFormState): AnnuityInputs {
  return {
    startingPrincipal: Math.max(0, toNumber(form.startingPrincipal)),
    annualAddition: Math.max(0, toNumber(form.annualAddition)),
    monthlyAddition: Math.max(0, toNumber(form.monthlyAddition)),
    contributionTiming: form.contributionTiming,
    annualGrowthRate: Math.max(0, toNumber(form.annualGrowthRate)),
    yearsToGrow: Math.max(1, Math.round(toNumber(form.yearsToGrow)))
  }
}

const initialResult = (() => {
  const parsed = schema.safeParse(buildInputs(initialForm))
  return parsed.success ? calculate(parsed.data) : null
})()

export default function AnnuityPage() {
  const [form, setForm] = useState<AnnuityFormState>(initialForm)
  const [result, setResult] = useState<AnnuityResult | null>(initialResult)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = useMemo(() => buildInputs(form), [form])

  const handleChange = <K extends keyof AnnuityFormState>(field: K, value: AnnuityFormState[K]) => {
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
      const response = await axios.post<{ results: AnnuityResult }>(apiUrl('/api/calculators/annuity'), {
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
    <section className="relative min-h-[calc(100vh-82px)] overflow-hidden bg-[#f5f7fa]">
      <img
        src={annuityGraphic}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[calc(37.5%+32px)] top-[42px] hidden h-[883px] w-[868px] select-none object-contain xl:block"
      />

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[180px] pt-[131px] xl:min-h-[1146px] xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / Annuity Calculator</p>

        <h1 className="mt-2 max-w-[586px] text-[48px] font-semibold leading-[1.1] text-heading">Annuity Calculator</h1>
        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          The Annuity Calculator is intended for use involving the accumulation phase of an annuity and shows growth based on regular deposits. Please use our <span className="underline">Annuity Payout Calculator</span> to determine the income payment phase of an annuity.
        </p>

        <div className="mt-8 xl:relative xl:min-h-[700px]">
          <div className="xl:absolute xl:left-0 xl:top-[111px] xl:w-[476px]">
            <AnnuityForm
              form={form}
              onChange={handleChange}
              onSubmit={handleCalculate}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calculateError}
            />
          </div>

          <div className="mt-8 max-w-[516px] xl:absolute xl:left-[758px] xl:top-[92px] xl:mt-0 xl:w-[516px]">
            <AnnuityResults result={result} />
          </div>
        </div>
      </div>
    </section>
  )
}
