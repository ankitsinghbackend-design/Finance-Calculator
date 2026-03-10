import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import heroGraphicSvg from '../../assets/hero-graphic.svg'
import { apiUrl } from '../../config/api'
import AutoLoanForm, {
  type AutoLoanFormState,
  type AutoLoanMode,
  type AutoLoanRequestInputs,
  type AutoLoanResult
} from './AutoLoanForm'
import AutoLoanResults from './AutoLoanResults'
import AutoLoanTabs from './AutoLoanTabs'

const initialForm: AutoLoanFormState = {
  autoPrice: '35000',
  desiredMonthlyPayment: '650',
  loanTermMonths: '60',
  interestRate: '6.5',
  cashIncentives: '1500',
  downPayment: '5000',
  tradeInValue: '6000',
  amountOwedOnTradeIn: '1500',
  salesTaxRate: '6.25',
  titleFees: '900'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const calculateMonthlyPayment = (principal: number, totalMonths: number, annualRate: number): number => {
  const monthlyRate = annualRate / 100 / 12

  if (monthlyRate === 0) {
    return principal / totalMonths
  }

  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths))
}

const calculatePrincipalFromPayment = (payment: number, totalMonths: number, annualRate: number): number => {
  const monthlyRate = annualRate / 100 / 12

  if (monthlyRate === 0) {
    return payment * totalMonths
  }

  return payment * ((1 - Math.pow(1 + monthlyRate, -totalMonths)) / monthlyRate)
}

const normalizeInputs = (mode: AutoLoanMode, form: AutoLoanFormState): AutoLoanRequestInputs => {
  const base = {
    loanTermMonths: Math.max(1, Math.round(toNumber(form.loanTermMonths))),
    interestRate: Math.max(0, toNumber(form.interestRate)),
    cashIncentives: Math.max(0, toNumber(form.cashIncentives)),
    downPayment: Math.max(0, toNumber(form.downPayment)),
    tradeInValue: Math.max(0, toNumber(form.tradeInValue)),
    amountOwedOnTradeIn: Math.max(0, toNumber(form.amountOwedOnTradeIn)),
    salesTaxRate: Math.max(0, toNumber(form.salesTaxRate)),
    titleFees: Math.max(0, toNumber(form.titleFees))
  }

  if (mode === 'monthly-payment') {
    return {
      mode,
      autoPrice: Math.max(0, toNumber(form.autoPrice)),
      ...base
    }
  }

  return {
    mode,
    desiredMonthlyPayment: Math.max(0, toNumber(form.desiredMonthlyPayment)),
    ...base
  }
}

const calculateLocalResult = (inputs: AutoLoanRequestInputs): AutoLoanResult => {
  if (inputs.mode === 'monthly-payment') {
    const netVehiclePrice = Math.max(
      0,
      inputs.autoPrice - inputs.cashIncentives - inputs.tradeInValue + inputs.amountOwedOnTradeIn
    )
    const salesTax = Math.max(0, netVehiclePrice * (inputs.salesTaxRate / 100))
    const totalPurchaseCost = netVehiclePrice + salesTax + inputs.titleFees
    const loanAmount = Math.max(0, totalPurchaseCost - inputs.downPayment)
    const monthlyPayment = calculateMonthlyPayment(loanAmount, inputs.loanTermMonths, inputs.interestRate)
    const totalPayments = monthlyPayment * inputs.loanTermMonths
    const totalInterest = Math.max(0, totalPayments - loanAmount)

    return {
      mode: 'monthly-payment',
      vehiclePrice: round2(inputs.autoPrice),
      maximumVehiclePrice: round2(inputs.autoPrice),
      loanAmount: round2(loanAmount),
      monthlyPayment: round2(monthlyPayment),
      desiredMonthlyPayment: round2(monthlyPayment),
      totalPayments: round2(totalPayments),
      totalInterest: round2(totalInterest),
      salesTax: round2(salesTax),
      totalCost: round2(totalPurchaseCost + totalInterest),
      loanTermMonths: inputs.loanTermMonths,
      interestRate: round2(inputs.interestRate),
      downPayment: round2(inputs.downPayment),
      tradeInCredit: round2(inputs.tradeInValue - inputs.amountOwedOnTradeIn),
      titleFees: round2(inputs.titleFees),
      cashIncentives: round2(inputs.cashIncentives)
    }
  }

  const loanAmount = Math.max(
    0,
    calculatePrincipalFromPayment(inputs.desiredMonthlyPayment, inputs.loanTermMonths, inputs.interestRate)
  )
  const netVehiclePrice = Math.max(0, (loanAmount + inputs.downPayment - inputs.titleFees) / (1 + inputs.salesTaxRate / 100))
  const vehiclePrice = Math.max(
    0,
    netVehiclePrice + inputs.cashIncentives + inputs.tradeInValue - inputs.amountOwedOnTradeIn
  )
  const salesTax = Math.max(0, netVehiclePrice * (inputs.salesTaxRate / 100))
  const totalPayments = inputs.desiredMonthlyPayment * inputs.loanTermMonths
  const totalInterest = Math.max(0, totalPayments - loanAmount)

  return {
    mode: 'vehicle-price',
    vehiclePrice: round2(vehiclePrice),
    maximumVehiclePrice: round2(vehiclePrice),
    loanAmount: round2(loanAmount),
    monthlyPayment: round2(inputs.desiredMonthlyPayment),
    desiredMonthlyPayment: round2(inputs.desiredMonthlyPayment),
    totalPayments: round2(totalPayments),
    totalInterest: round2(totalInterest),
    salesTax: round2(salesTax),
    totalCost: round2(netVehiclePrice + salesTax + inputs.titleFees + totalInterest),
    loanTermMonths: inputs.loanTermMonths,
    interestRate: round2(inputs.interestRate),
    downPayment: round2(inputs.downPayment),
    tradeInCredit: round2(inputs.tradeInValue - inputs.amountOwedOnTradeIn),
    titleFees: round2(inputs.titleFees),
    cashIncentives: round2(inputs.cashIncentives)
  }
}

export default function AutoLoanPage() {
  const [activeTab, setActiveTab] = useState<AutoLoanMode>('monthly-payment')
  const [formInputs, setFormInputs] = useState<AutoLoanFormState>(initialForm)
  const [results, setResults] = useState<AutoLoanResult | null>(null)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const normalizedInputs = useMemo(
    () => normalizeInputs(activeTab, formInputs),
    [activeTab, formInputs]
  )

  const handleTabChange = (mode: AutoLoanMode) => {
    setActiveTab(mode)
    setResults(null)
    setCalculateError(null)
  }

  const handleFieldChange = (field: keyof AutoLoanFormState, value: string) => {
    setFormInputs((previous) => ({ ...previous, [field]: value }))
  }

  const handleClear = () => {
    setFormInputs(initialForm)
    setResults(null)
    setCalculateError(null)
    setActiveTab('monthly-payment')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCalculateError(null)

    try {
      setIsCalculating(true)

      const response = await axios.post<{ results: AutoLoanResult }>(apiUrl('/api/calculators/auto-loan'), {
        calculatorId: 'auto-loan',
        mode: activeTab,
        inputs: normalizedInputs
      })

      setResults(response.data.results)
    } catch {
      setResults(calculateLocalResult(normalizedInputs))
      setCalculateError('Unable to reach server. Showing local calculation results.')
    } finally {
      setIsCalculating(false)
    }
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
        <p className="text-[19px] text-sub font-semibold">Home / Finance / Auto Loan Calculator</p>

        <h1 className="text-[48px] leading-[1.1] font-semibold text-heading mt-2 max-w-[520px]">
          Auto Loan Calculator
        </h1>

        <p className="text-[16px] leading-[25.6px] text-body mt-3 max-w-[620px]">
          Estimate your monthly vehicle payment or work backward from a target payment to find the maximum car price that fits your budget. Switch between Monthly Payment and Vehicle Price to compare both purchase scenarios instantly.
        </p>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[516px_516px] justify-between gap-8 items-start">
          <div className="flex flex-col gap-4">
            <AutoLoanTabs activeTab={activeTab} onChange={handleTabChange} />
            <AutoLoanForm
              mode={activeTab}
              form={formInputs}
              onChange={handleFieldChange}
              onSubmit={handleSubmit}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calculateError}
            />
          </div>

          <div className="xl:-mt-[32px]">
            <AutoLoanResults mode={activeTab} result={results} />
          </div>
        </div>
      </div>
    </section>
  )
}
