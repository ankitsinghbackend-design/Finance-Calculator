import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import BusinessLoanForm, { type BusinessLoanFormState } from '../components/calculators/BusinessLoanForm'
import BusinessLoanResults from '../components/calculators/BusinessLoanResults'
import {
  calculate,
  schema,
  type BusinessLoanInputs,
  type BusinessLoanResults as BusinessLoanResult
} from '../../backend/calculations/businessLoan'
import EllipseBackground from '../components/EllipseBackground'

const initialForm: BusinessLoanFormState = {
  loanAmount: '100000',
  interestRate: '8.5',
  compound: 'monthly',
  loanTerm: '5',
  payBack: 'monthly',
  originationFee: '2',
  documentationFee: '450',
  otherFees: '300'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildInputs(form: BusinessLoanFormState): BusinessLoanInputs {
  return {
    loanAmount: Math.max(0, toNumber(form.loanAmount)),
    interestRate: Math.max(0, toNumber(form.interestRate)),
    compound: form.compound,
    loanTerm: Math.max(0.01, toNumber(form.loanTerm)),
    payBack: form.payBack,
    originationFee: Math.max(0, toNumber(form.originationFee)),
    documentationFee: Math.max(0, toNumber(form.documentationFee)),
    otherFees: Math.max(0, toNumber(form.otherFees))
  }
}

const initialResult = (() => {
  const parsed = schema.safeParse(buildInputs(initialForm))
  return parsed.success ? calculate(parsed.data) : null
})()

export default function BusinessLoanCalculatorPage() {
  const [form, setForm] = useState<BusinessLoanFormState>(initialForm)
  const [result, setResult] = useState<BusinessLoanResult | null>(initialResult)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = useMemo(() => buildInputs(form), [form])

  const handleChange = <K extends keyof BusinessLoanFormState>(field: K, value: BusinessLoanFormState[K]) => {
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
      const response = await axios.post<{ results: BusinessLoanResult }>(apiUrl('/api/calculators/business-loan'), {
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
      <section className="relative overflow-hidden bg-[#f5f7fa]">
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

        <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[140px] pt-[131px] xl:px-0">
          <p className="text-[19px] font-semibold text-sub">Home / Finance / Business Loan Calculator</p>

          <h1 className="mt-2 max-w-[586px] text-[48px] font-semibold leading-[1.1] text-heading">Business Loan Calculator</h1>
          <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
            The Business Loan Calculator calculates the payback amount and the total costs of a business loan. It also
            takes fees into account to determine the true annual percentage rate, giving borrowers a clearer view of
            the loan&apos;s actual cost.
          </p>

          <div className="mt-10 grid gap-8 xl:grid-cols-[565px_516px] xl:justify-between xl:gap-[120px]">
            <BusinessLoanForm
              form={form}
              onChange={handleChange}
              onSubmit={handleCalculate}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calculateError}
            />

            <BusinessLoanResults result={result} />
          </div>
        </div>
      </section>

      <CalculatorMarketingSections loginRedirectPath="/calculators/business-loan" />
    </>
  )
}
