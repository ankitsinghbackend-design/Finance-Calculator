import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import heroGraphicSvg from '../assets/hero-graphic.svg'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import HouseAffordabilityForm, {
  type HouseAffordabilityFormState
} from '../components/calculators/HouseAffordabilityForm'
import HouseAffordabilityResults from '../components/calculators/HouseAffordabilityResults'
import {
  calculate,
  schema,
  type HouseAffordabilityInputs,
  type HouseAffordabilityResults as HouseAffordabilityResult,
  type HouseAffordabilityDTIType
} from '../../backend/calculations/houseAffordability'

const initialForm: HouseAffordabilityFormState = {
  annualIncome: '120000',
  mortgageTermYears: '30',
  interestRate: '6.25',
  monthlyDebtPayments: '600',
  downPaymentPercent: '20',
  propertyTaxRate: '1.5',
  hoaMonthlyFee: '0',
  insuranceAnnual: '2142',
  dtiRatioType: 'conventional'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const normalizeInputs = (form: HouseAffordabilityFormState): HouseAffordabilityInputs => ({
  annualIncome: Math.max(0, toNumber(form.annualIncome)),
  mortgageTermYears: Math.max(1, toNumber(form.mortgageTermYears)),
  interestRate: Math.max(0, toNumber(form.interestRate)),
  monthlyDebtPayments: Math.max(0, toNumber(form.monthlyDebtPayments)),
  downPaymentPercent: Math.max(0, Math.min(1, toNumber(form.downPaymentPercent) / 100)),
  propertyTaxRate: Math.max(0, toNumber(form.propertyTaxRate) / 100),
  hoaMonthlyFee: Math.max(0, toNumber(form.hoaMonthlyFee)),
  insuranceAnnual: Math.max(0, toNumber(form.insuranceAnnual)),
  dtiRatioType: form.dtiRatioType as HouseAffordabilityDTIType
})

export default function HouseAffordabilityPage() {
  const [form, setForm] = useState<HouseAffordabilityFormState>(initialForm)
  const [result, setResult] = useState<HouseAffordabilityResult | null>(null)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = useMemo(() => normalizeInputs(form), [form])

  const handleCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCalculateError(null)

    const parsed = schema.safeParse(currentInputs)

    if (!parsed.success) {
      setCalculateError('Invalid inputs. Please check your values.')
      return
    }

    try {
      setIsCalculating(true)

      const response = await axios.post<{ results: HouseAffordabilityResult }>(apiUrl('/api/calculators/house-affordability'), {
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
        <p className="text-[19px] text-sub font-semibold">Home / Finance / House Affordability Calculator</p>

        <h1 className="text-[48px] leading-[1.1] font-semibold text-heading mt-2 max-w-[520px]">
          House Affordability
          <br />
          Calculator
        </h1>

        <p className="text-[16px] leading-[25.6px] text-body mt-3 max-w-[586px]">
          Estimate how much house you can afford based on your household income, debt-to-income ratio, mortgage rate, loan term, taxes, insurance, and HOA costs.
        </p>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[516px_516px] justify-between gap-8 items-start">
          <HouseAffordabilityForm
            form={form}
            onChange={(field, value) => setForm((previous) => ({ ...previous, [field]: value }))}
            onSubmit={handleCalculate}
            onClear={handleClear}
            isCalculating={isCalculating}
            error={calculateError}
          />

          <div className="xl:-mt-[56px]">
            <HouseAffordabilityResults result={result} />
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/house-affordability" />
    </>
  )
}
