import React from 'react'
import { Link } from 'react-router-dom'
import type { AprResults } from '../../../backend/calculations/aprLogic'

type AprResultsCardProps = {
  result: AprResults | null
  paymentCount: number
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

const percentFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3
})

export default function AprResultsCard({ result, paymentCount }: AprResultsCardProps) {
  return (
    <section className="rounded-[28px] border border-cardBorder bg-[#f9fafb] shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
      <div className="flex items-center justify-between rounded-t-[28px] bg-primary px-6 py-5 text-white">
        <div>
          <p className="text-[16px] font-medium text-white/90">Real APR</p>
          <p className="mt-1 text-[32px] font-semibold leading-none">
            {result ? `${percentFormatter.format(result.realApr)} %` : '—'}
          </p>
        </div>
        <button
          type="button"
          aria-label="Save result"
          className="flex size-10 items-center justify-center rounded-full border border-white/40 bg-white/10"
        >
          <SaveIcon />
        </button>
      </div>

      <div className="px-6 py-6">
        {result ? (
          <>
            <div className="space-y-4 text-[16px]">
              <Row label="Amount Financed" value={currencyFormatter.format(result.amountFinanced)} />
              <Row label="Upfront Out-of-Pocket Fees" value={currencyFormatter.format(result.upfrontFees)} />
              <Row label="Payment Every Month" value={currencyFormatter.format(result.monthlyPayment)} />
              <Row label={`Total of ${paymentCount} Payments`} value={currencyFormatter.format(result.totalPayments)} />
              <Row label="Total Interest" value={currencyFormatter.format(result.totalInterest)} />
              <Row label="All Payments and Fees" value={currencyFormatter.format(result.totalAllPaymentsAndFees)} />
            </div>

            <div className="my-6 h-px bg-[#e5e7eb]" />

            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-[19px] font-semibold text-heading">Cost Distribution</p>
                <p className="mt-1 text-[16px] text-body">Principal, interest, and fee share of total borrowing cost.</p>
              </div>

              <DonutChart
                principal={result.chartData.principal}
                interest={result.chartData.interest}
                fees={result.chartData.fees}
              />

              <div className="grid w-full gap-3 sm:grid-cols-3">
                <LegendItem color="#4466CC" label="Principal" value={currencyFormatter.format(result.chartData.principal)} />
                <LegendItem color="#8BC34A" label="Interest" value={currencyFormatter.format(result.chartData.interest)} />
                <LegendItem color="#B71C1C" label="Fees" value={currencyFormatter.format(result.chartData.fees)} />
              </div>

              <Link to="/calculators/amortization" className="text-[16px] font-medium text-primary underline underline-offset-4">
                View Amortization Table
              </Link>
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-[16px] leading-[25.6px] text-body">
            Choose a mode, enter your loan costs, and calculate the real APR including fees and points.
          </div>
        )}
      </div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="font-medium text-body">{label}</p>
      <p className="text-right font-semibold text-heading">{value}</p>
    </div>
  )
}

function LegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-cardBorder bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="size-3 rounded-full" style={{ backgroundColor: color }} />
        <p className="text-[16px] font-medium text-sub">{label}</p>
      </div>
      <p className="mt-2 text-[19px] font-semibold text-heading">{value}</p>
    </div>
  )
}

function DonutChart({ principal, interest, fees }: { principal: number; interest: number; fees: number }) {
  const total = Math.max(principal + interest + fees, 0)

  if (total === 0) {
    return <div className="flex size-[220px] items-center justify-center rounded-full border border-dashed border-cardBorder text-body">No data</div>
  }

  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeWidth = 28
  const values = [
    { value: principal, color: '#4466CC' },
    { value: interest, color: '#8BC34A' },
    { value: fees, color: '#B71C1C' }
  ]

  let offset = 0

  return (
    <svg viewBox="0 0 220 220" className="size-[220px] -rotate-90">
      <circle cx="110" cy="110" r={radius} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
      {values.map((segment) => {
        const length = (segment.value / total) * circumference
        const node = (
          <circle
            key={`${segment.color}-${segment.value}`}
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${length} ${circumference - length}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        )
        offset += length
        return node
      })}
      <circle cx="110" cy="110" r="46" fill="#F9FAFB" />
      <g transform="rotate(90 110 110)">
        <text x="110" y="102" textAnchor="middle" className="fill-[#4B5563] text-[12px]">Total Cost</text>
        <text x="110" y="122" textAnchor="middle" className="fill-[#111827] text-[16px] font-semibold">
          {currencyFormatter.format(total)}
        </text>
      </g>
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 4.75A1.75 1.75 0 0 1 6.75 3h8.19c.46 0 .9.18 1.22.5l2.34 2.34c.32.32.5.76.5 1.22v10.19A1.75 1.75 0 0 1 17.25 19h-10.5A1.75 1.75 0 0 1 5 17.25V4.75Z" stroke="white" strokeWidth="1.7"/>
      <path d="M8 3.75V8h7V4.2" stroke="white" strokeWidth="1.7"/>
      <path d="M8.25 19v-5.25c0-.41.34-.75.75-.75h6c.41 0 .75.34.75.75V19" stroke="white" strokeWidth="1.7"/>
    </svg>
  )
}
