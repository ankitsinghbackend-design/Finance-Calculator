import React from 'react'
import { FEDERAL_ESTATE_TAX_EXEMPTION, type EstateTaxResults } from '../../../backend/calculations/estateTax'

type EstateTaxResultsProps = {
  result: EstateTaxResults | null
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
})

export default function EstateTaxResults({ result }: EstateTaxResultsProps) {
  return (
    <section className="rounded-[16px] border border-cardBorder bg-[#f9fafb] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
      <div className="text-center">
        <p className="text-[16px] font-medium text-sub">Estimated Estate Tax</p>
        <p className="mt-3 text-[40px] font-semibold leading-none text-heading">
          {result ? currencyFormatter.format(result.estateTaxDue) : '—'}
        </p>
      </div>

      <div className="my-8 h-px w-full bg-[#a7f3d0]" />

      {result ? (
        <div className="space-y-4 text-[19px]">
          <Row label="Total Estate Assets" value={currencyFormatter.format(result.totalAssets)} strong />
          <Row label="Total Liabilities & Deductions" value={currencyFormatter.format(result.totalDeductions)} />
          <Row label="Adjusted Estate Value" value={currencyFormatter.format(result.adjustedEstate)} />
          <Row label="Federal Exemption" value={currencyFormatter.format(FEDERAL_ESTATE_TAX_EXEMPTION)} />
          <Row label="Taxable Estate" value={currencyFormatter.format(result.taxableEstate)} strong />
          <Row label="Estate Tax (40%)" value={currencyFormatter.format(result.estateTaxDue)} strong />
        </div>
      ) : (
        <div className="px-6 text-center text-[16px] leading-[25.6px] text-sub">
          Enter your estate assets, liabilities, deductions, and lifetime gifts to estimate the federal estate tax due.
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
      <p className="font-semibold text-heading">{value}</p>
    </div>
  )
}
