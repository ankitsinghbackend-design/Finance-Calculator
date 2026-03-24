import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import DownPaymentForm, { type DownPaymentFormState } from '../components/calculators/DownPaymentForm'
import DownPaymentResults from '../components/calculators/DownPaymentResults'
import {
  calculate,
  schema,
  type DownPaymentInputs,
  type DownPaymentResults as DownPaymentResult
} from '../../backend/calculations/downPayment'
import EllipseBackground from '../components/EllipseBackground'

const initialForm: DownPaymentFormState = {
  upfrontCashAvailable: '80000',
  downPaymentAmount: '60000',
  drawPeriod: '12',
  paymentPeriod: '30',
  loanTerm: '30',
  includingClosingCosts: true
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildInputs(form: DownPaymentFormState): DownPaymentInputs {
  return {
    upfrontCashAvailable: Math.max(0, toNumber(form.upfrontCashAvailable)),
    downPaymentAmount: Math.max(0, toNumber(form.downPaymentAmount)),
    drawPeriod: Math.max(0, Math.round(toNumber(form.drawPeriod))),
    paymentPeriod: Math.max(0, toNumber(form.paymentPeriod)),
    loanTerm: Math.max(0, toNumber(form.loanTerm)),
    includingClosingCosts: form.includingClosingCosts
  }
}

const initialResult = (() => {
  const parsed = schema.safeParse(buildInputs(initialForm))
  return parsed.success ? calculate(parsed.data) : null
})()

export default function DownPaymentPage() {
  const [form, setForm] = useState<DownPaymentFormState>(initialForm)
  const [result, setResult] = useState<DownPaymentResult | null>(initialResult)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = useMemo(() => buildInputs(form), [form])

  const handleChange = <K extends keyof DownPaymentFormState>(field: K, value: DownPaymentFormState[K]) => {
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
      const response = await axios.post<{ results: DownPaymentResult }>(apiUrl('/api/calculators/down-payment'), {
        inputs: parsed.data
      })
      setResult(response.data.results)
    } catch {
      try {
        setResult(calculate(parsed.data))
        setCalculateError('Unable to reach server. Showing local calculation results.')
      } catch (error) {
        setResult(null)
        setCalculateError(error instanceof Error ? error.message : 'Unable to calculate down payment results.')
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

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[180px] pt-[131px] xl:min-h-[1181px] xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / Down Payment Calculator</p>

        <h1 className="mt-2 max-w-[586px] text-[48px] font-semibold leading-[1.1] text-heading">Down Payment Calculator</h1>
        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          Use your available liquid cash to estimate a practical down payment amount, optionally reserving funds for closing costs before determining the loan amount and monthly payment.
        </p>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 xl:grid-cols-[476px_516px] xl:justify-between">
          <div className="w-full max-w-[476px]">
            <DownPaymentForm
              form={form}
              onChange={handleChange}
              onSubmit={handleCalculate}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calculateError}
            />
          </div>

          <div className="w-full max-w-[516px]">
            <DownPaymentResults result={result} />
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/down-payment" />
    </>
  )
}
