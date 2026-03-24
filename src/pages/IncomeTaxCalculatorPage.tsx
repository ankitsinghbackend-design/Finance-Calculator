import React, { FormEvent, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import EllipseBackground from '../components/EllipseBackground'

type FilingStatus = 'single' | 'married' | 'head'
type TaxYear = 2025 | 2026

type IncomeTaxFormState = {
  income: string
  filingStatus: FilingStatus
  youngDependents: string
  otherDependents: string
  taxYear: TaxYear
}

type IncomeTaxResult = {
  income: number
  taxBeforeCredits: number
  credits: number
  taxOwed: number
  effectiveRate: number
  netIncome: number
}

const initialForm: IncomeTaxFormState = {
  income: '85000',
  filingStatus: 'single',
  youngDependents: '1',
  otherDependents: '0',
  taxYear: 2026
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

const formatPercent = (value: number): string => `${(value * 100).toFixed(2)}%`

export default function IncomeTaxCalculatorPage() {
  const [form, setForm] = useState<IncomeTaxFormState>(initialForm)
  const [result, setResult] = useState<IncomeTaxResult | null>(null)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = {
    income: Math.max(0, toNumber(form.income)),
    filingStatus: form.filingStatus,
    youngDependents: Math.max(0, Math.round(toNumber(form.youngDependents))),
    otherDependents: Math.max(0, Math.round(toNumber(form.otherDependents))),
    taxYear: form.taxYear
  }

  const handleCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCalculateError(null)

    try {
      setIsCalculating(true)

      const response = await axios.post<{ results: IncomeTaxResult }>(apiUrl('/api/calculators/income-tax'), {
        inputs: currentInputs
      })

      setResult(response.data.results)
    } catch {
      setResult(null)
      setCalculateError('Unable to calculate tax right now. Please try again.')
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
        <p className="text-[19px] text-sub font-semibold">Home / Finance / Income Tax Calculator</p>

        <h1 className="text-[48px] leading-[1.1] font-semibold text-heading mt-2 max-w-[520px]">
          Income Tax Calculator
        </h1>

        <p className="text-[16px] leading-[25.6px] text-body mt-3 max-w-[586px]">
          The Income Tax Calculator estimates the refund or potential owed amount on a federal tax return. It is mainly intended for residents of the U.S. and is based on the tax brackets of 2025 and 2026. The tax values can be used for 1040-ES estimation, planning ahead, or comparison.
        </p>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[516px_516px] justify-between gap-8 items-start">
          <form
            onSubmit={handleCalculate}
            className="border border-cardBorder rounded-[28px] p-5 bg-[#f9fafb]"
          >
            <h2 className="text-[19px] font-semibold text-heading">Basic info</h2>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              <div>
                <p className="text-[16px] text-sub font-medium">Income</p>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={form.income}
                  onChange={(e) => setForm((prev) => ({ ...prev, income: e.target.value }))}
                  placeholder="$"
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                />
              </div>

              <div>
                <p className="text-[16px] text-sub font-medium">No. of Young Dependents</p>
                <input
                  type="number"
                  min="0"
                  value={form.youngDependents}
                  onChange={(e) => setForm((prev) => ({ ...prev, youngDependents: e.target.value }))}
                  placeholder="Year"
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                />
              </div>

              <div>
                <p className="text-[16px] text-sub font-medium">No. of Other Dependents</p>
                <input
                  type="number"
                  min="0"
                  value={form.otherDependents}
                  onChange={(e) => setForm((prev) => ({ ...prev, otherDependents: e.target.value }))}
                  placeholder="Months"
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                />
              </div>

              <div>
                <p className="text-[16px] text-sub font-medium">Filing Status</p>
                <select
                  value={form.filingStatus}
                  onChange={(e) => setForm((prev) => ({ ...prev, filingStatus: e.target.value as FilingStatus }))}
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="head">Head of Household</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[19px] font-semibold text-heading">Tax Year</p>
              <div className="mt-3 flex flex-col gap-3 text-[16px] text-sub font-medium">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="taxYear"
                    checked={form.taxYear === 2026}
                    onChange={() => setForm((prev) => ({ ...prev, taxYear: 2026 }))}
                    className="h-4 w-4 border border-cardBorder text-primary focus:ring-primary"
                  />
                  2026 (return filed in 2027)
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="taxYear"
                    checked={form.taxYear === 2025}
                    onChange={() => setForm((prev) => ({ ...prev, taxYear: 2025 }))}
                    className="h-4 w-4 border border-cardBorder text-primary focus:ring-primary"
                  />
                  2025 (return filed in 2026)
                </label>
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

          <div className="xl:-mt-[56px]">
            <div className="bg-[#f9fafb] border border-cardBorder rounded-[16px] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)] flex flex-col gap-10 items-center min-h-[402px]">
              <div className="text-center flex flex-col gap-[10px]">
                <p className="text-[16px] font-medium text-sub">Estimated Federal Tax</p>
                <p className="text-[40px] leading-none font-semibold text-heading">
                  {result ? formatCurrency(result.taxOwed) : '—'}
                </p>
              </div>

              <div className="h-px bg-[#a7f3d0] w-full" />

              <div className="w-full text-center">
                <h3 className="text-[19px] font-semibold text-heading">Tax Summary</h3>
              </div>

              {result ? (
                <div className="flex flex-col gap-4 w-full text-[19px]">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-heading font-semibold">Gross Income</p>
                    <p className="text-heading font-semibold">{formatCurrency(result.income)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-body font-medium">Tax Before Credits</p>
                    <p className="text-sub font-semibold">{formatCurrency(result.taxBeforeCredits)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-body font-medium">Tax Credits</p>
                    <p className="text-sub font-semibold">{formatCurrency(result.credits)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-heading font-semibold">Final Tax Owed</p>
                    <p className="text-heading font-semibold">{formatCurrency(result.taxOwed)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-body font-medium">Effective Tax Rate</p>
                    <p className="text-sub font-semibold">{formatPercent(result.effectiveRate)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-heading font-semibold">Net Income After Tax</p>
                    <p className="text-heading font-semibold">{formatCurrency(result.netIncome)}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full flex-1 flex items-center justify-center text-center text-sub text-[16px] leading-[25.6px] px-6">
                  Click Calculate to view your estimated federal tax, credits, effective rate, and after-tax income.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/income-tax" />
    </>
  )
}