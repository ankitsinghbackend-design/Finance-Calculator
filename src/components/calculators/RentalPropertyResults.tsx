import React, { useMemo, useState } from 'react'
import type { RentalPropertyResults as RentalPropertyResult } from '../../../backend/calculations/rentalProperty'

type RentalPropertyResultsProps = {
  result: RentalPropertyResult | null
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

const percentFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export default function RentalPropertyResults({ result }: RentalPropertyResultsProps) {
  const [activeView, setActiveView] = useState<'summary' | 'projection'>('summary')

  const projectionRows = useMemo(() => {
    if (!result) {
      return []
    }

    const targets = [1, 5, 10, 15]
    const available = new Map(result.projections.map((projection) => [projection.year, projection]))
    const selected = targets
      .filter((year) => year <= result.projections.length)
      .map((year) => available.get(year))
      .filter((projection): projection is NonNullable<typeof projection> => Boolean(projection))

    const last = result.projections[result.projections.length - 1]
    if (last && !selected.some((projection) => projection.year === last.year)) {
      selected.push(last)
    }

    return selected
  }, [result])

  if (!result) {
    return (
      <section className="rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-8 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
        <p className="text-[16px] leading-[25.6px] text-body">Enter your investment assumptions to estimate cash flow, returns, and long-term property performance.</p>
      </section>
    )
  }

  const expenseSegments = [
    { label: 'Mortgage', value: result.breakdown.mortgage, color: '#4472c4' },
    { label: 'Taxes', value: result.breakdown.propertyTaxes, color: '#c00000' },
    { label: 'Insurance', value: result.breakdown.insurance, color: '#00b0f0' },
    { label: 'Management + HOA', value: result.breakdown.management + result.breakdown.hoa, color: '#7030a0' }
  ]
  const totalExpenseChart = expenseSegments.reduce((sum, segment) => sum + segment.value, 0)
  let offset = 0
  const circumference = 2 * Math.PI * 50

  return (
    <section className="rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-8 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Badge label="Monthly Cash Flow" value={currencyFormatter.format(result.monthlyCashFlow)} tone={result.monthlyCashFlow >= 0 ? 'positive' : 'negative'} />
        <Badge label="Cap Rate" value={`${percentFormatter.format(result.capRate)}%`} />
        <Badge label="Cash on Cash Return" value={`${percentFormatter.format(result.cashOnCashReturn)}%`} />
        <Badge label="Total ROI" value={`${percentFormatter.format(result.totalROI)}%`} />
      </div>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => setActiveView('summary')}
          className={`rounded-full px-4 py-2 text-[14px] font-medium ${activeView === 'summary' ? 'bg-primary text-white' : 'border border-cardBorder bg-white text-sub'}`}
        >
          Year 1 Summary
        </button>
        <button
          type="button"
          onClick={() => setActiveView('projection')}
          className={`rounded-full px-4 py-2 text-[14px] font-medium ${activeView === 'projection' ? 'bg-primary text-white' : 'border border-cardBorder bg-white text-sub'}`}
        >
          Long-term Projection
        </button>
      </div>

      {activeView === 'summary' ? (
        <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_280px]">
          <div>
            <h3 className="text-[19px] font-semibold text-heading">Year 1 Summary</h3>
            <div className="mt-4 space-y-3">
              <Row label="Gross Monthly Income" value={currencyFormatter.format(result.breakdown.totalIncome)} />
              <Row label="Total Operating Expenses" value={currencyFormatter.format(result.breakdown.totalExpenses)} />
              <Row label="Monthly Mortgage Payment" value={currencyFormatter.format(result.breakdown.mortgage)} />
              <Row label="Estimated Net Income" value={currencyFormatter.format(result.monthlyCashFlow)} emphasized />
            </div>
          </div>

          <div className="rounded-xl border border-cardBorder bg-white p-4">
            <p className="text-[16px] font-medium text-sub">Expense Breakdown</p>
            <div className="mt-4 flex flex-col items-center gap-4">
              <div className="relative flex h-[180px] w-[180px] items-center justify-center">
                <svg viewBox="0 0 140 140" className="h-[180px] w-[180px] -rotate-90">
                  <circle cx="70" cy="70" r="50" fill="none" stroke="#e5e7eb" strokeWidth="18" />
                  {expenseSegments.map((segment) => {
                    const length = totalExpenseChart === 0 ? 0 : (segment.value / totalExpenseChart) * circumference
                    const circle = (
                      <circle
                        key={segment.label}
                        cx="70"
                        cy="70"
                        r="50"
                        fill="none"
                        stroke={segment.color}
                        strokeWidth="18"
                        strokeDasharray={`${length} ${circumference - length}`}
                        strokeDashoffset={-offset}
                      />
                    )
                    offset += length
                    return circle
                  })}
                </svg>
                <div className="absolute text-center">
                  <p className="text-[12px] font-medium text-sub">Expenses</p>
                  <p className="mt-1 text-[18px] font-semibold text-heading">{currencyFormatter.format(result.breakdown.totalExpenses + result.breakdown.mortgage)}</p>
                </div>
              </div>
              <div className="grid w-full gap-2">
                {expenseSegments.map((segment) => (
                  <div key={segment.label} className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-[3px]" style={{ backgroundColor: segment.color }} />
                    <span className="text-[12px] font-medium text-[#003366]">{segment.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <h3 className="text-[19px] font-semibold text-heading">Long-term Projection</h3>
          <div className="mt-4 overflow-x-auto rounded-xl border border-cardBorder bg-white">
            <table className="min-w-full text-left text-[14px]">
              <thead className="bg-[#f3f4f6] text-sub">
                <tr>
                  <th className="px-4 py-3 font-semibold">Year</th>
                  <th className="px-4 py-3 font-semibold">Property Value</th>
                  <th className="px-4 py-3 font-semibold">Equity</th>
                  <th className="px-4 py-3 font-semibold">Cumulative Cash Flow</th>
                </tr>
              </thead>
              <tbody>
                {projectionRows.map((row) => (
                  <tr key={row.year} className="border-t border-cardBorder text-heading">
                    <td className="px-4 py-3">End of Year {row.year}</td>
                    <td className="px-4 py-3">{currencyFormatter.format(row.propertyValue)}</td>
                    <td className="px-4 py-3">{currencyFormatter.format(row.equity)}</td>
                    <td className="px-4 py-3">{currencyFormatter.format(row.cashFlow)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}

function Badge({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'positive' | 'negative' }) {
  const valueClassName = tone === 'positive' ? 'text-green-600' : tone === 'negative' ? 'text-red-600' : 'text-heading'
  return (
    <div className="rounded-xl border border-cardBorder bg-white px-4 py-4">
      <p className="text-[14px] font-medium text-sub">{label}</p>
      <p className={`mt-2 text-[28px] font-semibold leading-none ${valueClassName}`}>{value}</p>
    </div>
  )
}

function Row({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className={emphasized ? 'font-semibold text-heading' : 'text-body'}>{label}</p>
      <p className={emphasized ? 'font-semibold text-heading' : 'text-sub'}>{value}</p>
    </div>
  )
}
