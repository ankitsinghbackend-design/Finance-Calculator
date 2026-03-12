import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import RMDForm, { type RMDFormState } from '../components/calculators/RMDForm'
import RMDResults from '../components/calculators/RMDResults'
import { calculate, schema, type RmdInputs, type RmdResults as RMDResult } from '../../backend/calculations/rmdCalc'

const rmdGraphic = 'https://www.figma.com/api/mcp/asset/903ce69f-c46e-4227-89ee-2083d0762888'

const initialForm: RMDFormState = {
  yearOfBirth: '1952',
  yearOfRmd: '2025',
  accountBalance: '450000',
  isSpousePrimaryBeneficiary: 'no',
  spouseDateOfBirth: '',
  estimatedRateOfReturn: '5'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildInputs(form: RMDFormState): RmdInputs {
  return {
    yearOfBirth: Math.round(toNumber(form.yearOfBirth)),
    yearOfRmd: Math.round(toNumber(form.yearOfRmd)),
    accountBalance: Math.max(0, toNumber(form.accountBalance)),
    isSpousePrimaryBeneficiary: form.isSpousePrimaryBeneficiary === 'yes',
    spouseDateOfBirth: form.spouseDateOfBirth || undefined,
    estimatedRateOfReturn: form.estimatedRateOfReturn === '' ? undefined : Math.max(0, toNumber(form.estimatedRateOfReturn))
  }
}

const initialResult = (() => {
  const parsed = schema.safeParse(buildInputs(initialForm))
  return parsed.success ? calculate(parsed.data) : null
})()

export default function RMDPage() {
  const [form, setForm] = useState<RMDFormState>(initialForm)
  const [result, setResult] = useState<RMDResult | null>(initialResult)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = useMemo(() => buildInputs(form), [form])

  const handleChange = <K extends keyof RMDFormState>(field: K, value: RMDFormState[K]) => {
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
      const response = await axios.post<{ results: RMDResult }>(apiUrl('/api/calculators/rmd'), {
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
        src={rmdGraphic}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[calc(37.5%+32px)] top-[42px] hidden h-[883px] w-[868px] select-none object-contain xl:block"
      />

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[180px] pt-[131px] xl:min-h-[1224px] xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / RMD Calculator</p>

        <h1 className="mt-2 max-w-[586px] text-[48px] font-semibold leading-[1.1] text-heading">RMD Calculator</h1>
        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          Once a person reaches the age of 73, the IRS requires retirement account holders to withdraw a minimum amount of money each year – this amount is referred to as the Required Minimum Distribution (RMD). This calculator calculates the RMD depending on your age and account balance. The calculations are based on the IRS Publication 590-B, so the calculator is intended for residents of the United States only.
        </p>

        <div className="mt-8 xl:relative xl:min-h-[760px]">
          <div className="xl:absolute xl:left-0 xl:top-[45px] xl:w-[476px]">
            <RMDForm
              form={form}
              onChange={handleChange}
              onSubmit={handleCalculate}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calculateError}
            />
          </div>

          <div className="mt-8 max-w-[516px] xl:absolute xl:left-[758px] xl:top-[-100px] xl:mt-0 xl:w-[516px]">
            <RMDResults result={result} />
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/rmd" />
    </>
  )
}
