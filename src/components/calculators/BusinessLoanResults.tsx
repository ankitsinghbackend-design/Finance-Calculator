import type { BusinessLoanResults as BusinessLoanResult } from '../../../backend/calculations/businessLoan'

type BusinessLoanResultsProps = {
  result: BusinessLoanResult | null
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)

const formatPercent = (value: number): string => `${value.toFixed(2)}%`

const payBackLabels: Record<BusinessLoanResult['payBack'], string> = {
  monthly: 'Monthly',
  'bi-weekly': 'Bi-weekly',
  weekly: 'Weekly'
}

export default function BusinessLoanResults({ result }: BusinessLoanResultsProps) {
  if (!result) {
    return (
      <div className="rounded-[16px] border border-[#e5e7eb] bg-[#f9fafb] px-6 py-12 text-center shadow-[0px_2px_6px_rgba(205,205,205,0.72)]">
        <p className="text-[16px] font-medium text-sub">Enter loan details to calculate payments, fees, and true APR.</p>
      </div>
    )
  }

  const paymentLabel = `${payBackLabels[result.payBack]} Payment`

  return (
    <div className="space-y-6">
      <div className="rounded-[16px] border border-[#e5e7eb] bg-[#f9fafb] px-6 py-12 shadow-[0px_2px_6px_rgba(205,205,205,0.72)]">
        <div className="text-center">
          <p className="text-[16px] font-medium text-sub">{paymentLabel}</p>
          <p className="mt-2 text-[40px] font-semibold leading-none text-heading">{formatCurrency(result.periodicPayment)}</p>
          <p className="mt-3 text-sm font-medium text-body">True APR {formatPercent(result.apr)} · Effective APR {formatPercent(result.effectiveApr)}</p>
        </div>

        <div className="my-10 h-px w-full bg-[#a7f3d0]" />

        <div className="space-y-4">
          <p className="text-center text-[19px] font-semibold text-heading">Amortization</p>

          <div className="space-y-4 text-[18px] font-semibold text-heading">
            <div className="flex items-center justify-between gap-4">
              <span>Total of {result.paymentCount} periodic payments</span>
              <span>{formatCurrency(result.totalPayments)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Total interest</span>
              <span>{formatCurrency(result.totalInterest)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Total cost of loan</span>
              <span>{formatCurrency(result.totalCostOfLoan)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-[#e5e7eb] bg-white p-6 shadow-[0px_2px_6px_rgba(205,205,205,0.18)]">
        <h2 className="text-[24px] font-semibold text-heading">Fee-adjusted financing details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-[#f8fafc] p-4">
            <p className="text-sm font-medium text-sub">Total fees</p>
            <p className="mt-2 text-2xl font-semibold text-heading">{formatCurrency(result.totalFees)}</p>
          </div>
          <div className="rounded-xl bg-[#f8fafc] p-4">
            <p className="text-sm font-medium text-sub">Net funding received</p>
            <p className="mt-2 text-2xl font-semibold text-heading">{formatCurrency(result.netFunding)}</p>
          </div>
          <div className="rounded-xl bg-[#f8fafc] p-4">
            <p className="text-sm font-medium text-sub">Resolved origination fee</p>
            <p className="mt-2 text-2xl font-semibold text-heading">{formatCurrency(result.originationFeeAmount)}</p>
          </div>
          <div className="rounded-xl bg-[#f8fafc] p-4">
            <p className="text-sm font-medium text-sub">Nominal rate</p>
            <p className="mt-2 text-2xl font-semibold text-heading">{formatPercent(result.interestRate)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
