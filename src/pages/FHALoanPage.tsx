import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import FHALoanForm, { type FHALoanFormState } from '../components/calculators/FHALoanForm'
import FHALoanResults from '../components/calculators/FHALoanResults'
import {
  calculate,
  schema,
  type FHALoanInputs,
  type FHALoanResults as FHALoanResult
} from '../../backend/calculations/fhaLoan'
import EllipseBackground from '../components/EllipseBackground'

const initialForm: FHALoanFormState = {
  homePrice: '500000',
  downPaymentPercent: '3.5',
  loanTermMonths: '360',
  interestRate: '5.25',
  upfrontMIPRate: '1.75',
  annualMIPRate: '0.55',
  mipDurationYears: '30',
  propertyTaxRate: '1.2',
  homeInsurance: '2500',
  hoaFee: '0',
  otherCosts: '5000',
  pmiInsurance: '0'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildInputs(form: FHALoanFormState): FHALoanInputs {
  return {
    homePrice: Math.max(0, toNumber(form.homePrice)),
    downPaymentPercent: Math.max(0, toNumber(form.downPaymentPercent)),
    loanTermMonths: Math.max(0, Math.round(toNumber(form.loanTermMonths))),
    interestRate: Math.max(0, toNumber(form.interestRate)),
    upfrontMIPRate: Math.max(0, toNumber(form.upfrontMIPRate)),
    annualMIPRate: Math.max(0, toNumber(form.annualMIPRate)),
    mipDurationYears: Math.max(0, toNumber(form.mipDurationYears)),
    propertyTaxRate: Math.max(0, toNumber(form.propertyTaxRate)),
    homeInsurance: Math.max(0, toNumber(form.homeInsurance)),
    hoaFee: Math.max(0, toNumber(form.hoaFee)),
    otherCosts: Math.max(0, toNumber(form.otherCosts)),
    pmiInsurance: Math.max(0, toNumber(form.pmiInsurance))
  }
}

const initialResult = (() => {
  const parsed = schema.safeParse(buildInputs(initialForm))
  return parsed.success ? calculate(parsed.data) : null
})()

export default function FHALoanPage() {
  const [form, setForm] = useState<FHALoanFormState>(initialForm)
  const [result, setResult] = useState<FHALoanResult | null>(initialResult)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = useMemo(() => buildInputs(form), [form])
  const fhaWarning = currentInputs.downPaymentPercent < 3.5 ? 'FHA loans typically require at least 3.5% down.' : null

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
      const response = await axios.post<{ results: FHALoanResult }>(apiUrl('/api/calculators/fha-loan'), {
        inputs: parsed.data
      })
      setResult(response.data.results)
    } catch {
      try {
        setResult(calculate(parsed.data))
        setCalculateError('Unable to reach server. Showing local calculation results.')
      } catch (error) {
        setResult(null)
        setCalculateError(error instanceof Error ? error.message : 'Unable to calculate FHA loan results.')
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

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[180px] pt-[131px] xl:min-h-[1665px] xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / FHA Loan Calculator</p>

        <h1 className="mt-2 max-w-[586px] text-[48px] font-semibold leading-[1.1] text-heading">FHA Loan Calculator</h1>
        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          FHA loans are mortgages insured by the Federal Housing Administration. Use this calculator to estimate your monthly payment,
          mortgage insurance, and the long-term cost of financing an FHA-backed home purchase.
        </p>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 xl:grid-cols-[476px_458px] xl:justify-between">
          <div className="w-full max-w-[476px]">
            <FHALoanForm
              form={form}
              onChange={(field, value) => setForm((previous) => ({ ...previous, [field]: value }))}
              onSubmit={handleCalculate}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calculateError}
              fhaWarning={fhaWarning}
            />
          </div>

          <div className="w-full max-w-[459px] xl:pt-[16px]">
            <FHALoanResults result={result} inputs={currentInputs} />
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/fha-loan" />
    </>
  )
}
