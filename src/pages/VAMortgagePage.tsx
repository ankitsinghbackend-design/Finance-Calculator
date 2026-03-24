import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import VAMortgageForm, { type VAMortgageFormState } from '../components/calculators/VAMortgageForm'
import VAMortgageResults from '../components/calculators/VAMortgageResults'
import {
  calculate,
  schema,
  type VAMortgageInputs,
  type VAMortgageResults as VAMortgageResult
} from '../../backend/calculations/vaMortgage'
import EllipseBackground from '../components/EllipseBackground'

const initialForm: VAMortgageFormState = {
  homePrice: '350000',
  downPaymentPercent: '0',
  loanTermMonths: '360',
  interestRate: '5.75',
  serviceType: 'active-veteran',
  usedVALoanBefore: 'no',
  hasDisability: 'no',
  fundingFeePaymentMethod: 'finance'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildInputs(form: VAMortgageFormState): VAMortgageInputs {
  return {
    homePrice: Math.max(0, toNumber(form.homePrice)),
    downPaymentPercent: Math.max(0, toNumber(form.downPaymentPercent)),
    loanTermMonths: Math.max(0, Math.round(toNumber(form.loanTermMonths))),
    interestRate: Math.max(0, toNumber(form.interestRate)),
    serviceType: form.serviceType,
    usedVALoanBefore: form.usedVALoanBefore === 'yes',
    hasDisability: form.hasDisability === 'yes',
    fundingFeePaymentMethod: form.fundingFeePaymentMethod
  }
}

const initialResult = (() => {
  const parsed = schema.safeParse(buildInputs(initialForm))
  return parsed.success ? calculate(parsed.data) : null
})()

export default function VAMortgagePage() {
  const [form, setForm] = useState<VAMortgageFormState>(initialForm)
  const [result, setResult] = useState<VAMortgageResult | null>(initialResult)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = useMemo(() => buildInputs(form), [form])

  const handleFieldChange = <K extends keyof VAMortgageFormState>(field: K, value: VAMortgageFormState[K]) => {
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
      const response = await axios.post<{ results: VAMortgageResult }>(apiUrl('/api/calculators/va-mortgage'), {
        inputs: parsed.data
      })
      setResult(response.data.results)
    } catch {
      try {
        setResult(calculate(parsed.data))
        setCalculateError('Unable to reach server. Showing local calculation results.')
      } catch (error) {
        setResult(null)
        setCalculateError(error instanceof Error ? error.message : 'Unable to calculate VA mortgage results.')
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

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[180px] pt-[131px] xl:min-h-[1400px] xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / VA Mortgage Calculator</p>

        <h1 className="mt-2 max-w-[586px] text-[48px] font-semibold leading-[1.1] text-heading">VA Mortgage Calculator</h1>
        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          Estimate monthly payments for a VA-backed home loan, including the one-time VA funding fee based on service category,
          prior VA loan usage, disability exemption status, and whether the fee is financed or paid upfront.
        </p>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 xl:grid-cols-[476px_516px] xl:justify-between">
          <div className="w-full max-w-[476px]">
            <VAMortgageForm
              form={form}
              onChange={handleFieldChange}
              onSubmit={handleCalculate}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calculateError}
            />
          </div>

          <div className="w-full max-w-[516px] xl:-mt-[113px]">
            <VAMortgageResults result={result} loanTermMonths={currentInputs.loanTermMonths} />
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/va-mortgage" />
    </>
  )
}
