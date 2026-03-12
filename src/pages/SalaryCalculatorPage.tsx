import { FormEvent, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'

const figmaSalaryGraphic = 'https://www.figma.com/api/mcp/asset/345dcc51-ceed-488c-9272-cfce2e451db3'

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

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

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

  const weeksPerYear = 52
  const yearlySalary = salaryAmount
  const monthlySalary = yearlySalary / 12
  const weeklySalary = yearlySalary / weeksPerYear
  const dailySalary = weeklySalary / daysPerWeek
  const hourlySalary = weeklySalary / hoursPerWeek

  const totalDaysOff = holidaysPerYear + vacationDaysPerYear
  const workDaysPerYear = weeksPerYear * daysPerWeek - totalDaysOff
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
    <>
      <section className="relative min-h-[calc(100vh-82px)] overflow-hidden bg-[#f5f7fa]">
        <img
          src={figmaSalaryGraphic}
          alt=""
          aria-hidden
          className="hidden xl:block absolute left-[calc(37.5%+32px)] top-[42px] w-[868px] h-[883px] object-contain pointer-events-none select-none"
        />

        <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-16 pt-[131px] xl:min-h-[1120px] xl:px-0 xl:pb-[140px]">
          <p className="text-[19px] text-sub font-semibold">Home / Finance / Salary Calculator</p>

          <h1 className="mt-[8px] text-[48px] font-semibold leading-[1.1] text-heading">Salary Calculator</h1>
          <p className="mt-[12px] max-w-[586px] text-[16px] leading-[25.6px] text-body">
            The Salary Calculator converts salary amounts to their corresponding values based on payment frequency. Examples of payment frequencies include biweekly, semi-monthly, or monthly payments. Results include unadjusted figures and adjusted figures that account for vacation days and holidays per year.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-8 xl:mt-0 xl:block xl:min-h-[640px]">
            <form
              onSubmit={handleCalculate}
              className="w-full rounded-[28px] border border-cardBorder bg-[#f9fafb] p-5 backdrop-blur-[10.5px] xl:absolute xl:left-0 xl:top-[380px] xl:w-[516px]"
            >
              <h2 className="text-[19px] font-semibold text-heading">Basic info</h2>

              <div className="mt-5 grid grid-cols-1 gap-x-2 gap-y-5 sm:grid-cols-2">
                <div>
                  <p className="text-[16px] font-medium text-sub">Salary amount</p>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.salaryAmount}
                    onChange={(event) => setForm((previous) => ({ ...previous, salaryAmount: event.target.value }))}
                    placeholder="$"
                    className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub"
                  />
                </div>
                <div>
                  <p className="text-[16px] font-medium text-sub">Hours</p>
                  <input
                    type="text"
                    value="Year"
                    readOnly
                    className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-icons"
                  />
                </div>
                <div>
                  <p className="text-[16px] font-medium text-sub">Hours per week</p>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    step="any"
                    value={form.hoursPerWeek}
                    onChange={(event) => setForm((previous) => ({ ...previous, hoursPerWeek: event.target.value }))}
                    placeholder="40"
                    className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub"
                  />
                </div>
                <div>
                  <p className="text-[16px] font-medium text-sub">Days per week</p>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    step="any"
                    value={form.daysPerWeek}
                    onChange={(event) => setForm((previous) => ({ ...previous, daysPerWeek: event.target.value }))}
                    placeholder="5"
                    className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub"
                  />
                </div>
                <div>
                  <p className="text-[16px] font-medium text-sub">Holidays per year</p>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    step="any"
                    value={form.holidaysPerYear}
                    onChange={(event) => setForm((previous) => ({ ...previous, holidaysPerYear: event.target.value }))}
                    placeholder="0"
                    className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub"
                  />
                </div>
                <div>
                  <p className="text-[16px] font-medium text-sub">Vacation days per year</p>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    step="any"
                    value={form.vacationDaysPerYear}
                    onChange={(event) => setForm((previous) => ({ ...previous, vacationDaysPerYear: event.target.value }))}
                    placeholder="0"
                    className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] font-medium text-sub"
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-[15px]">
                <button
                  type="submit"
                  disabled={isCalculating}
                  className="h-[42px] rounded-lg bg-primary text-[16px] font-medium text-white shadow-card"
                >
                  {isCalculating ? 'Calculating...' : 'Calculate'}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-[42px] rounded-lg border border-[#e1e6ef] bg-white text-[16px] font-medium text-[#1d2433] shadow-card"
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

            <div className="w-full xl:absolute xl:left-[758px] xl:top-[276px] xl:w-[516px]">
              <div className="flex flex-col items-center gap-10 overflow-hidden rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
                <div className="flex flex-col items-center gap-[10px] text-center">
                  <p className="text-[16px] font-medium text-sub">Annual Salary</p>
                  <p className="text-[40px] leading-none font-semibold text-heading">{formatCurrency(currentResult.yearlySalary)}</p>
                </div>

                <div className="h-px w-full bg-[#a7f3d0]" />

                <div className="w-full text-center">
                  <h3 className="text-[19px] font-semibold text-heading">Salary Breakdown</h3>
                </div>

                <div className="flex w-full flex-col gap-4 text-[19px]">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-heading">Monthly salary</p>
                    <p className="font-semibold text-heading">{formatCurrency(currentResult.monthlySalary)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-body">Weekly salary</p>
                    <p className="font-semibold text-heading">{formatCurrency(currentResult.weeklySalary)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-body">Daily salary</p>
                    <p className="font-semibold text-heading">{formatCurrency(currentResult.dailySalary)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-body">Hourly wage</p>
                    <p className="font-semibold text-heading">{formatCurrency(currentResult.hourlySalary)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-2">
                    <p className="font-semibold text-heading">Adjusted annual salary</p>
                    <p className="font-semibold text-heading">{formatCurrency(currentResult.adjustedYearlySalary)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-body">Adjusted monthly</p>
                    <p className="font-semibold text-heading">{formatCurrency(currentResult.adjustedMonthlySalary)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-body">Adjusted weekly</p>
                    <p className="font-semibold text-heading">{formatCurrency(currentResult.adjustedWeeklySalary)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-body">Adjusted daily</p>
                    <p className="font-semibold text-heading">{formatCurrency(currentResult.adjustedDailySalary)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-body">Adjusted hourly</p>
                    <p className="font-semibold text-heading">{formatCurrency(currentResult.adjustedHourlySalary)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CalculatorMarketingSections loginRedirectPath="/calculators/salary" />
    </>
  )
}
