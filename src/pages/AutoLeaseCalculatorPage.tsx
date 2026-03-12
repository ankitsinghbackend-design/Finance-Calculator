import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import AutoLeaseForm, { type AutoLeaseFormState } from '../components/calculators/AutoLeaseForm'
import AutoLeaseResults from '../components/calculators/AutoLeaseResults'
import { calculate, schema, type AutoLeaseInputs, type AutoLeaseResults } from '../../backend/calculations/autoLease'

const autoLeaseGraphic = 'https://www.figma.com/api/mcp/asset/004a012c-ea07-4c93-ab29-f342de48f050'

const initialForm: AutoLeaseFormState = {
  autoPrice: '52000',
  leaseTermMonths: '36',
  interestRate: '5.9',
  cashIncentives: '1500',
  downPayment: '4000',
  tradeInValue: '2500',
  salesTaxRate: '7.25',
  residualValue: '29500'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildInputs(form: AutoLeaseFormState): AutoLeaseInputs {
  return {
    autoPrice: Math.max(0, toNumber(form.autoPrice)),
    leaseTermMonths: Math.max(1, Math.round(toNumber(form.leaseTermMonths))),
    interestRate: Math.max(0, toNumber(form.interestRate)),
    cashIncentives: Math.max(0, toNumber(form.cashIncentives)),
    downPayment: Math.max(0, toNumber(form.downPayment)),
    tradeInValue: Math.max(0, toNumber(form.tradeInValue)),
    salesTaxRate: Math.max(0, toNumber(form.salesTaxRate)),
    residualValue: Math.max(0, toNumber(form.residualValue))
  }
}

const initialResult = (() => {
  const parsed = schema.safeParse(buildInputs(initialForm))
  return parsed.success ? calculate(parsed.data) : null
})()

export default function AutoLeaseCalculatorPage() {
  const [form, setForm] = useState<AutoLeaseFormState>(initialForm)
  const [result, setResult] = useState<AutoLeaseResults | null>(initialResult)
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
      const response = await axios.post<{ results: AutoLeaseResults }>(apiUrl('/api/calculators/auto-lease'), {
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
        src={autoLeaseGraphic}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[calc(37.5%+32px)] top-[42px] hidden h-[883px] w-[868px] select-none object-contain xl:block"
      />

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[200px] pt-[131px] xl:min-h-[1500px] xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / Auto Lease Calculator</p>

        <h1 className="mt-2 max-w-[586px] text-[48px] font-semibold leading-[1.1] text-heading">Auto Lease Calculator</h1>
        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          The Auto Lease Calculator can help estimate monthly lease payments based on total auto price or vice versa. For more information about or to do calculations involving leases in general, please use the Lease Calculator.
        </p>

        <div className="mt-8 xl:relative xl:min-h-[760px]">
          <div className="xl:absolute xl:left-0 xl:top-[75px] xl:w-[516px]">
            <AutoLeaseForm
              form={form}
              onChange={(field, value) => setForm((previous) => ({ ...previous, [field]: value }))}
              onSubmit={handleCalculate}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calculateError}
            />
          </div>

          <div className="mt-8 max-w-[516px] xl:absolute xl:left-[758px] xl:top-[35px] xl:mt-0 xl:w-[516px]">
            <AutoLeaseResults result={result} />
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/auto-lease" />
    </>
  )
}