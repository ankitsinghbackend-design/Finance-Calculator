import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import BondForm, { type BondFormState } from '../components/calculators/BondForm'
import BondResults from '../components/calculators/BondResults'
import { calculate, schema, type BondInputs, type BondResults as BondResult } from '../../backend/calculations/bondCalc'

const bondGraphic = 'https://www.figma.com/api/mcp/asset/903ce69f-c46e-4227-89ee-2083d0762888'

const initialForm: BondFormState = {
  price: '',
  faceValue: '1000',
  yield: '5.25',
  timeToMaturity: '10',
  maturityUnit: 'years',
  annualCoupon: '4.5',
  couponFrequency: 'semi-annual',
  maturityDate: '',
  settlementDate: '',
  dayCountConvention: '30/360'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildInputs(form: BondFormState): BondInputs {
  return {
    price: form.price === '' ? undefined : Math.max(0, toNumber(form.price)),
    faceValue: Math.max(0, toNumber(form.faceValue)),
    yield: form.yield === '' ? undefined : Math.max(0, toNumber(form.yield)),
    timeToMaturity: Math.max(0, toNumber(form.timeToMaturity)),
    maturityUnit: form.maturityUnit,
    annualCoupon: Math.max(0, toNumber(form.annualCoupon)),
    couponFrequency: form.couponFrequency,
    maturityDate: form.maturityDate || undefined,
    settlementDate: form.settlementDate || undefined,
    dayCountConvention: form.dayCountConvention
  }
}

const initialResult = (() => {
  const parsed = schema.safeParse(buildInputs(initialForm))
  return parsed.success ? calculate(parsed.data) : null
})()

export default function BondPage() {
  const [form, setForm] = useState<BondFormState>(initialForm)
  const [result, setResult] = useState<BondResult | null>(initialResult)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = useMemo(() => buildInputs(form), [form])

  const handleChange = <K extends keyof BondFormState>(field: K, value: BondFormState[K]) => {
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
      const response = await axios.post<{ results: BondResult }>(apiUrl('/api/calculators/bond-pricing'), {
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
        src={bondGraphic}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[calc(37.5%+32px)] top-[42px] hidden h-[883px] w-[868px] select-none object-contain xl:block"
      />

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[180px] pt-[131px] xl:min-h-[1260px] xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / Bond Calculator</p>

        <h1 className="mt-2 max-w-[586px] text-[48px] font-semibold leading-[1.1] text-heading">Bond Calculator</h1>
        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          Compute a bond&apos;s price or yield based on coupon payments, maturity, and day-count convention. Leave either Price or Yield blank to solve for the missing value.
        </p>

        <div className="mt-8 xl:relative xl:min-h-[860px]">
          <div className="xl:absolute xl:left-0 xl:top-[120px] xl:w-[476px]">
            <BondForm
              form={form}
              onChange={handleChange}
              onSubmit={handleCalculate}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calculateError}
            />
          </div>

          <div className="mt-8 max-w-[516px] xl:absolute xl:left-[758px] xl:top-[55px] xl:mt-0 xl:w-[516px]">
            <BondResults result={result} />
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/bond" />
    </>
  )
}
