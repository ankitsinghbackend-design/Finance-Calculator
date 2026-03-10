import React, { FormEvent, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'

const figmaSalaryGraphic = 'https://www.figma.com/api/mcp/asset/c8850118-8766-4096-bf1a-d6eaf9ae404c'

type SalaryFormState = {
  salaryAmount: string
  hoursPerWeek: string
  daysPerWeek: string
  holidaysPerYear: string
  vacationDaysPerYear: string
}

type SalaryResult = {
  yearlySalary: number
  monthlySalary: number
  weeklySalary: number
  dailySalary: number
  hourlySalary: number
  adjustedYearlySalary: number
  adjustedMonthlySalary: number
  adjustedWeeklySalary: number
  adjustedDailySalary: number
  adjustedHourlySalary: number
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const round2 = (v: number): number => Math.round((v + Number.EPSILON) * 100) / 100

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value)

const initialForm: SalaryFormState = {
  salaryAmount: '80000',
  hoursPerWeek: '40',
  daysPerWeek: '5',
  holidaysPerYear: '10',
  vacationDaysPerYear: '15'
}

const calculateSalaryLocal = (inputs: {
  salaryAmount: number
  hoursPerWeek: number
  daysPerWeek: number
  holidaysPerYear: number
  vacationDaysPerYear: number
}): SalaryResult => {
  const {
    salaryAmount,
    hoursPerWeek = 40,
    daysPerWeek = 5,
    holidaysPerYear = 0,
    vacationDaysPerYear = 0
  } = inputs

  const WEEKS_PER_YEAR = 52

  const yearlySalary = salaryAmount
  const monthlySalary = yearlySalary / 12
  const weeklySalary = yearlySalary / WEEKS_PER_YEAR
  const dailySalary = weeklySalary / daysPerWeek
  const hourlySalary = weeklySalary / hoursPerWeek

  const totalDaysOff = holidaysPerYear + vacationDaysPerYear
  const workDaysPerYear = WEEKS_PER_YEAR * daysPerWeek - totalDaysOff

  const adjustedYearlySalary = dailySalary * workDaysPerYear
  const adjustedMonthlySalary = adjustedYearlySalary / 12
  const adjustedDailySalary = workDaysPerYear > 0 ? adjustedYearlySalary / workDaysPerYear : 0
  const adjustedWeeklySalary = adjustedDailySalary * daysPerWeek
  const adjustedHourlySalary = adjustedDailySalary * (daysPerWeek / hoursPerWeek)

  return {
    yearlySalary: round2(yearlySalary),
    monthlySalary: round2(monthlySalary),
    weeklySalary: round2(weeklySalary),
    dailySalary: round2(dailySalary),
    hourlySalary: round2(hourlySalary),
    adjustedYearlySalary: round2(adjustedYearlySalary),
    adjustedMonthlySalary: round2(adjustedMonthlySalary),
    adjustedWeeklySalary: round2(adjustedWeeklySalary),
    adjustedDailySalary: round2(adjustedDailySalary),
    adjustedHourlySalary: round2(adjustedHourlySalary)
  }
}

export default function SalaryCalculatorPage() {
  const [form, setForm] = useState<SalaryFormState>(initialForm)
  const [result, setResult] = useState<SalaryResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculateError, setCalculateError] = useState<string | null>(null)

  const currentResult =
    result ??
    calculateSalaryLocal({
      salaryAmount: Math.max(0, toNumber(form.salaryAmount)),
      hoursPerWeek: Math.min(168, Math.max(1, toNumber(form.hoursPerWeek))),
      daysPerWeek: Math.min(7, Math.max(1, toNumber(form.daysPerWeek))),
      holidaysPerYear: Math.min(365, Math.max(0, toNumber(form.holidaysPerYear))),
      vacationDaysPerYear: Math.min(365, Math.max(0, toNumber(form.vacationDaysPerYear)))
    })

  const handleCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCalculateError(null)

    const inputs = {
      salaryAmount: Math.max(0, toNumber(form.salaryAmount)),
      hoursPerWeek: Math.min(168, Math.max(1, toNumber(form.hoursPerWeek))),
      daysPerWeek: Math.min(7, Math.max(1, toNumber(form.daysPerWeek))),
      holidaysPerYear: Math.min(365, Math.max(0, toNumber(form.holidaysPerYear))),
      vacationDaysPerYear: Math.min(365, Math.max(0, toNumber(form.vacationDaysPerYear)))
    }

    try {
      setIsCalculating(true)
      const response = await axios.post<{ results: SalaryResult }>(apiUrl('/api/calculators/salary'), {
        inputs
      })
      setResult(response.data.results)
    } catch {
      setResult(calculateSalaryLocal(inputs))
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
    <section className="bg-[#f5f7fa] relative overflow-hidden min-h-[calc(100vh-82px)]">
      {/* Hero graphic — page-level background decoration */}
      <img
        src={figmaSalaryGraphic}
        alt=""
        aria-hidden
        className="hidden xl:block absolute left-[calc(37.5%+32px)] top-[42px] w-[868px] h-[883px] object-contain pointer-events-none select-none"
      />

      <div className="max-w-[1360px] mx-auto px-6 xl:px-0 pt-[131px] pb-12 relative z-10 xl:min-h-[1014px]">
        <p className="text-[19px] text-sub font-semibold">Home / Finance / Salary Calculator</p>

        <h1 className="text-[48px] leading-[1.1] font-semibold text-heading mt-[8px]">Salary Calculator</h1>
        <p className="text-[16px] leading-[25.6px] text-body mt-[12px] max-w-[586px]">
          The Salary Calculator converts salary amounts to their corresponding values based on payment frequency. Examples of payment frequencies include biweekly, semi-monthly, or monthly payments. Results include unadjusted figures and adjusted figures that account for vacation days and holidays per year.
        </p>

        <div className="mt-8 xl:mt-0 xl:relative xl:min-h-[760px]">
          <form onSubmit={handleCalculate} className="bg-[#f9fafb] border border-cardBorder rounded-[28px] p-5 xl:absolute xl:left-0 xl:top-[249px] xl:w-[516px]">
            <h2 className="text-[19px] font-semibold text-heading">Basic info</h2>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              <div>
                <p className="text-[16px] text-sub font-medium">Salary amount</p>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.salaryAmount}
                  onChange={(e) => setForm((prev) => ({ ...prev, salaryAmount: e.target.value }))}
                  placeholder="$"
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                />
              </div>
              <div>
                <p className="text-[16px] text-sub font-medium">Salary period</p>
                <input
                  type="text"
                  value="Year"
                  readOnly
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-icons font-medium"
                />
              </div>
              <div>
                <p className="text-[16px] text-sub font-medium">Hours per week</p>
                <input
                  type="number"
                  min="1"
                  max="168"
                  step="any"
                  value={form.hoursPerWeek}
                  onChange={(e) => setForm((prev) => ({ ...prev, hoursPerWeek: e.target.value }))}
                  placeholder="40"
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                />
              </div>
              <div>
                <p className="text-[16px] text-sub font-medium">Days per week</p>
                <input
                  type="number"
                  min="1"
                  max="7"
                  step="any"
                  value={form.daysPerWeek}
                  onChange={(e) => setForm((prev) => ({ ...prev, daysPerWeek: e.target.value }))}
                  placeholder="5"
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                />
              </div>
              <div>
                <p className="text-[16px] text-sub font-medium">Holidays per year</p>
                <input
                  type="number"
                  min="0"
                  max="365"
                  step="any"
                  value={form.holidaysPerYear}
                  onChange={(e) => setForm((prev) => ({ ...prev, holidaysPerYear: e.target.value }))}
                  placeholder="0"
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                />
              </div>
              <div>
                <p className="text-[16px] text-sub font-medium">Vacation days per year</p>
                <input
                  type="number"
                  min="0"
                  max="365"
                  step="any"
                  value={form.vacationDaysPerYear}
                  onChange={(e) => setForm((prev) => ({ ...prev, vacationDaysPerYear: e.target.value }))}
                  placeholder="0"
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                />
              </div>
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

          {/* Right column — Result card */}
          <div className="mt-8 xl:mt-0 xl:absolute xl:left-[758px] xl:top-[145px] xl:w-[516px]">
            <div className="bg-[#f9fafb] border border-cardBorder rounded-[16px] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)] flex flex-col gap-10 items-center">
            <div className="text-center flex flex-col gap-[10px]">
              <p className="text-[16px] font-medium text-sub">Annual Salary</p>
              <p className="text-[40px] leading-none font-semibold text-heading">
                {formatCurrency(currentResult.yearlySalary)}
              </p>
            </div>

            <div className="h-px bg-[#a7f3d0] w-full" />

            <div className="flex flex-col gap-4 w-full text-[19px]">
              <div className="flex items-center justify-between"><p className="text-body font-medium">Monthly Salary</p><p className="text-heading font-semibold">{formatCurrency(currentResult.monthlySalary)}</p></div>
              <div className="flex items-center justify-between"><p className="text-body font-medium">Weekly Salary</p><p className="text-heading font-semibold">{formatCurrency(currentResult.weeklySalary)}</p></div>
              <div className="flex items-center justify-between"><p className="text-body font-medium">Daily Salary</p><p className="text-heading font-semibold">{formatCurrency(currentResult.dailySalary)}</p></div>
              <div className="flex items-center justify-between"><p className="text-body font-medium">Hourly Wage</p><p className="text-heading font-semibold">{formatCurrency(currentResult.hourlySalary)}</p></div>
            </div>

            <div className="flex flex-col gap-4 w-full text-[19px]">
              <div className="flex items-center justify-between gap-4"><p className="text-heading font-semibold">Adjusted Annual Salary (after vacation & holidays)</p><p className="text-heading font-semibold whitespace-nowrap">{formatCurrency(currentResult.adjustedYearlySalary)}</p></div>
              <div className="flex items-center justify-between"><p className="text-body font-medium">Adjusted Monthly Salary</p><p className="text-heading font-semibold">{formatCurrency(currentResult.adjustedMonthlySalary)}</p></div>
              <div className="flex items-center justify-between"><p className="text-body font-medium">Adjusted Weekly Salary</p><p className="text-heading font-semibold">{formatCurrency(currentResult.adjustedWeeklySalary)}</p></div>
              <div className="flex items-center justify-between"><p className="text-body font-medium">Adjusted Daily Salary</p><p className="text-heading font-semibold">{formatCurrency(currentResult.adjustedDailySalary)}</p></div>
              <div className="flex items-center justify-between"><p className="text-body font-medium">Adjusted Hourly Salary</p><p className="text-heading font-semibold">{formatCurrency(currentResult.adjustedHourlySalary)}</p></div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
