import type { DepreciationResults as DepreciationResult } from '../../../backend/calculations/depreciation'

type DepreciationResultsProps = {
  result: DepreciationResult | null
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2
  }).format(value)

const methodLabels: Record<DepreciationResult['method'], string> = {
  'straight-line': 'Straight line',
  'declining-balance': 'Declining balance',
  'sum-of-years-digits': "Sum of years' digits"
}

export default function DepreciationResults({ result }: DepreciationResultsProps) {
  if (!result) {
    return (
      <div className="rounded-[16px] border border-[#e5e7eb] bg-[#f9fafb] px-6 py-12 text-center shadow-[0px_2px_6px_rgba(205,205,205,0.72)]">
        <p className="text-[16px] font-medium text-sub">Enter your values to generate a depreciation schedule.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 xl:-ml-[80px]">
      <div className="rounded-[16px] border border-[#e5e7eb] bg-[#f9fafb] px-6 py-12 shadow-[0px_2px_6px_rgba(205,205,205,0.72)]">
        <div className="text-center">
          <p className="text-[16px] font-medium text-sub">Total Depreciation</p>
          <p className="mt-2 text-[40px] font-semibold leading-none text-heading">{formatCurrency(result.totalDepreciation)}</p>
        </div>

        <div className="my-10 h-px w-full bg-[#a7f3d0]" />

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[19px] font-semibold text-heading">Depreciation Summary</p>
            <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-sm font-medium text-[#166534]">{methodLabels[result.method]}</span>
          </div>

          <div className="space-y-4 text-[18px] font-semibold text-heading">
            <div className="flex items-center justify-between gap-4">
              <span>First-year depreciation</span>
              <span>{formatCurrency(result.firstYearDepreciation)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Average annual depreciation</span>
              <span>{formatCurrency(result.averageAnnualDepreciation)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Ending book value</span>
              <span>{formatCurrency(result.endingBookValue)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-[#e5e7eb] bg-white p-6 shadow-[0px_2px_6px_rgba(205,205,205,0.18)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[24px] font-semibold text-heading">Yearly depreciation schedule</h2>
            <p className="mt-1 text-[16px] leading-[25.6px] text-body">
              Track beginning book value, depreciation expense, accumulated depreciation, and ending book value for each period.
            </p>
          </div>
          <div className="text-sm font-medium text-sub">
            {result.partialYearDepreciation ? 'Partial year enabled' : 'Whole-year schedule'}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                <th className="border-b border-[#e5e7eb] pb-3 pr-4 text-sm font-semibold uppercase tracking-[0.04em] text-sub">Period</th>
                <th className="border-b border-[#e5e7eb] pb-3 pr-4 text-sm font-semibold uppercase tracking-[0.04em] text-sub">Beginning Book Value</th>
                <th className="border-b border-[#e5e7eb] pb-3 pr-4 text-sm font-semibold uppercase tracking-[0.04em] text-sub">Depreciation Expense</th>
                <th className="border-b border-[#e5e7eb] pb-3 pr-4 text-sm font-semibold uppercase tracking-[0.04em] text-sub">Accumulated Depreciation</th>
                <th className="border-b border-[#e5e7eb] pb-3 text-sm font-semibold uppercase tracking-[0.04em] text-sub">Ending Book Value</th>
              </tr>
            </thead>
            <tbody>
              {result.schedule.map((row, index) => (
                <tr key={`${row.periodLabel}-${index}`}>
                  <td className="border-b border-[#eef2f7] py-4 pr-4 text-[15px] font-medium text-heading">{row.periodLabel}</td>
                  <td className="border-b border-[#eef2f7] py-4 pr-4 text-[15px] text-body">{formatCurrency(row.beginningBookValue)}</td>
                  <td className="border-b border-[#eef2f7] py-4 pr-4 text-[15px] text-body">{formatCurrency(row.depreciationExpense)}</td>
                  <td className="border-b border-[#eef2f7] py-4 pr-4 text-[15px] text-body">{formatCurrency(row.accumulatedDepreciation)}</td>
                  <td className="border-b border-[#eef2f7] py-4 text-[15px] text-body">{formatCurrency(row.endingBookValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
