import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import CashBackComparisonForm, { type CashBackComparisonFormState } from '../components/calculators/CashBackComparisonForm'
import CashBackComparisonResults from '../components/calculators/CashBackComparisonResults'
import {
  calculate,
  schema,
  type CashBackComparisonInputs,
  type CashBackComparisonResults as CashBackComparisonResult
} from '../../backend/calculations/cashBackComparison'

const cashBackGraphic = 'https://www.figma.com/api/mcp/asset/e4dc35b3-8bae-4b9e-9d7a-5363d0ecfee6'

const initialForm: CashBackComparisonFormState = {
  cashBackAmount: '3000',
  interestRateHigh: '6.9',
  interestRateLow: '2.9',
  autoPrice: '42000',
  loanTerm: '60',
  downPayment: '4500',
  tradeInValue: '3000',
  stateName: 'California',
  salesTaxRate: '7.25',
  fees: '900'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildInputs(form: CashBackComparisonFormState): CashBackComparisonInputs {
  return {
    cashBackAmount: Math.max(0, toNumber(form.cashBackAmount)),
    interestRateHigh: Math.max(0, toNumber(form.interestRateHigh)),
    interestRateLow: Math.max(0, toNumber(form.interestRateLow)),
    autoPrice: Math.max(0, toNumber(form.autoPrice)),
    loanTerm: Math.max(1, Math.round(toNumber(form.loanTerm))),
    downPayment: Math.max(0, toNumber(form.downPayment)),
    tradeInValue: Math.max(0, toNumber(form.tradeInValue)),
    salesTaxRate: Math.max(0, toNumber(form.salesTaxRate)),
    fees: Math.max(0, toNumber(form.fees))
  }
}

const initialResult = (() => {
  const parsed = schema.safeParse(buildInputs(initialForm))
  return parsed.success ? calculate(parsed.data) : null
})()

export default function CashBackComparisonPage() {
  const [form, setForm] = useState<CashBackComparisonFormState>(initialForm)
  const [result, setResult] = useState<CashBackComparisonResult | null>(initialResult)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = useMemo(() => buildInputs(form), [form])

  const handleChange = <K extends keyof CashBackComparisonFormState>(field: K, value: CashBackComparisonFormState[K]) => {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

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
      const response = await axios.post<{ results: CashBackComparisonResult }>(apiUrl('/api/calculators/cashback-vs-low-interest'), {
        inputs: parsed.data
      })
      setResult(response.data.results)
    } catch {
      setResult(calculate(parsed.data))
      setCalculateError('Unable to reach server. Showing local calculation results.')
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
      <img
        src={cashBackGraphic}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[calc(37.5%+32px)] top-[42px] hidden h-[883px] w-[868px] select-none object-contain xl:block"
      />

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[180px] pt-[131px] xl:min-h-[1237px] xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / Cash Back or Low Interest Calculator</p>

        <h1 className="mt-2 max-w-[586px] text-[48px] font-semibold leading-[1.1] text-heading">
          Cash Back or Low Interest Calculator
        </h1>
        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          Auto manufacturers may offer either a cash back rebate or a low interest rate with a car purchase. Very often, these offers are mutually exclusive. Use the calculator to find out which of the two is the better offer.
        </p>

        <div className="mt-8 xl:relative xl:min-h-[860px]">
          <div className="xl:absolute xl:left-0 xl:top-[109px] xl:w-[476px]">
            <CashBackComparisonForm
              form={form}
              onChange={handleChange}
              onSubmit={handleCalculate}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calculateError}
            />
          </div>

          <div className="mt-8 max-w-[516px] xl:absolute xl:left-[758px] xl:top-0 xl:mt-0 xl:w-[516px]">
            <CashBackComparisonResults result={result} />
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/cash-back-or-low-interest" />
    </>
  )
}
