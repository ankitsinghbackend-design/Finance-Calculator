import React from 'react'
import { type SalesTaxResults as SalesTaxResult } from '../../../backend/calculations/salesTax'

type SalesTaxResultsProps = {
  result: SalesTaxResult | null
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

const percentFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export default function SalesTaxResults({ result }: SalesTaxResultsProps) {
  return (
    <section className="min-h-[340px] rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)] flex flex-col gap-10 items-center">
      <div className="text-center flex flex-col gap-[10px]">
        <p className="text-[16px] font-medium text-sub">Final Price (After Tax)</p>
        <p className="text-[40px] leading-none font-semibold text-heading">
          {result ? currencyFormatter.format(result.afterTaxPrice) : '—'}
        </p>
      </div>

      <div className="h-px w-full bg-[#a7f3d0]" />

      <div className="w-full text-center">
        <h3 className="text-[19px] font-semibold text-heading">Breakdown</h3>
      </div>

      {result ? (
        <div className="w-full space-y-4 text-[19px]">
          <Row label="Before-Tax Price" value={currencyFormatter.format(result.beforeTaxPrice)} />
          <Row label="Sales Tax Rate" value={`${percentFormatter.format(result.salesTaxRate)}%`} />
          <Row label="Sales Tax Amount" value={currencyFormatter.format(result.salesTaxAmount)} />
          <Row label="After-Tax Price" value={currencyFormatter.format(result.afterTaxPrice)} strong />
        </div>
      ) : (
        <div className="w-full px-6 text-center text-[16px] leading-[25.6px] text-sub">
          Enter any two values to calculate the missing before-tax price, tax rate, or after-tax price.
        </div>
      )}
    </section>
  )
}

type RowProps = {
  label: string
  value: string
  strong?: boolean
}

function Row({ label, value, strong = false }: RowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className={strong ? 'font-semibold text-heading' : 'font-medium text-body'}>{label}</p>
      <p className="text-right font-semibold text-heading">{value}</p>
    </div>
  )
}