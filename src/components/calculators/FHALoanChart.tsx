import React from 'react'

type ChartSegment = {
  label: string
  value: number
  color: string
}

type FHALoanChartProps = {
  segments: ChartSegment[]
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

const circumference = 2 * Math.PI * 52

export default function FHALoanChart({ segments }: FHALoanChartProps) {
  const sanitizedSegments = segments.filter((segment) => segment.value > 0)
  const total = sanitizedSegments.reduce((sum, segment) => sum + segment.value, 0)

  let dashOffset = 0

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="relative flex h-[180px] w-[180px] items-center justify-center">
        <svg viewBox="0 0 140 140" className="h-[180px] w-[180px] -rotate-90">
          <circle cx="70" cy="70" r="52" fill="none" stroke="#e5e7eb" strokeWidth="20" />
          {sanitizedSegments.map((segment) => {
            const segmentLength = total === 0 ? 0 : (segment.value / total) * circumference
            const circle = (
              <circle
                key={segment.label}
                cx="70"
                cy="70"
                r="52"
                fill="none"
                stroke={segment.color}
                strokeWidth="20"
                strokeLinecap="butt"
                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                strokeDashoffset={-dashOffset}
              />
            )

            dashOffset += segmentLength
            return circle
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[12px] font-medium text-sub">Monthly Pay</p>
          <p className="mt-1 text-[18px] font-semibold text-heading">{currencyFormatter.format(total)}</p>
        </div>
      </div>

      <div className="grid flex-1 gap-2 pt-2">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-[3px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]" style={{ backgroundColor: segment.color }} />
            <span className="text-[12px] font-medium text-[#003366]">{segment.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
