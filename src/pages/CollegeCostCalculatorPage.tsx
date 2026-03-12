import React, { FormEvent, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'

type CollegeCostResults = {
  futureAnnualCost: number
  totalCollegeCost: number
  futureSavings: number
  savingsContribution: number
  fundingGap: number
}

const heroGraphic = 'https://www.figma.com/api/mcp/asset/77f24824-ecce-43d4-a66d-ee214c4cb278'

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export default function CollegeCostCalculatorPage() {
  const [currentAnnualCost, setCurrentAnnualCost] = useState<string>('25000')
  const [inflationRate, setInflationRate] = useState<string>('5')
  const [collegeDuration, setCollegeDuration] = useState<string>('4')
  const [savingsPercent, setSavingsPercent] = useState<string>('60')
  const [currentSavings, setCurrentSavings] = useState<string>('10000')
  const [investmentReturn, setInvestmentReturn] = useState<string>('7')
  const [taxRate, setTaxRate] = useState<string>('20')
  const [yearsUntilCollege, setYearsUntilCollege] = useState<string>('10')

  const [result, setResult] = useState<CollegeCostResults | null>(null)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCalculateError(null)

    const inputs = {
      currentAnnualCost: Math.max(0, Number(currentAnnualCost) || 0),
      inflationRate: Math.max(0, Number(inflationRate) || 0),
      collegeDuration: Math.max(1, Number(collegeDuration) || 1),
      savingsPercent: Math.min(100, Math.max(0, Number(savingsPercent) || 0)),
      currentSavings: Math.max(0, Number(currentSavings) || 0),
      investmentReturn: Math.max(0, Number(investmentReturn) || 0),
      taxRate: Math.min(100, Math.max(0, Number(taxRate) || 0)),
      yearsUntilCollege: Math.max(0, Number(yearsUntilCollege) || 0)
    }

    try {
      setIsCalculating(true)
      const response = await axios.post<{ results: CollegeCostResults }>(
        apiUrl('/api/calculators/college-cost'),
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
    setCurrentAnnualCost('25000')
    setInflationRate('5')
    setCollegeDuration('4')
    setSavingsPercent('60')
    setCurrentSavings('10000')
    setInvestmentReturn('7')
    setTaxRate('20')
    setYearsUntilCollege('10')
    setResult(null)
    setCalculateError(null)
  }

  return (
    <>
    <section className="bg-[#f5f7fa] relative overflow-hidden min-h-[calc(100vh-82px)] py-12">
      <div className="max-w-[1440px] mx-auto px-6 xl:px-10 relative isolate">
        <img
          src={heroGraphic}
          alt=""
          aria-hidden
          className="hidden xl:block absolute right-[-78px] top-[-28px] z-0 w-[868px] h-[883px] object-contain pointer-events-none select-none"
        />

        <div className="relative z-10">
        <p className="text-[19px] text-sub font-semibold">Home / Finance / College Cost Calculator</p>
        <h1 className="text-[48px] leading-none font-semibold text-heading mt-3 max-w-[586px]">College Cost Calculator</h1>
        <p className="text-[16px] leading-[25.6px] text-body mt-3 max-w-[586px]">
          The College Cost Calculator can help determine rough estimates of what to expect from college costs, and in turn, how much to begin budgeting for it. To estimate the costs of more specific colleges, the{' '}
          <a href="https://nces.ed.gov/collegenavigator/" className="underline" target="_blank" rel="noopener noreferrer">College Navigator</a>{' '}
          can be used to get more precise annual college costs data. This calculator is mainly intended for use in the U.S.
        </p>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[565px_516px] justify-between gap-8 items-start">
          <form onSubmit={handleCalculate} className="bg-[#f9fafb] border border-cardBorder rounded-[28px] p-5 backdrop-blur-[10.5px]">
            <p className="text-[19px] font-semibold text-sub">Basic</p>

            <div className="mt-5 flex flex-col gap-5">
              {/* First row: two fields side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[16px] text-sub font-medium block">Today's annual college costs:</label>
                  <input type="number" min="0" step="any" value={currentAnnualCost} onChange={(e) => setCurrentAnnualCost(e.target.value)} className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub font-medium" placeholder="$" />
                </div>

                <div>
                  <label className="text-[16px] text-sub font-medium block">Interest rate</label>
                  <input type="number" min="0" step="any" value={inflationRate} onChange={(e) => setInflationRate(e.target.value)} className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub font-medium" placeholder="Year" />
                </div>
              </div>

              {/* Remaining fields: single column full width */}
              <div>
                <label className="text-[16px] text-sub font-medium block">Expected college attendance duration:</label>
                <input type="number" min="1" step="1" value={collegeDuration} onChange={(e) => setCollegeDuration(e.target.value)} className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub font-medium" placeholder="Months" />
              </div>

              <div>
                <label className="text-[16px] text-sub font-medium block">Percent of costs from savings:</label>
                <input type="number" min="0" max="100" step="any" value={savingsPercent} onChange={(e) => setSavingsPercent(e.target.value)} className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub font-medium" placeholder="%" />
              </div>

              <div>
                <label className="text-[16px] text-sub font-medium block">College savings balance now:</label>
                <input type="number" min="0" step="any" value={currentSavings} onChange={(e) => setCurrentSavings(e.target.value)} className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub font-medium" placeholder="$" />
              </div>

              <div>
                <label className="text-[16px] text-sub font-medium block">Interest or investment return rate</label>
                <input type="number" min="0" step="any" value={investmentReturn} onChange={(e) => setInvestmentReturn(e.target.value)} className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub font-medium" placeholder="%" />
              </div>

              <div>
                <label className="text-[16px] text-sub font-medium block">Tax rate on interest or investment return:</label>
                <input type="number" min="0" max="100" step="any" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub font-medium" placeholder="%" />
              </div>

              <div>
                <label className="text-[16px] text-sub font-medium block">College will start in:</label>
                <input type="number" min="0" step="1" value={yearsUntilCollege} onChange={(e) => setYearsUntilCollege(e.target.value)} className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub font-medium" placeholder="Years" />
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

          {/* Right column — Result card (starts 153px higher than form per Figma) */}
          <div className="xl:-mt-[153px] relative z-20">
            <div className="bg-white border border-cardBorder rounded-[16px] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)] flex flex-col gap-10 items-center overflow-hidden">
            <div className="text-center flex flex-col gap-[10px]">
              <p className="text-[16px] font-medium text-sub">Estimated Total College Cost</p>
              <p className="text-[40px] leading-none font-semibold text-heading">{result ? formatCurrency(result.totalCollegeCost) : '$0.00'}</p>
            </div>

            <div className="h-px bg-[#a7f3d0] w-full" />

            <div className="w-full">
              <h3 className="text-[19px] text-heading font-semibold">Cost Summary</h3>
            </div>
            <div className="flex flex-col gap-4 w-full text-[19px]">
              <div className="flex items-center justify-between gap-4"><span className="text-body font-medium">Future Annual Cost</span><span className="text-heading font-semibold whitespace-nowrap">{result ? formatCurrency(result.futureAnnualCost) : '-'}</span></div>
              <div className="flex items-center justify-between gap-4"><span className="text-body font-medium">Total College Cost</span><span className="text-heading font-semibold whitespace-nowrap">{result ? formatCurrency(result.totalCollegeCost) : '-'}</span></div>
              <div className="flex items-center justify-between gap-4"><span className="text-body font-medium">Projected Savings</span><span className="text-heading font-semibold whitespace-nowrap">{result ? formatCurrency(result.futureSavings) : '-'}</span></div>
              <div className="flex items-center justify-between gap-4"><span className="text-body font-medium">Savings Contribution</span><span className="text-heading font-semibold whitespace-nowrap">{result ? formatCurrency(result.savingsContribution) : '-'}</span></div>
              <div className="flex items-center justify-between gap-4"><span className="text-body font-medium">Funding Gap</span><span className="text-heading font-semibold whitespace-nowrap">{result ? formatCurrency(result.fundingGap) : '-'}</span></div>
            </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/college-cost" />
    </>
  )
}
