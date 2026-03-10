import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import heroGraphicSvg from '../assets/hero-graphic.svg'
import { apiUrl } from '../config/api'
import RepaymentCalculatorForm, {
  type RepaymentFormState
} from '../components/calculators/RepaymentCalculatorForm'
import RepaymentCalculatorResults from '../components/calculators/RepaymentCalculatorResults'
import {
  calculate,
  schema,
  type RepaymentMode,
  type RepaymentInputs,
  type RepaymentResults
} from '../../backend/calculations/repayment'

const initialForm: RepaymentFormState = {
  loanBalance: '200000',
  interestRate: '6.8',
  compoundMonths: '12',
  loanTermMonths: '180',
  monthlyPayment: '2500'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const buildInputs = (mode: RepaymentMode, form: RepaymentFormState): RepaymentInputs => {
  const base = {
    loanBalance: Math.max(0, toNumber(form.loanBalance)),
    interestRate: Math.max(0, toNumber(form.interestRate)),
    compoundMonths: Math.max(1, Math.round(toNumber(form.compoundMonths))),
    mode
  } as const

  if (mode === 'monthly-payment') {
    return {
      ...base,
      mode,
      loanTermMonths: Math.max(1, Math.round(toNumber(form.loanTermMonths))),
      monthlyPayment: null
    }
  }

  return {
    ...base,
    mode,
    loanTermMonths: null,
    monthlyPayment: Math.max(0, toNumber(form.monthlyPayment))
  }
}

export default function RepaymentCalculatorPage() {
  const [mode, setMode] = useState<RepaymentMode>('monthly-payment')
  const [form, setForm] = useState<RepaymentFormState>(initialForm)
  const [result, setResult] = useState<RepaymentResults | null>(null)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = useMemo(() => buildInputs(mode, form), [mode, form])

  const handleCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCalculateError(null)

    const parsed = schema.safeParse(currentInputs)

    if (!parsed.success) {
      setCalculateError(parsed.error.issues[0]?.message ?? 'Invalid inputs. Please check your values.')
      return
    }

    try {
      setIsCalculating(true)

      const response = await axios.post<{ results: RepaymentResults }>(apiUrl('/api/calculators/repayment'), {
        mode,
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
    setMode('monthly-payment')
    setResult(null)
    setCalculateError(null)
  }

  return (
    <section className="bg-[#f5f7fa] relative overflow-hidden min-h-[calc(100vh-82px)]">
      <img
        src={heroGraphicSvg}
        alt=""
        aria-hidden
        className="hidden xl:block absolute right-0 top-[42px] w-[868px] h-[883px] object-contain pointer-events-none select-none"
      />

      <div className="max-w-[1360px] mx-auto px-6 xl:px-0 pt-12 pb-12 relative z-10">
        <p className="text-[19px] text-sub font-semibold">Home / Finance / Repayment Calculator</p>

        <h1 className="text-[48px] leading-[1.1] font-semibold text-heading mt-2 max-w-[540px]">
          Repayment Calculator
        </h1>

        <p className="text-[16px] leading-[25.6px] text-body mt-3 max-w-[586px]">
          Estimate the monthly repayment amount or the length of time needed to pay off a loan. Use it for debts such as credit cards, mortgages, auto loans, and personal loans.
        </p>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[516px_516px] justify-between gap-8 items-start">
          <RepaymentCalculatorForm
            form={form}
            mode={mode}
            onModeChange={(nextMode) => {
              setMode(nextMode)
              setResult(null)
              setCalculateError(null)
            }}
            onChange={(field, value) => setForm((previous) => ({ ...previous, [field]: value }))}
            onSubmit={handleCalculate}
            onClear={handleClear}
            isCalculating={isCalculating}
            error={calculateError}
          />

          <div className="xl:-mt-[56px]">
            <RepaymentCalculatorResults
              mode={mode}
              result={result}
              loanTermMonths={mode === 'monthly-payment' ? Math.max(1, Math.round(toNumber(form.loanTermMonths))) : null}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
