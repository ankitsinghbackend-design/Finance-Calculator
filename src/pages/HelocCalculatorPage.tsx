import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import HelocForm, { type HelocFormState } from '../components/calculators/HelocForm'
import HelocResults from '../components/calculators/HelocResults'
import {
  calculate,
  schema,
  type HelocInputs,
  type HelocResults as HelocResult
} from '../../backend/calculations/heloc'

const helocGraphic = 'https://www.figma.com/api/mcp/asset/7cab7704-a3a4-491a-a6f5-ac7b46820375'

const initialForm: HelocFormState = {
  loanAmount: '250000',
  interestRate: '6.5',
  drawPeriodMonths: '60',
  repaymentPeriodYears: '15',
  includeClosingCosts: false
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildInputs(form: HelocFormState): HelocInputs {
  return {
    loanAmount: Math.max(0, toNumber(form.loanAmount)),
    interestRate: Math.max(0, toNumber(form.interestRate)),
    drawPeriodMonths: Math.max(0, Math.round(toNumber(form.drawPeriodMonths))),
    repaymentPeriodYears: Math.max(0, toNumber(form.repaymentPeriodYears)),
    includeClosingCosts: form.includeClosingCosts
  }
}

const initialResult = (() => {
  const parsed = schema.safeParse(buildInputs(initialForm))
  return parsed.success ? calculate(parsed.data) : null
})()

export default function HelocCalculatorPage() {
  const [form, setForm] = useState<HelocFormState>(initialForm)
  const [result, setResult] = useState<HelocResult | null>(initialResult)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = useMemo(() => buildInputs(form), [form])

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
      const response = await axios.post<{ results: HelocResult }>(apiUrl('/api/calculators/heloc'), {
        inputs: parsed.data
      })
      setResult(response.data.results)
    } catch {
      try {
        setResult(calculate(parsed.data))
        setCalculateError('Unable to reach server. Showing local calculation results.')
      } catch (error) {
        setResult(null)
        setCalculateError(error instanceof Error ? error.message : 'Unable to calculate HELOC results.')
      }
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
      <img
        src={helocGraphic}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[calc(37.5%+32px)] top-[42px] hidden h-[883px] w-[868px] select-none object-contain xl:block"
      />

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[160px] pt-[131px] xl:min-h-[1300px] xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / Home Equity Line of Credit (HELOC) Calculator</p>

        <h1 className="mt-2 max-w-[620px] text-[48px] font-semibold leading-[1.1] text-heading">
          Home Equity Line of Credit (HELOC) Calculator
        </h1>
        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          Estimate the monthly payment for a HELOC by assuming the full credit balance is used and then amortized over the repayment period after the draw phase ends.
        </p>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 xl:grid-cols-[516px_516px] xl:justify-between">
          <div className="xl:pt-[33px]">
            <HelocForm
              form={form}
              onChange={(field, value) => setForm((previous) => ({ ...previous, [field]: value }))}
              onSubmit={handleCalculate}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calculateError}
            />
          </div>

          <div>
            <HelocResults result={result} />
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/heloc" />
    </>
  )
}
