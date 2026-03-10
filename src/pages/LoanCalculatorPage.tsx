import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import LoanCalculatorForm, { type LoanFormState } from '../components/calculators/LoanCalculatorForm'
import LoanCalculatorResults from '../components/calculators/LoanCalculatorResults'
import {
  calculate,
  schema,
  type LoanInputs,
  type LoanMode,
  type LoanResults
} from '../../backend/calculations/loan'

const loanGraphic = 'https://www.figma.com/api/mcp/asset/37b04b65-4e48-414f-b473-e374ab287d17'

const initialForm: LoanFormState = {
  loanAmount: '25000',
  interestRate: '6.5',
  loanTermYears: '5',
  monthlyPayment: '500'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildInputs(mode: LoanMode, form: LoanFormState): LoanInputs {
  if (mode === 'fixed-payment') {
    return {
      mode,
      loanAmount: Math.max(0, toNumber(form.loanAmount)),
      interestRate: Math.max(0, toNumber(form.interestRate)),
      loanTermYears: null,
      monthlyPayment: Math.max(0, toNumber(form.monthlyPayment))
    }
  }

  return {
    mode,
    loanAmount: Math.max(0, toNumber(form.loanAmount)),
    interestRate: Math.max(0, toNumber(form.interestRate)),
    loanTermYears: Math.max(1, toNumber(form.loanTermYears)),
    monthlyPayment: null
  }
}

export default function LoanCalculatorPage() {
  const [mode, setMode] = useState<LoanMode>('fixed-term')
  const [form, setForm] = useState<LoanFormState>(initialForm)
  const [result, setResult] = useState<LoanResults | null>(null)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = useMemo(() => buildInputs(mode, form), [mode, form])

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
      const response = await axios.post<{ results: LoanResults }>(apiUrl('/api/calculators/loan'), {
        inputs: parsed.data,
        mode
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
    setMode('fixed-term')
    setResult(null)
    setCalculateError(null)
  }

  return (
    <section className="relative min-h-[calc(100vh-82px)] overflow-hidden bg-[#f5f7fa]">
      <img
        src={loanGraphic}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[calc(37.5%+32px)] top-[105px] hidden h-[883px] w-[868px] select-none object-contain xl:block"
      />

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[200px] pt-[131px] xl:min-h-[1500px] xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / Loan Calculator</p>

        <h1 className="mt-2 text-[48px] font-semibold leading-[1.1] text-heading">Loan Calculator</h1>
        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          Use the simple loan calculator to estimate a fixed monthly payment or determine how long it will take to pay off a loan with a fixed payment. This calculator is designed for straightforward monthly-payment loan planning.
        </p>

        <div className="mt-8 xl:relative xl:min-h-[760px]">
          <div className="xl:absolute xl:left-0 xl:top-[75px] xl:w-[516px]">
            <LoanCalculatorForm
              mode={mode}
              form={form}
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
          </div>

          {result ? (
            <div className="mt-8 max-w-[516px] xl:absolute xl:left-[758px] xl:top-[25px] xl:w-[516px]">
              <LoanCalculatorResults mode={mode} result={result} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
