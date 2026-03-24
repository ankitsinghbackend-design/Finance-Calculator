import React, { FormEvent, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import EllipseBackground from '../components/EllipseBackground'

type K401FormState = {
  currentAge: string
  retirementAge: string
  currentSalary: string
  salaryIncrease: string
  currentBalance: string
  contributionPercent: string
  employerMatchPercent: string
  employerMatchLimit: string
  expectedReturn: string
  inflationRate: string
  lifeExpectancy: string
}

type K401Result = {
  retirementBalance: number
  totalEmployeeContribution: number
  totalEmployerContribution: number
  totalContribution: number
  investmentGrowth: number
  monthlyIncome: number
  inflationAdjustedBalance: number
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const round2 = (v: number): number => Math.round((v + Number.EPSILON) * 100) / 100

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

const initialForm: K401FormState = {
  currentAge: '30',
  retirementAge: '65',
  currentSalary: '80000',
  salaryIncrease: '3',
  currentBalance: '20000',
  contributionPercent: '10',
  employerMatchPercent: '50',
  employerMatchLimit: '6',
  expectedReturn: '7',
  inflationRate: '3',
  lifeExpectancy: '90'
}

const calculate401kLocal = (inputs: {
  currentAge: number
  retirementAge: number
  currentSalary: number
  salaryIncrease: number
  currentBalance: number
  contributionPercent: number
  employerMatchPercent: number
  employerMatchLimit: number
  expectedReturn: number
  inflationRate: number
  lifeExpectancy: number
}): K401Result => {
  const {
    currentAge,
    retirementAge,
    currentSalary,
    salaryIncrease,
    currentBalance,
    contributionPercent,
    employerMatchPercent,
    employerMatchLimit,
    expectedReturn,
    inflationRate,
    lifeExpectancy
  } = inputs

  let balance = currentBalance
  let salary = currentSalary

  let totalEmployeeContribution = 0
  let totalEmployerContribution = 0

  const yearsToRetirement = Math.max(0, retirementAge - currentAge)

  for (let i = 0; i < yearsToRetirement; i++) {
    const employeeContribution = salary * (contributionPercent / 100)

    const employerMatch =
      Math.min(employeeContribution, salary * (employerMatchLimit / 100)) * (employerMatchPercent / 100)

    const yearlyContribution = employeeContribution + employerMatch

    totalEmployeeContribution += employeeContribution
    totalEmployerContribution += employerMatch

    balance = balance * (1 + expectedReturn / 100) + yearlyContribution
    salary = salary * (1 + salaryIncrease / 100)
  }

  const totalContribution = totalEmployeeContribution + totalEmployerContribution
  const investmentGrowth = balance - totalContribution - currentBalance

  const retirementYears = Math.max(1, lifeExpectancy - retirementAge)
  const monthlyIncome = (balance / retirementYears) / 12

  const inflationAdjustedBalance = balance / Math.pow(1 + inflationRate / 100, yearsToRetirement)

  return {
    retirementBalance: round2(balance),
    totalEmployeeContribution: round2(totalEmployeeContribution),
    totalEmployerContribution: round2(totalEmployerContribution),
    totalContribution: round2(totalContribution),
    investmentGrowth: round2(investmentGrowth),
    monthlyIncome: round2(monthlyIncome),
    inflationAdjustedBalance: round2(inflationAdjustedBalance)
  }
}

export default function K401CalculatorPage() {
  const [form, setForm] = useState<K401FormState>(initialForm)
  const [result, setResult] = useState<K401Result | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculateError, setCalculateError] = useState<string | null>(null)

  const currentResult =
    result ??
    calculate401kLocal({
      currentAge: Math.max(0, toNumber(form.currentAge)),
      retirementAge: Math.max(1, toNumber(form.retirementAge)),
      currentSalary: Math.max(0, toNumber(form.currentSalary)),
      salaryIncrease: Math.max(0, toNumber(form.salaryIncrease)),
      currentBalance: Math.max(0, toNumber(form.currentBalance)),
      contributionPercent: Math.max(0, toNumber(form.contributionPercent)),
      employerMatchPercent: Math.max(0, toNumber(form.employerMatchPercent)),
      employerMatchLimit: Math.max(0, toNumber(form.employerMatchLimit)),
      expectedReturn: Math.max(0, toNumber(form.expectedReturn)),
      inflationRate: Math.max(0, toNumber(form.inflationRate)),
      lifeExpectancy: Math.max(1, toNumber(form.lifeExpectancy))
    })

  const handleCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCalculateError(null)

    const inputs = {
      currentAge: Math.max(0, toNumber(form.currentAge)),
      retirementAge: Math.max(1, toNumber(form.retirementAge)),
      currentSalary: Math.max(0, toNumber(form.currentSalary)),
      salaryIncrease: Math.max(0, toNumber(form.salaryIncrease)),
      currentBalance: Math.max(0, toNumber(form.currentBalance)),
      contributionPercent: Math.max(0, toNumber(form.contributionPercent)),
      employerMatchPercent: Math.max(0, toNumber(form.employerMatchPercent)),
      employerMatchLimit: Math.max(0, toNumber(form.employerMatchLimit)),
      expectedReturn: Math.max(0, toNumber(form.expectedReturn)),
      inflationRate: Math.max(0, toNumber(form.inflationRate)),
      lifeExpectancy: Math.max(1, toNumber(form.lifeExpectancy))
    }

    try {
      setIsCalculating(true)
      const response = await axios.post<{ results: K401Result }>(apiUrl('/api/calculators/401k'), { inputs })
      setResult(response.data.results)
    } catch {
      setResult(calculate401kLocal(inputs))
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
        <p className="text-[19px] text-sub font-semibold">Home / Finance / 401K Calculator</p>

        <h1 className="text-[48px] leading-[1.1] font-semibold text-heading mt-2">401K Calculator</h1>
        <p className="text-[16px] leading-[25.6px] text-body mt-3 max-w-[586px]">
          The 401(k) Calculator can estimate a 401(k) balance at retirement as well as distributions in retirement based on income, contribution percentage, age, salary increase, and investment return. It is mainly intended for use by U.S. residents.
        </p>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[516px_516px] justify-between gap-8 items-start">
          <form onSubmit={handleCalculate} className="border border-cardBorder rounded-[28px] p-5 bg-[#f9fafb]">
            <h2 className="text-[19px] font-semibold text-heading">401K Calculator</h2>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              {[
                { label: 'Current Age', key: 'currentAge' },
                { label: 'Retirement Age', key: 'retirementAge' },
                { label: 'Current Salary', key: 'currentSalary' },
                { label: 'Salary Increase (%)', key: 'salaryIncrease' },
                { label: 'Current Balance', key: 'currentBalance' },
                { label: 'Contribution (%)', key: 'contributionPercent' },
                { label: 'Employer Match (%)', key: 'employerMatchPercent' },
                { label: 'Employer Match Limit (%)', key: 'employerMatchLimit' },
                { label: 'Expected Return (%)', key: 'expectedReturn' },
                { label: 'Inflation Rate (%)', key: 'inflationRate' },
                { label: 'Life Expectancy', key: 'lifeExpectancy' }
              ].map((field) => (
                <div key={field.key} className={field.key === 'lifeExpectancy' ? 'sm:col-span-2' : ''}>
                  <p className="text-[16px] text-sub font-medium">{field.label}</p>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form[field.key as keyof K401FormState]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                  />
                </div>
              ))}
            </div>

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

          {/* Right column — Result card (starts 81px higher than form per Figma) */}
          <div className="xl:-mt-[81px]">
            <div className="bg-[#f9fafb] border border-cardBorder rounded-[16px] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)] flex flex-col gap-10 items-center">
            <div className="text-center flex flex-col gap-[10px]">
              <p className="text-[16px] font-medium text-sub">Projected Retirement Balance</p>
              <p className="text-[40px] leading-none font-semibold text-heading">
                {formatCurrency(currentResult.retirementBalance)}
              </p>
            </div>

            <div className="h-px bg-[#a7f3d0] w-full" />

            <div className="w-full">
              <h3 className="text-[19px] font-semibold text-heading">Retirement Projection</h3>
            </div>

            <div className="flex flex-col gap-4 w-full text-[19px]">
              <div className="flex items-center justify-between"><p className="text-body font-medium">Employee Contributions</p><p className="text-sub font-semibold">{formatCurrency(currentResult.totalEmployeeContribution)}</p></div>
              <div className="flex items-center justify-between"><p className="text-body font-medium">Employer Match</p><p className="text-sub font-semibold">{formatCurrency(currentResult.totalEmployerContribution)}</p></div>
              <div className="flex items-center justify-between"><p className="text-body font-medium">Investment Growth</p><p className="text-sub font-semibold">{formatCurrency(currentResult.investmentGrowth)}</p></div>
              <div className="flex items-center justify-between"><p className="text-heading font-semibold">Total Balance</p><p className="text-heading font-semibold">{formatCurrency(currentResult.retirementBalance)}</p></div>
            </div>

            <div className="flex flex-col gap-4 w-full text-[19px]">
              <div className="flex items-center justify-between"><p className="text-heading font-semibold">Estimated Monthly Income</p><p className="text-heading font-semibold">{formatCurrency(currentResult.monthlyIncome)}</p></div>
              <div className="flex items-center justify-between"><p className="text-heading font-semibold">Inflation Adjusted Value</p><p className="text-heading font-semibold">{formatCurrency(currentResult.inflationAdjustedBalance)}</p></div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/401k" />
    </>
  )
}
