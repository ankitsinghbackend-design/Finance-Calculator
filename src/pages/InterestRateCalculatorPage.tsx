import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import heroGraphicSvg from '../assets/hero-graphic.svg'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import InterestRateForm, {
  type InterestRateFormState
} from '../components/calculators/InterestRateForm'
import InterestRateResults from '../components/calculators/InterestRateResults'
import {
  calculate,
  schema,
  type InterestRateInputs,
  type InterestRateResults as InterestRateResultsType
} from '../../backend/calculations/interestRate'

const initialForm: InterestRateFormState = {
  loanAmount: '200000',
  loanTermYears: '15',
  monthlyPayment: '1687.71'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const buildInputs = (form: InterestRateFormState): InterestRateInputs => ({
  loanAmount: Math.max(0, toNumber(form.loanAmount)),
  monthlyPayment: Math.max(0, toNumber(form.monthlyPayment)),
  loanTermYears: Math.max(1, Math.round(toNumber(form.loanTermYears)))
})

export default function InterestRateCalculatorPage() {
  const [form, setForm] = useState<InterestRateFormState>(initialForm)
  const [result, setResult] = useState<InterestRateResultsType | null>(null)
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
      const response = await axios.post<{ results: InterestRateResultsType }>(apiUrl('/api/calculators/interest-rate'), {
        inputs: parsed.data
      })
      setResult(response.data.results)
    } catch {
      try {
        setResult(calculate(parsed.data))
        setCalculateError('Unable to reach server. Showing local calculation results.')
      } catch (error) {
        setResult(null)
        setCalculateError(error instanceof Error ? error.message : 'Unable to calculate the implied interest rate.')
      }
    } finally {
      setIsCalculating(false)
    }
  }

  const handleClear = () => {
    setForm(initialForm)
    setResult(null)
    setCalculateError(null)
  }

  return (
    <>
    <section className="bg-[#f5f7fa] relative overflow-hidden min-h-[calc(100vh-82px)]">
      <img
        src={heroGraphicSvg}
        alt=""
        aria-hidden
        className="hidden xl:block absolute right-0 top-[42px] w-[868px] h-[883px] object-contain pointer-events-none select-none"
      />

      <div className="max-w-[1360px] mx-auto px-6 xl:px-0 pt-12 pb-12 relative z-10">
        <p className="text-[19px] text-sub font-semibold">Home / Finance / Interest Rate Calculator</p>

        <h1 className="text-[48px] leading-[1.1] font-semibold text-heading mt-2 max-w-[540px]">
          Interest Rate Calculator
        </h1>

        <p className="text-[16px] leading-[25.6px] text-body mt-3 max-w-[586px]">
          The Interest Rate Calculator determines real interest rates on loans with fixed terms and monthly payments. For example, it can calculate interest rates in situations where car dealers only provide monthly payment information and total price without including the actual rate on the car loan.
        </p>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[516px_516px] justify-between gap-8 items-start">
          <InterestRateForm
            form={form}
            onChange={(field, value) => setForm((previous) => ({ ...previous, [field]: value }))}
            onSubmit={handleCalculate}
            onClear={handleClear}
            isCalculating={isCalculating}
            error={calculateError}
          />

          <div className="xl:-mt-[56px]">
            <InterestRateResults result={result} />
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/interest-rate" />
    </>
  )
}
