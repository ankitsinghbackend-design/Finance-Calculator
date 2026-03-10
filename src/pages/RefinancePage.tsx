import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import RefinanceForm, { type RefinanceFormState } from '../components/calculators/RefinanceForm'
import RefinanceResults from '../components/calculators/RefinanceResults'
import {
  calculate,
  schema,
  type RefinanceInputs,
  type RefinanceResults as RefinanceResult
} from '../../backend/calculations/refinance'

const refinanceGraphic = 'https://www.figma.com/api/mcp/asset/c88911eb-f7ae-4170-b9d7-39bf83cd5bbb'

const initialForm: RefinanceFormState = {
  balanceMode: 'remaining-balance',
  remainingBalance: '250000',
  monthlyPayment: '1850',
  currentInterestRate: '6.75',
  newLoanTerm: '30',
  newInterestRate: '5.75',
  points: '1',
  costsAndFees: '4500'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildInputs(form: RefinanceFormState): RefinanceInputs {
  return {
    balanceMode: form.balanceMode,
    remainingBalance: Math.max(0, toNumber(form.remainingBalance)),
    monthlyPayment: Math.max(0, toNumber(form.monthlyPayment)),
    currentInterestRate: Math.max(0, toNumber(form.currentInterestRate)),
    newLoanTerm: Math.max(0, toNumber(form.newLoanTerm)),
    newInterestRate: Math.max(0, toNumber(form.newInterestRate)),
    points: Math.max(0, toNumber(form.points)),
    costsAndFees: Math.max(0, toNumber(form.costsAndFees))
  }
}

const initialResult = (() => {
  const parsed = schema.safeParse(buildInputs(initialForm))
  return parsed.success ? calculate(parsed.data) : null
})()

export default function RefinancePage() {
  const [form, setForm] = useState<RefinanceFormState>(initialForm)
  const [result, setResult] = useState<RefinanceResult | null>(initialResult)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = useMemo(() => buildInputs(form), [form])
  const currentEstimate = useMemo(() => {
    const parsed = schema.safeParse(currentInputs)
    return parsed.success ? calculate(parsed.data) : null
  }, [currentInputs])
  const warning = currentEstimate && currentEstimate.newLoan.monthlyPay > currentEstimate.currentLoan.monthlyPay
    ? 'Refinance may not be beneficial because the new monthly payment is higher than the current payment.'
    : null

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
      const response = await axios.post<{ results: RefinanceResult }>(apiUrl('/api/calculators/refinance'), {
        inputs: parsed.data
      })
      setResult(response.data.results)
    } catch {
      try {
        setResult(calculate(parsed.data))
        setCalculateError('Unable to reach server. Showing local calculation results.')
      } catch (error) {
        setResult(null)
        setCalculateError(error instanceof Error ? error.message : 'Unable to calculate refinance results.')
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

  const displayResult = result ?? currentEstimate

  return (
    <section className="relative min-h-[calc(100vh-82px)] overflow-hidden bg-[#f5f7fa]">
      <img
        src={refinanceGraphic}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[calc(37.5%+32px)] top-[42px] hidden h-[883px] w-[868px] select-none object-contain xl:block"
      />

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[180px] pt-[131px] xl:min-h-[2037px] xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / Refinance Calculator</p>

        <h1 className="mt-2 max-w-[586px] text-[48px] font-semibold leading-[1.1] text-heading">Refinance Calculator</h1>
        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          The refinance calculator helps compare your current mortgage against a potential new loan by estimating payment changes,
          total interest, upfront refinance costs, and the break-even point to recover those costs.
        </p>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 xl:grid-cols-[516px_516px] xl:justify-between">
          <div className="w-full max-w-[516px]">
            <RefinanceForm
              form={form}
              onChange={(field, value) => setForm((previous) => ({ ...previous, [field]: value }))}
              onSubmit={handleCalculate}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calculateError}
              warning={warning}
            />
          </div>

          <div className="w-full max-w-[516px] xl:pt-[57px]">
            <RefinanceResults result={displayResult} />
          </div>
        </div>
      </div>
    </section>
  )
}
