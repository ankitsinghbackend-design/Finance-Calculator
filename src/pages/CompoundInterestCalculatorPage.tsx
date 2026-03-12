import React, { FormEvent, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'

type CompoundFrequency = 'yearly' | 'semiannually' | 'quarterly' | 'monthly' | 'weekly' | 'daily'

type CompoundInterestResults = {
  principal: number
  totalContribution: number
  interestEarned: number
  totalValue: number
}

const periodLabel: Record<CompoundFrequency, string> = {
  yearly: 'Yearly',
  semiannually: 'Semiannually',
  quarterly: 'Quarterly',
  monthly: 'Monthly',
  weekly: 'Weekly',
  daily: 'Daily'
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

const heroGraphic = 'https://www.figma.com/api/mcp/asset/300cdbac-5e36-47e4-8a26-8657042939a8'

export default function CompoundInterestCalculatorPage() {
  const [principal, setPrincipal] = useState<string>('10000')
  const [annualRate, setAnnualRate] = useState<string>('8')
  const [years, setYears] = useState<string>('10')
  const [compoundFrequency, setCompoundFrequency] = useState<CompoundFrequency>('monthly')
  const [monthlyContribution, setMonthlyContribution] = useState<string>('100')
  const [result, setResult] = useState<CompoundInterestResults | null>(null)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCalculateError(null)

    const inputs = {
      principal: Math.max(0, Number(principal) || 0),
      annualRate: Math.max(0, Number(annualRate) || 0),
      years: Math.max(0.000001, Number(years) || 0),
      compoundFrequency,
      monthlyContribution: Math.max(0, Number(monthlyContribution) || 0)
    }

    try {
      setIsCalculating(true)
      const response = await axios.post<{ results: CompoundInterestResults }>(
        apiUrl('/api/calculators/compound-interest'),
        { inputs }
      )
      setResult(response.data.results)
    } catch {
      setCalculateError('Unable to calculate right now. Please try again.')
    } finally {
      setIsCalculating(false)
    }
  }

  const handleClear = () => {
    setPrincipal('10000')
    setAnnualRate('8')
    setYears('10')
    setCompoundFrequency('monthly')
    setMonthlyContribution('100')
    setResult(null)
    setCalculateError(null)
  }

  return (
    <>
    <section className="bg-[#f5f7fa] py-12 min-h-[calc(100vh-82px)] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 xl:px-10 relative isolate">
        <img
          src={heroGraphic}
          alt=""
          aria-hidden
          className="hidden xl:block absolute right-[-78px] top-[20px] z-0 w-[868px] h-[883px] object-contain pointer-events-none"
        />

        <div className="relative z-10">
        <p className="text-[19px] text-sub font-semibold">Home / Finance / Compound Interest Calculator</p>
        <h1 className="text-[48px] leading-none font-semibold text-heading mt-3 max-w-[586px]">Compound Interest Calculator</h1>
        <p className="text-[16px] leading-[25.6px] text-body mt-3 max-w-[586px]">
          The Compound Interest Calculator below can be used to compare or convert the interest rates of different compounding periods. Please use our{' '}
          <a href="https://www.calculator.net/interest-calculator.html" className="underline" target="_blank" rel="noopener noreferrer">Interest Calculator</a>{' '}
          to do actual calculations on compound interest.
        </p>

        <div className="relative z-10 mt-8 grid grid-cols-1 xl:grid-cols-[476px_1fr] gap-8 items-start">
          <div className="flex flex-col gap-10 w-full max-w-[476px]">
          <form onSubmit={handleCalculate} className="bg-[#f9fafb] border border-cardBorder rounded-[28px] p-5 backdrop-blur-[10.5px]">
            <p className="text-[19px] font-semibold text-sub">Basic</p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[16px] text-sub font-medium block">Principal Amount</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub font-medium"
                />
              </div>

              <div>
                <label className="text-[16px] text-sub font-medium block">Annual Interest Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(e.target.value)}
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub font-medium"
                />
              </div>

              <div>
                <label className="text-[16px] text-sub font-medium block">Time (Years)</label>
                <input
                  type="number"
                  min="0.000001"
                  step="any"
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub font-medium"
                />
              </div>

              <div>
                <label className="text-[16px] text-sub font-medium block">Compound Frequency</label>
                <select
                  value={compoundFrequency}
                  onChange={(e) => setCompoundFrequency(e.target.value as CompoundFrequency)}
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub font-medium"
                >
                  {Object.entries(periodLabel).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[16px] text-sub font-medium block">Monthly Contribution</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub font-medium"
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-[15px]">
              <button type="submit" disabled={isCalculating} className="h-[37px] rounded-lg bg-primary text-white text-[16px] font-medium shadow-card disabled:opacity-60">
                {isCalculating ? 'Calculating...' : 'Calculate'}
              </button>
              <button type="button" onClick={handleClear} className="h-[37px] rounded-lg bg-white border border-[#e1e6ef] text-[#1d2433] text-[16px] font-medium shadow-card">
                Clear
              </button>
            </div>

            {calculateError ? <p className="mt-3 text-sm text-red-600">{calculateError}</p> : null}
          </form>

          <div className="bg-white border border-cardBorder rounded-[16px] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)] overflow-hidden">
            <div className="text-center">
              <p className="text-[16px] font-medium text-sub">Future Value</p>
              <p className="text-[40px] leading-none font-semibold text-heading mt-3">{result ? formatCurrency(result.totalValue) : '$0.00'}</p>
            </div>

            <div className="h-px bg-[#a7f3d0] my-10" />

            <p className="text-[19px] text-heading font-semibold text-center">Investment Summary</p>
            <div className="mt-8 space-y-4 text-[19px]">
              <div className="flex items-center justify-between gap-4"><span className="text-body font-medium">Initial Investment</span><span className="text-heading font-semibold whitespace-nowrap">{result ? formatCurrency(result.principal) : '-'}</span></div>
              <div className="flex items-center justify-between gap-4"><span className="text-body font-medium">Total Contributions</span><span className="text-heading font-semibold whitespace-nowrap">{result ? formatCurrency(result.totalContribution) : '-'}</span></div>
              <div className="flex items-center justify-between gap-4"><span className="text-body font-medium">Interest Earned</span><span className="text-heading font-semibold whitespace-nowrap">{result ? formatCurrency(result.interestEarned) : '-'}</span></div>
              <div className="flex items-center justify-between gap-4"><span className="text-body font-medium">Total Value</span><span className="text-heading font-semibold whitespace-nowrap">{result ? formatCurrency(result.totalValue) : '-'}</span></div>
            </div>
          </div>
          </div>

          <div className="hidden xl:block min-h-[700px]" />
        </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/compound-interest" />
    </>
  )
}
