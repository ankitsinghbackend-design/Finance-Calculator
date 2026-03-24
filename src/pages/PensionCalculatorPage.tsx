import React, { FormEvent, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import EllipseBackground from '../components/EllipseBackground'

type PensionFormState = {
  retirementAge: string
  lifeExpectancy: string
  lumpSum: string
  investmentReturn: string
  monthlyPension: string
  cola: string
}

type PensionResult = {
  lumpSumFutureValue: number
  totalPension: number
  breakEvenAge: number
  betterOption: 'Lump Sum' | 'Monthly Pension' | 'Equal Value'
}

const initialForm: PensionFormState = {
  retirementAge: '65',
  lifeExpectancy: '85',
  lumpSum: '250000',
  investmentReturn: '6',
  monthlyPension: '2200',
  cola: '2'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

export default function PensionCalculatorPage() {
  const [form, setForm] = useState<PensionFormState>(initialForm)
  const [result, setResult] = useState<PensionResult | null>(null)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = {
    retirementAge: Math.min(80, Math.max(40, Math.round(toNumber(form.retirementAge)))),
    lifeExpectancy: Math.max(41, Math.round(toNumber(form.lifeExpectancy))),
    lumpSum: Math.max(0, toNumber(form.lumpSum)),
    investmentReturn: Math.max(0, toNumber(form.investmentReturn)),
    monthlyPension: Math.max(0, toNumber(form.monthlyPension)),
    cola: Math.max(0, toNumber(form.cola))
  }

  const handleCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCalculateError(null)

    try {
      setIsCalculating(true)

      const response = await axios.post<{ results: PensionResult }>(apiUrl('/api/calculators/pension'), {
        inputs: currentInputs
      })

      setResult(response.data.results)
    } catch {
      setResult(null)
      setCalculateError('Unable to calculate pension values right now. Please try again.')
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
        <p className="text-[19px] text-sub font-semibold">Home / Finance / Pension Calculator</p>

        <h1 className="text-[48px] leading-[1.1] font-semibold text-heading mt-2 max-w-[520px]">
          Pension Calculator
        </h1>

        <p className="text-[16px] leading-[25.6px] text-body mt-3 max-w-[586px]">
          Pension policies can vary with different organizations. Because important pension-related decisions made before retirement cannot be reversed, employees may need to consider them carefully. The following calculations can help evaluate three of the most common situations.
        </p>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[516px_516px] justify-between gap-8 items-start">
          <form
            onSubmit={handleCalculate}
            className="border border-cardBorder rounded-[28px] p-5 bg-[#f9fafb]"
          >
            <h2 className="text-[19px] font-semibold text-heading">Basic info</h2>

            <div className="mt-3 space-y-4">
              <div>
                <p className="text-[16px] text-sub font-medium">Your retirement age</p>
                <input
                  type="number"
                  min="40"
                  max="80"
                  value={form.retirementAge}
                  onChange={(e) => setForm((prev) => ({ ...prev, retirementAge: e.target.value }))}
                  placeholder="$"
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                />
              </div>

              <div>
                <p className="text-[16px] text-sub font-medium">Life expectancy</p>
                <input
                  type="number"
                  min="41"
                  value={form.lifeExpectancy}
                  onChange={(e) => setForm((prev) => ({ ...prev, lifeExpectancy: e.target.value }))}
                  placeholder="Year"
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-[19px] font-semibold text-heading">Option 1: lump sum payment</h3>
              <div className="mt-2 space-y-4">
                <div>
                  <p className="text-[16px] text-sub font-medium">Lump sum payment amount</p>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={form.lumpSum}
                    onChange={(e) => setForm((prev) => ({ ...prev, lumpSum: e.target.value }))}
                    placeholder="$"
                    className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                  />
                </div>
                <div>
                  <p className="text-[16px] text-sub font-medium">Your investment return match limit</p>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={form.investmentReturn}
                    onChange={(e) => setForm((prev) => ({ ...prev, investmentReturn: e.target.value }))}
                    placeholder="Year"
                    className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-[19px] font-semibold text-heading">Option 2: monthly pension payments</h3>
              <div className="mt-2 space-y-4">
                <div>
                  <p className="text-[16px] text-sub font-medium">Monthly pension income</p>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={form.monthlyPension}
                    onChange={(e) => setForm((prev) => ({ ...prev, monthlyPension: e.target.value }))}
                    placeholder="$"
                    className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                  />
                </div>
                <div>
                  <p className="text-[16px] text-sub font-medium">Cost-of-living adjustment</p>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={form.cola}
                    onChange={(e) => setForm((prev) => ({ ...prev, cola: e.target.value }))}
                    placeholder="Year"
                    className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                  />
                </div>
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

          <div className="xl:-mt-[40px]">
            <div className="bg-[#f9fafb] border border-cardBorder rounded-[16px] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)] flex flex-col gap-10 items-center min-h-[402px]">
              <div className="text-center flex flex-col gap-[10px]">
                <p className="text-[16px] font-medium text-sub">Better Option</p>
                <p className="text-[40px] leading-none font-semibold text-heading">
                  {result ? result.betterOption : '—'}
                </p>
              </div>

              <div className="h-px bg-[#a7f3d0] w-full" />

              <div className="w-full text-center">
                <h3 className="text-[19px] font-semibold text-heading">Retirement Comparison</h3>
              </div>

              {result ? (
                <div className="flex flex-col gap-4 w-full text-[19px]">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-heading font-semibold">Lump Sum Future Value</p>
                    <p className="text-heading font-semibold">{formatCurrency(result.lumpSumFutureValue)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-body font-medium">Total Pension Value</p>
                    <p className="text-sub font-semibold">{formatCurrency(result.totalPension)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-body font-medium">Break Even Age</p>
                    <p className="text-sub font-semibold">
                      {Number.isFinite(result.breakEvenAge) ? result.breakEvenAge.toFixed(2) : 'Never'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-heading font-semibold">Monthly Pension</p>
                    <p className="text-heading font-semibold">{formatCurrency(currentInputs.monthlyPension)}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full flex-1 flex items-center justify-center text-center text-sub text-[16px] leading-[25.6px] px-6">
                  Click Calculate to compare the lifetime value of the lump sum and monthly pension options.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/pension" />
    </>
  )
}