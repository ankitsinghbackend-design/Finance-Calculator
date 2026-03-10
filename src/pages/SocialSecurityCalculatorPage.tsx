import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import SocialSecurityForm, { type SocialSecurityFormState } from '../components/calculators/SocialSecurityForm'
import SocialSecurityResults from '../components/calculators/SocialSecurityResults'
import {
  calculate,
  schema,
  type SocialSecurityInputs,
  type SocialSecurityResults as SocialSecurityResult
} from '../../backend/calculations/socialSecurity'

const socialSecurityGraphic = 'https://www.figma.com/api/mcp/asset/289c1573-54ac-42de-8ce9-60c9f536f084'

const initialForm: SocialSecurityFormState = {
  birthYear: '1960',
  lifeExpectancy: '85',
  investmentReturn: '5',
  cola: '2.5',
  monthlyBenefitFRA: '1900',
  startAge: '67'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const buildInputs = (form: SocialSecurityFormState): SocialSecurityInputs => ({
  birthYear: Math.round(Math.max(1900, toNumber(form.birthYear))),
  lifeExpectancy: Math.max(0, toNumber(form.lifeExpectancy)),
  investmentReturn: Math.max(0, toNumber(form.investmentReturn)),
  cola: Math.max(0, toNumber(form.cola)),
  monthlyBenefitFRA: form.monthlyBenefitFRA.trim() === '' ? undefined : Math.max(0, toNumber(form.monthlyBenefitFRA)),
  startAge: form.startAge.trim() === '' ? undefined : Math.max(62, Math.min(70, toNumber(form.startAge)))
})

const initialResult = (() => {
  const parsed = schema.safeParse(buildInputs(initialForm))
  return parsed.success ? calculate(parsed.data) : null
})()

export default function SocialSecurityCalculatorPage() {
  const [form, setForm] = useState<SocialSecurityFormState>(initialForm)
  const [result, setResult] = useState<SocialSecurityResult | null>(initialResult)
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
      const response = await axios.post<{ results: SocialSecurityResult }>(apiUrl('/api/calculators/social-security'), {
        inputs: parsed.data
      })
      setResult(response.data.results)
    } catch {
      try {
        setResult(calculate(parsed.data))
        setCalculateError('Unable to reach server. Showing local calculation results.')
      } catch (error) {
        setResult(null)
        setCalculateError(error instanceof Error ? error.message : 'Unable to calculate Social Security benefits.')
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
    <section className="relative min-h-[calc(100vh-82px)] overflow-hidden bg-[#f5f7fa]">
      <img
        src={socialSecurityGraphic}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[calc(37.5%+32px)] top-[42px] hidden h-[883px] w-[868px] select-none object-contain xl:block"
      />

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[120px] pt-[131px] xl:min-h-[1150px] xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / Social Security Calculator</p>

        <h1 className="mt-2 max-w-[586px] text-[48px] font-semibold leading-[1.1] text-heading">
          Social Security Calculator
        </h1>

        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          While they are all useful, there currently isn&apos;t a way to help determine the ideal age at which a person between 62 and 70 should apply for Social Security retirement benefits. This tool estimates lifetime value using claiming age, COLA, and optional investment growth.
        </p>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 xl:grid-cols-[516px_516px] xl:justify-between">
          <div>
            <SocialSecurityForm
              form={form}
              onChange={(field, value) => setForm((previous) => ({ ...previous, [field]: value }))}
              onSubmit={handleCalculate}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calculateError}
            />
            <p className="mt-3 text-[14px] leading-[21px] text-body">
              If Monthly Benefit at FRA is left blank, the calculator uses the estimated national average Social Security benefit of $1,900.
            </p>
          </div>

          <div className="xl:mt-[-70px]">
            <SocialSecurityResults result={result} />
          </div>
        </div>
      </div>
    </section>
  )
}
