import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import MutualFundForm, { type MutualFundFormState } from '../components/calculators/MutualFundForm'
import MutualFundResults from '../components/calculators/MutualFundResults'
import { calculate, schema, type MutualFundInputs, type MutualFundResults as MutualFundResult } from '../../backend/calculations/mutualFund'
import EllipseBackground from '../components/EllipseBackground'

const initialForm: MutualFundFormState = {
  initialInvestment: '10000',
  annualContribution: '3000',
  monthlyContribution: '250',
  rateOfReturn: '8',
  holdingLength: '180',
  holdingUnit: 'months',
  salesCharge: '2.5',
  deferredSalesCharge: '1',
  operatingExpenses: '0.85'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildInputs(form: MutualFundFormState): MutualFundInputs {
  return {
    initialInvestment: Math.max(0, toNumber(form.initialInvestment)),
    annualContribution: Math.max(0, toNumber(form.annualContribution)),
    monthlyContribution: Math.max(0, toNumber(form.monthlyContribution)),
    rateOfReturn: Math.max(0, toNumber(form.rateOfReturn)),
    holdingLength: Math.max(0, toNumber(form.holdingLength)),
    holdingUnit: form.holdingUnit,
    salesCharge: Math.max(0, toNumber(form.salesCharge)),
    deferredSalesCharge: Math.max(0, toNumber(form.deferredSalesCharge)),
    operatingExpenses: Math.max(0, toNumber(form.operatingExpenses))
  }
}

const initialResult = (() => {
  const parsed = schema.safeParse(buildInputs(initialForm))
  return parsed.success ? calculate(parsed.data) : null
})()

export default function MutualFundPage() {
  const [form, setForm] = useState<MutualFundFormState>(initialForm)
  const [result, setResult] = useState<MutualFundResult | null>(initialResult)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = useMemo(() => buildInputs(form), [form])

  const handleChange = <K extends keyof MutualFundFormState>(field: K, value: MutualFundFormState[K]) => {
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
      const response = await axios.post<{ results: MutualFundResult }>(apiUrl('/api/calculators/mutual-fund'), {
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

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[180px] pt-[131px] xl:min-h-[1160px] xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / Mutual Fund Calculator</p>

        <h1 className="mt-2 max-w-[586px] text-[48px] font-semibold leading-[1.1] text-heading">Mutual Fund Calculator</h1>
        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          The mutual fund calculator can be used to estimate the ending balance and net return of mutual funds. It can also calculate the internal rate of return (IRR) after accounting for charges and fees.
        </p>

        <div className="mt-8 xl:relative xl:min-h-[760px]">
          <div className="xl:absolute xl:left-0 xl:top-[108px] xl:w-[476px]">
            <MutualFundForm
              form={form}
              onChange={handleChange}
              onSubmit={handleCalculate}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calculateError}
            />
          </div>

          <div className="mt-8 max-w-[516px] xl:absolute xl:left-[758px] xl:top-[62px] xl:mt-0 xl:w-[516px]">
            <MutualFundResults result={result} />
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/mutual-fund" />
    </>
  )
}
