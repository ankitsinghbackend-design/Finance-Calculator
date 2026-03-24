import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import RothIraForm, { type RothIraFormState } from '../components/calculators/RothIraForm'
import RothIraResults from '../components/calculators/RothIraResults'
import { calculate, schema, type RothIraInputs, type RothIraResults as RothIraResult } from '../../backend/calculations/rothIraCalc'
import EllipseBackground from '../components/EllipseBackground'

const initialForm: RothIraFormState = {
  currentBalance: '25000',
  annualContribution: '7000',
  maximizeContributions: '2025',
  contributionTiming: 'end',
  expectedRateOfReturn: '8',
  currentAge: '30',
  retirementAge: '65',
  marginalTaxRate: '24'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildInputs(form: RothIraFormState): RothIraInputs {
  return {
    currentBalance: Math.max(0, toNumber(form.currentBalance)),
    annualContribution: Math.max(0, toNumber(form.annualContribution)),
    maximizeContributions: Math.max(0, Math.round(toNumber(form.maximizeContributions))),
    contributionTiming: form.contributionTiming,
    expectedRateOfReturn: Math.max(0, toNumber(form.expectedRateOfReturn)),
    currentAge: Math.max(0, Math.round(toNumber(form.currentAge))),
    retirementAge: Math.max(1, Math.round(toNumber(form.retirementAge))),
    marginalTaxRate: Math.max(0, toNumber(form.marginalTaxRate))
  }
}

const initialResult = (() => {
  const parsed = schema.safeParse(buildInputs(initialForm))
  return parsed.success ? calculate(parsed.data) : null
})()

export default function RothIraPage() {
  const [form, setForm] = useState<RothIraFormState>(initialForm)
  const [result, setResult] = useState<RothIraResult | null>(initialResult)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = useMemo(() => buildInputs(form), [form])

  const handleChange = <K extends keyof RothIraFormState>(field: K, value: RothIraFormState[K]) => {
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
      const response = await axios.post<{ results: RothIraResult }>(apiUrl('/api/calculators/roth-ira'), {
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
    <section className="relative min-h-[calc(100vh-82px)] overflow-hidden bg-[#f5f7fa]">
        <EllipseBackground 
          style={{
            top: '29.89px',
            left: '684.89px',
            right: '68.39px',
            transform: 'scaleX(-1) rotate(-90.569deg)',
            width: 'calc(100% - 684.89px - 68.39px)',
            height: 'auto'
          }}
        />

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[180px] pt-[131px] xl:min-h-[1172px] xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / Roth IRA Calculator</p>

        <h1 className="mt-2 max-w-[586px] text-[48px] font-semibold leading-[1.1] text-heading">Roth IRA Calculator</h1>
        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          This calculator estimates the balances of Roth IRA savings and compares them with regular taxable account. It is mainly intended for use by U.S. residents. For calculations or more information concerning other types of IRAs, please visit our <span className="underline">IRA Calculator</span>.
        </p>

        <div className="mt-8 xl:relative xl:min-h-[760px]">
          <div className="xl:absolute xl:left-0 xl:top-[136px] xl:w-[476px]">
            <RothIraForm
              form={form}
              onChange={handleChange}
              onSubmit={handleCalculate}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calculateError}
            />
          </div>

          <div className="mt-8 max-w-[516px] xl:absolute xl:left-[758px] xl:top-[91px] xl:mt-0 xl:w-[516px]">
            <RothIraResults result={result} />
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/roth-ira" />
    </>
  )
}
