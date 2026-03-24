import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import RentVsBuyForm, { type RentVsBuyFormState } from '../components/calculators/RentVsBuyForm'
import RentVsBuyResults from '../components/calculators/RentVsBuyResults'
import {
  calculate,
  schema,
  type RentVsBuyInputs,
  type RentVsBuyResults as RentVsBuyResult
} from '../../backend/calculations/rentVsBuy'
import EllipseBackground from '../components/EllipseBackground'

const initialForm: RentVsBuyFormState = {
  homePrice: '500000',
  downPayment: '100000',
  interestRate: '6.25',
  loanTermYears: '30',
  buyingClosingCosts: '15000',
  propertyTax: '6000',
  propertyTaxIncrease: '2',
  homeInsurance: '1800',
  hoaFee: '1200',
  maintenanceCost: '5000',
  homeValueAppreciation: '3',
  costInsuranceIncrease: '2',
  sellingClosingCosts: '6',
  monthlyRent: '2400',
  rentIncreaseRate: '3',
  rentersInsurance: '25',
  securityDeposit: '2400',
  upfrontCost: '500',
  averageInvestmentReturn: '6',
  marginalFederalTaxRate: '12',
  marginalStateTaxRate: '5',
  taxFilingStatus: 'Single'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildInputs(form: RentVsBuyFormState): RentVsBuyInputs {
  return {
    homePrice: Math.max(0, toNumber(form.homePrice)),
    downPayment: Math.max(0, toNumber(form.downPayment)),
    interestRate: Math.max(0, toNumber(form.interestRate)),
    loanTermYears: Math.max(0, Math.round(toNumber(form.loanTermYears))),
    buyingClosingCosts: Math.max(0, toNumber(form.buyingClosingCosts)),
    propertyTax: Math.max(0, toNumber(form.propertyTax)),
    propertyTaxIncrease: Math.max(0, toNumber(form.propertyTaxIncrease)),
    homeInsurance: Math.max(0, toNumber(form.homeInsurance)),
    hoaFee: Math.max(0, toNumber(form.hoaFee)),
    maintenanceCost: Math.max(0, toNumber(form.maintenanceCost)),
    homeValueAppreciation: Math.max(0, toNumber(form.homeValueAppreciation)),
    costInsuranceIncrease: Math.max(0, toNumber(form.costInsuranceIncrease)),
    sellingClosingCosts: Math.max(0, toNumber(form.sellingClosingCosts)),
    monthlyRent: Math.max(0, toNumber(form.monthlyRent)),
    rentIncreaseRate: Math.max(0, toNumber(form.rentIncreaseRate)),
    rentersInsurance: Math.max(0, toNumber(form.rentersInsurance)),
    securityDeposit: Math.max(0, toNumber(form.securityDeposit)),
    upfrontCost: Math.max(0, toNumber(form.upfrontCost)),
    averageInvestmentReturn: Math.max(0, toNumber(form.averageInvestmentReturn)),
    marginalFederalTaxRate: Math.max(0, toNumber(form.marginalFederalTaxRate)),
    marginalStateTaxRate: Math.max(0, toNumber(form.marginalStateTaxRate)),
    taxFilingStatus: form.taxFilingStatus
  }
}

const initialResult = (() => {
  const parsed = schema.safeParse(buildInputs(initialForm))
  return parsed.success ? calculate(parsed.data) : null
})()

export default function RentVsBuyCalculatorPage() {
  const [form, setForm] = useState<RentVsBuyFormState>(initialForm)
  const [result, setResult] = useState<RentVsBuyResult | null>(initialResult)
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
      const response = await axios.post<{ results: RentVsBuyResult }>(apiUrl('/api/calculators/rent-vs-buy'), {
        inputs: parsed.data
      })
      setResult(response.data.results)
    } catch {
      try {
        setResult(calculate(parsed.data))
        setCalculateError('Unable to reach server. Showing local calculation results.')
      } catch (error) {
        setResult(null)
        setCalculateError(error instanceof Error ? error.message : 'Unable to calculate rent vs buy results.')
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

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[180px] pt-[131px] xl:min-h-[1650px] xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / Rent vs. Buy Calculator</p>

        <h1 className="mt-2 max-w-[586px] text-[48px] font-semibold leading-[1.1] text-heading">Rent vs. Buy Calculator</h1>
        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          Should I rent or buy? This calculator evaluates the decision from a purely financial standpoint using assumptions about mortgage costs, appreciation, rent increases, taxes, and investment returns.
        </p>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 xl:grid-cols-[516px_516px] xl:justify-between">
          <div className="w-full max-w-[516px]">
            <RentVsBuyForm
              form={form}
              onChange={(field, value) => setForm((previous) => ({ ...previous, [field]: value }))}
              onSubmit={handleCalculate}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calculateError}
            />
          </div>

          <div className="w-full max-w-[516px] pt-0 xl:pt-8">
            <RentVsBuyResults result={result} />
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/rent-vs-buy" />
    </>
  )
}
