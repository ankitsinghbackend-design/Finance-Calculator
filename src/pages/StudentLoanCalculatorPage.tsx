import React, { FormEvent, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import EllipseBackground from '../components/EllipseBackground'

type StudentLoanFormState = {
  loanBalance: string
  annualRate: string
  termMonths: string
}

type StudentLoanResult = {
  monthlyPayment: number
  totalPayments: number
  totalInterest: number
  loanBalance: number
  termMonths: number
  annualRate: number
}

const initialForm: StudentLoanFormState = {
  loanBalance: '200000',
  annualRate: '6.8',
  termMonths: '180'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

const calculateStudentLoan = (inputs: {
  loanBalance: number
  annualRate: number
  termMonths: number
}): StudentLoanResult => {
  const principal = inputs.loanBalance
  const monthlyRate = inputs.annualRate / 100 / 12
  const totalMonths = inputs.termMonths

  const monthlyPayment =
    monthlyRate === 0
      ? principal / totalMonths
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths))

  const totalPayments = monthlyPayment * totalMonths
  const totalInterest = totalPayments - principal

  return {
    monthlyPayment: round2(monthlyPayment),
    totalPayments: round2(totalPayments),
    totalInterest: round2(totalInterest),
    loanBalance: round2(principal),
    termMonths: totalMonths,
    annualRate: round2(inputs.annualRate)
  }
}

export default function StudentLoanCalculatorPage() {
  const [form, setForm] = useState<StudentLoanFormState>(initialForm)
  const [result, setResult] = useState<StudentLoanResult | null>(null)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = {
    loanBalance: Math.max(0, toNumber(form.loanBalance)),
    annualRate: Math.max(0, toNumber(form.annualRate)),
    termMonths: Math.max(1, Math.round(toNumber(form.termMonths)))
  }

  const handleCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCalculateError(null)

    try {
      setIsCalculating(true)

      const response = await axios.post<{ results: StudentLoanResult }>(apiUrl('/api/calculators/student-loan'), {
        inputs: currentInputs
      })

      setResult(response.data.results)
    } catch {
      setResult(calculateStudentLoan(currentInputs))
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

  const cardResult = result ?? calculateStudentLoan(currentInputs)

  return (
    <>
    <section className="bg-[#f5f7fa] relative overflow-hidden min-h-[calc(100vh-82px)]">
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
        <p className="text-[19px] text-sub font-semibold">Home / Finance / Simple Student Loan Calculator</p>

        <h1 className="text-[48px] leading-[1.1] font-semibold text-heading mt-2 max-w-[520px]">
          Simple Student Loan Calculator
        </h1>

        <p className="text-[16px] leading-[25.6px] text-body mt-3 max-w-[586px]">
          Use the calculator below to evaluate the student loan payoff options, as well as the interest to be saved. The remaining balance, monthly payment, and interest rate can be found on the monthly student loan bill.
        </p>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[516px_516px] justify-between gap-8 items-start">
          <form
            onSubmit={handleCalculate}
            className="border border-cardBorder rounded-[28px] p-5 bg-[#f9fafb]"
          >
            <h2 className="text-[19px] font-semibold text-heading">Basic</h2>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              {[
                { label: 'Loan balance', key: 'loanBalance', placeholder: '$', min: '0' },
                { label: 'Interest rate', key: 'annualRate', placeholder: 'Year', min: '0' },
                { label: 'Compound', key: 'termMonths', placeholder: 'Months', min: '1' }
              ].map((field) => (
                <div key={field.key} className={field.key === 'termMonths' ? 'sm:col-span-2 sm:max-w-[233px]' : ''}>
                  <p className="text-[16px] text-sub font-medium">{field.label}</p>
                  <input
                    type="number"
                    step="any"
                    min={field.min}
                    value={form[field.key as keyof StudentLoanFormState]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                  />
                </div>
              ))}
            </div>

            <label className="mt-4 inline-flex items-center gap-2 text-[16px] text-sub font-medium">
              <input
                type="radio"
                checked
                readOnly
                className="h-4 w-4 border border-cardBorder text-primary focus:ring-primary"
              />
              Repay within a fixed time
            </label>

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

          <div className="xl:-mt-[86px]">
            <div className="bg-[#f9fafb] border border-cardBorder rounded-[16px] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)] flex flex-col gap-10 items-center">
              <div className="text-center flex flex-col gap-[10px]">
                <p className="text-[16px] font-medium text-sub">Monthly Loan Payment</p>
                <p className="text-[40px] leading-none font-semibold text-heading">{formatCurrency(cardResult.monthlyPayment)}</p>
              </div>

              <div className="h-px bg-[#a7f3d0] w-full" />

              <div className="w-full text-center">
                <h3 className="text-[19px] font-semibold text-heading">Amortization</h3>
              </div>

              <div className="flex flex-col gap-4 w-full text-[19px]">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-heading font-semibold">Loan Balance</p>
                  <p className="text-heading font-semibold">{formatCurrency(cardResult.loanBalance)}</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-body font-medium">Interest Rate</p>
                  <p className="text-sub font-semibold">{cardResult.annualRate.toFixed(2)}%</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-body font-medium">Loan Term</p>
                  <p className="text-sub font-semibold">{cardResult.termMonths} months</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-body font-medium">Total Payments</p>
                  <p className="text-sub font-semibold">{formatCurrency(cardResult.totalPayments)}</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-heading font-semibold">Total Interest</p>
                  <p className="text-heading font-semibold">{formatCurrency(cardResult.totalInterest)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/student-loan" />
    </>
  )
}