import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import SalesTaxForm, { type SalesTaxFormState } from '../components/calculators/SalesTaxForm'
import SalesTaxResults from '../components/calculators/SalesTaxResults'
import { calculate, schema, type SalesTaxInputs, type SalesTaxResults as SalesTaxResultsType } from '../../backend/calculations/salesTax'
import EllipseBackground from '../components/EllipseBackground'

const initialForm: SalesTaxFormState = {
  beforeTaxPrice: '100',
  salesTaxRate: '8',
  afterTaxPrice: ''
}

const toNullableNumber = (value: string): number | null => {
  if (value.trim() === '') {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const buildInputs = (form: SalesTaxFormState): SalesTaxInputs => ({
  beforeTaxPrice: toNullableNumber(form.beforeTaxPrice),
  salesTaxRate: toNullableNumber(form.salesTaxRate),
  afterTaxPrice: toNullableNumber(form.afterTaxPrice)
})

const initialResult = (() => {
  const parsed = schema.safeParse(buildInputs(initialForm))
  return parsed.success ? calculate(parsed.data) : null
})()

export default function SalesTaxCalculatorPage() {
  const [form, setForm] = useState<SalesTaxFormState>(initialForm)
  const [result, setResult] = useState<SalesTaxResultsType | null>(initialResult)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = useMemo(() => buildInputs(form), [form])

  const handleCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCalculateError(null)

    const parsed = schema.safeParse(currentInputs)

    if (!parsed.success) {
      setResult(null)
      setCalculateError(parsed.error.issues[0]?.message ?? 'Invalid inputs. Please check your values.')
      return
    }

    try {
      setIsCalculating(true)
      const response = await axios.post<{ results: SalesTaxResultsType }>(apiUrl('/api/calculators/sales-tax'), {
        inputs: parsed.data
      })
      setResult(response.data.results)
    } catch {
      try {
        setResult(calculate(parsed.data))
        setCalculateError('Unable to reach server. Showing local calculation results.')
      } catch (error) {
        setResult(null)
        setCalculateError(error instanceof Error ? error.message : 'Unable to calculate sales tax results.')
      }
    } finally {
      setIsCalculating(false)
    }
  }

  const handleClear = () => {
    setForm(initialForm)
    setResult(initialResult)
    setCalculateError(null)
  }

  return (
    <>
    <section className="relative min-h-[calc(100vh-82px)] overflow-hidden bg-[#f5f7fa]">
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

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-12 pt-12 xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / Sales Tax Calculator</p>

        <h1 className="mt-2 max-w-[586px] text-[48px] font-semibold leading-[1.1] text-heading">Sales Tax Calculator</h1>
        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          The Sales Tax Calculator can compute any one of the following, given inputs for the remaining two: before-tax price, sales tax rate, and final, or after-tax price.
        </p>

        <div className="mt-8 grid grid-cols-1 items-start justify-between gap-8 xl:grid-cols-[565px_516px]">
          <SalesTaxForm
            form={form}
            onChange={(field, value) => setForm((previous) => ({ ...previous, [field]: value }))}
            onSubmit={handleCalculate}
            onClear={handleClear}
            isCalculating={isCalculating}
            error={calculateError}
          />

          <div className="xl:-mt-16">
            <SalesTaxResults result={result} />
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/sales-tax" />
    </>
  )
}