import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import EllipseBackground from '../components/EllipseBackground'

type MortgageFormState = {
  homePrice: string
  downPaymentPercent: string
  loanTermYears: string
  interestRate: string
  startDate: string
  annualTaxPercent: string
  homeInsurance: string
  pmi: string
  hoa: string
  otherCosts: string
}

type MortgageResult = {
  monthlyMortgagePayment: number
  monthlyPropertyTax: number
  monthlyInsurance: number
  totalMonthlyPayment: number
  totalInterest: number
  totalCost: number
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const round2 = (v: number): number => Math.round((v + Number.EPSILON) * 100) / 100

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

const calculateMortgage = (inputs: {
  homePrice: number
  downPaymentPercent: number
  loanTermYears: number
  interestRate: number
  annualTaxPercent?: number
  homeInsurance?: number
  pmi?: number
  hoa?: number
  otherCosts?: number
}): MortgageResult => {
  const {
    homePrice,
    downPaymentPercent,
    loanTermYears,
    interestRate,
    annualTaxPercent = 0,
    homeInsurance = 0,
    pmi = 0,
    hoa = 0,
    otherCosts = 0
  } = inputs

  const downPayment = homePrice * (downPaymentPercent / 100)
  const loanAmount = homePrice - downPayment
  const monthlyRate = interestRate / 100 / 12
  const totalMonths = loanTermYears * 12

  const monthlyMortgagePayment =
    monthlyRate === 0
      ? loanAmount / totalMonths
      : (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths))

  const monthlyPropertyTax = (homePrice * (annualTaxPercent / 100)) / 12
  const monthlyInsurance = homeInsurance / 12

  const totalMonthlyPayment =
    monthlyMortgagePayment + monthlyPropertyTax + monthlyInsurance + pmi + hoa + otherCosts

  const totalPayments = monthlyMortgagePayment * totalMonths
  const totalInterest = totalPayments - loanAmount

  const totalCost =
    homePrice +
    totalInterest +
    monthlyPropertyTax * totalMonths +
    monthlyInsurance * totalMonths +
    (pmi + hoa + otherCosts) * totalMonths

  return {
    monthlyMortgagePayment: round2(monthlyMortgagePayment),
    monthlyPropertyTax: round2(monthlyPropertyTax),
    monthlyInsurance: round2(monthlyInsurance),
    totalMonthlyPayment: round2(totalMonthlyPayment),
    totalInterest: round2(totalInterest),
    totalCost: round2(totalCost)
  }
}

const initialForm: MortgageFormState = {
  homePrice: '300000',
  downPaymentPercent: '20',
  loanTermYears: '30',
  interestRate: '6.5',
  startDate: '',
  annualTaxPercent: '1.2',
  homeInsurance: '1500',
  pmi: '0',
  hoa: '0',
  otherCosts: '0'
}

export default function MortgageCalculatorPage() {
  const [form, setForm] = useState<MortgageFormState>(initialForm)
  const [result, setResult] = useState<MortgageResult | null>(null)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const totalMonths = useMemo(() => Math.max(1, Math.round(toNumber(form.loanTermYears) * 12)), [form.loanTermYears])

  const annualOtherCosts = useMemo(() => {
    const monthlyOther = toNumber(form.pmi) + toNumber(form.hoa) + toNumber(form.otherCosts)
    return monthlyOther * 12
  }, [form.pmi, form.hoa, form.otherCosts])

  const downPaymentAmount = useMemo(
    () => (toNumber(form.homePrice) * toNumber(form.downPaymentPercent)) / 100,
    [form.homePrice, form.downPaymentPercent]
  )

  const handleCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCalculateError(null)

    const inputs = {
      homePrice: Math.max(0, toNumber(form.homePrice)),
      downPaymentPercent: Math.max(0, toNumber(form.downPaymentPercent)),
      loanTermYears: Math.max(1, toNumber(form.loanTermYears)),
      interestRate: Math.max(0, toNumber(form.interestRate)),
      annualTaxPercent: Math.max(0, toNumber(form.annualTaxPercent)),
      homeInsurance: Math.max(0, toNumber(form.homeInsurance)),
      pmi: Math.max(0, toNumber(form.pmi)),
      hoa: Math.max(0, toNumber(form.hoa)),
      otherCosts: Math.max(0, toNumber(form.otherCosts))
    }

    try {
      setIsCalculating(true)

      const response = await axios.post<{ results: MortgageResult }>(apiUrl('/api/calculators/mortgage'), {
        inputs
      })

      setResult(response.data.results)
    } catch {
      setResult(calculateMortgage(inputs))
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

  const cardResult = result ??
    calculateMortgage({
      homePrice: Math.max(0, toNumber(form.homePrice)),
      downPaymentPercent: Math.max(0, toNumber(form.downPaymentPercent)),
      loanTermYears: Math.max(1, toNumber(form.loanTermYears)),
      interestRate: Math.max(0, toNumber(form.interestRate)),
      annualTaxPercent: Math.max(0, toNumber(form.annualTaxPercent)),
      homeInsurance: Math.max(0, toNumber(form.homeInsurance)),
      pmi: Math.max(0, toNumber(form.pmi)),
      hoa: Math.max(0, toNumber(form.hoa)),
      otherCosts: Math.max(0, toNumber(form.otherCosts))
    })

  const monthlyOtherCosts = toNumber(form.pmi) + toNumber(form.hoa) + toNumber(form.otherCosts)

  return (
    <>
    <section className="bg-[#f5f7fa] relative overflow-hidden">
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

      <div className="max-w-[1360px] mx-auto px-6 xl:px-0 pt-12 pb-12 relative z-10">
        <p className="text-[19px] text-sub font-semibold">Home / Finance / Mortgage Calculator</p>

        <h1 className="text-[48px] leading-[1.1] font-semibold text-heading mt-2">Mortgage Calculator</h1>
        <p className="text-[16px] leading-[25.6px] text-body mt-3 max-w-[586px]">
          The Mortgage Calculator helps estimate the monthly payment due along with other financial costs associated with mortgages.
        </p>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[516px_516px] justify-between gap-8 items-start">
          {/* Left column — Form */}
          <form
            onSubmit={handleCalculate}
            className="border border-cardBorder rounded-[28px] p-5 bg-[#f9fafb]"
          >
            <h2 className="text-[19px] font-semibold text-heading">Mortgage Calculator</h2>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              {[
                { label: 'Home Price', key: 'homePrice', placeholder: '$0' },
                { label: 'Downpayment', key: 'downPaymentPercent', placeholder: '%' },
                { label: 'Loan Term', key: 'loanTermYears', placeholder: "year's" },
                { label: 'Interest Rate', key: 'interestRate', placeholder: '%' }
              ].map((field) => (
                <div key={field.key}>
                  <p className="text-[16px] text-sub font-medium">{field.label}</p>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={form[field.key as keyof MortgageFormState]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                  />
                </div>
              ))}
            </div>

            <div className="mt-2">
              <p className="text-[16px] text-sub font-medium">Start Date</p>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                className="h-[42px] mt-1.5 w-full sm:w-[233px] rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
              />
            </div>

            <h3 className="text-[19px] font-semibold text-heading mt-4">Include Taxes & Cost Below</h3>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              {[
                { label: 'Annual Tax & Cost', key: 'annualTaxPercent', placeholder: '%' },
                { label: 'Home Insurance', key: 'homeInsurance', placeholder: '$' },
                { label: 'PMI Insurance', key: 'pmi', placeholder: '$0' },
                { label: 'HOA Fee', key: 'hoa', placeholder: '$0' }
              ].map((field) => (
                <div key={field.key}>
                  <p className="text-[16px] text-sub font-medium">{field.label}</p>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={form[field.key as keyof MortgageFormState]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                  />
                </div>
              ))}
            </div>

            <div className="mt-2">
              <p className="text-[16px] text-sub font-medium">Other Costs</p>
              <input
                type="number"
                step="any"
                min="0"
                value={form.otherCosts}
                onChange={(e) => setForm((prev) => ({ ...prev, otherCosts: e.target.value }))}
                placeholder="$0"
                className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
              />
            </div>

            <p className="mt-4 text-[19px] font-semibold text-heading text-center">+More Options</p>

            <div className="mt-4 grid grid-cols-2 gap-[15px]">
              <button
                type="submit"
                disabled={isCalculating}
                className="h-[42px] rounded-lg bg-primary text-white text-[16px] font-medium shadow-card"
              >
                {isCalculating ? 'Calculating...' : 'Calculate'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="h-[42px] rounded-lg bg-white border border-[#e1e6ef] text-[#1d2433] text-[16px] font-medium shadow-card"
              >
                Clear
              </button>
            </div>

            {calculateError ? (
              <p className="mt-3 text-sm text-red-600" role="status" aria-live="polite">
                {calculateError}
              </p>
            ) : null}
          </form>

          {/* Right column — Result card (starts 51px higher than form per Figma) */}
          <div className="xl:-mt-[51px]">
            <div className="bg-[#f9fafb] border border-cardBorder rounded-[16px] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)] flex flex-col gap-10 items-center">
              <div className="text-center flex flex-col gap-[10px]">
                <p className="text-[16px] font-medium text-sub">Total Monthly Payment</p>
                <p className="text-[40px] leading-none font-semibold text-heading">
                  <span className="text-sub">$</span>
                  <span>{' '}{cardResult.totalMonthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </p>
              </div>

              <div className="h-px bg-[#a7f3d0] w-full" />

              <div className="w-full">
                <h3 className="text-[19px] font-semibold text-heading">Mortgage Payment</h3>
              </div>

              <div className="flex flex-col gap-4 w-full text-[19px]">
                <div className="flex items-center justify-between">
                  <p className="text-heading font-semibold">Monthly</p>
                  <p className="text-heading font-semibold">{formatCurrency(cardResult.monthlyMortgagePayment)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-body font-medium">Property Tax</p>
                  <p className="text-sub font-semibold">{formatCurrency(cardResult.monthlyPropertyTax)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-body font-medium">Home Insurance</p>
                  <p className="text-sub font-semibold">{formatCurrency(cardResult.monthlyInsurance)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-body font-medium">Other Costs</p>
                  <p className="text-sub font-semibold">{formatCurrency(monthlyOtherCosts)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-heading font-semibold">Total Out-of-Pocket</p>
                  <p className="text-heading font-semibold">{formatCurrency(cardResult.totalMonthlyPayment)}</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full text-[19px]">
                <div className="flex items-center justify-between">
                  <p className="text-heading font-semibold">Total</p>
                  <p className="text-heading font-semibold">{formatCurrency(cardResult.totalCost)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-body font-medium">Property Tax</p>
                  <p className="text-sub font-semibold">{formatCurrency(cardResult.monthlyPropertyTax * totalMonths)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-body font-medium">Home Insurance</p>
                  <p className="text-sub font-semibold">{formatCurrency(cardResult.monthlyInsurance * totalMonths)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-body font-medium">Other Costs</p>
                  <p className="text-sub font-semibold">{formatCurrency(annualOtherCosts * (totalMonths / 12))}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-heading font-semibold">Total Out-of-Pocket</p>
                  <p className="text-heading font-semibold">{formatCurrency(cardResult.totalCost + downPaymentAmount)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/mortgage" />
    </>
  )
}
