import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import EstateTaxForm, { type EstateTaxFormState } from '../components/calculators/EstateTaxForm'
import EstateTaxResults from '../components/calculators/EstateTaxResults'
import {
  calculate,
  schema,
  type EstateTaxInputs,
  type EstateTaxResults as EstateTaxResultsType
} from '../../backend/calculations/estateTax'

const estateTaxGraphic = 'https://www.figma.com/api/mcp/asset/d5e85e22-fe1a-494b-ac4d-f334f0445996'

const initialForm: EstateTaxFormState = {
  residenceRealEstate: '',
  stocksBonds: '',
  savingsChecking: '',
  vehiclesBoats: '',
  retirementPlans: '',
  lifeInsuranceBenefit: '',
  otherAssets: '',
  debts: '',
  funeralExpenses: '',
  charitableContributions: '',
  stateEstateTaxes: '',
  lifetimeGiftedAmount: ''
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const buildInputs = (form: EstateTaxFormState): EstateTaxInputs => ({
  residenceRealEstate: Math.max(0, toNumber(form.residenceRealEstate)),
  stocksBonds: Math.max(0, toNumber(form.stocksBonds)),
  savingsChecking: Math.max(0, toNumber(form.savingsChecking)),
  vehiclesBoats: Math.max(0, toNumber(form.vehiclesBoats)),
  retirementPlans: Math.max(0, toNumber(form.retirementPlans)),
  lifeInsuranceBenefit: Math.max(0, toNumber(form.lifeInsuranceBenefit)),
  otherAssets: Math.max(0, toNumber(form.otherAssets)),
  debts: Math.max(0, toNumber(form.debts)),
  funeralExpenses: Math.max(0, toNumber(form.funeralExpenses)),
  charitableContributions: Math.max(0, toNumber(form.charitableContributions)),
  stateEstateTaxes: Math.max(0, toNumber(form.stateEstateTaxes)),
  lifetimeGiftedAmount: Math.max(0, toNumber(form.lifetimeGiftedAmount))
})

export default function EstateTaxCalculatorPage() {
  const [form, setForm] = useState<EstateTaxFormState>(initialForm)
  const [result, setResult] = useState<EstateTaxResultsType | null>(null)
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
      const response = await axios.post<{ results: EstateTaxResultsType }>(apiUrl('/api/calculators/estate-tax'), {
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
    setResult(null)
    setCalculateError(null)
  }

  return (
    <>
    <section className="relative min-h-[calc(100vh-82px)] overflow-hidden bg-[#f5f7fa]">
      <img
        src={estateTaxGraphic}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[calc(37.5%+32px)] top-[42px] hidden h-[883px] w-[868px] select-none object-contain xl:block"
      />

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[200px] pt-[131px] xl:min-h-[1680px] xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / Estate Tax Calculator</p>

        <h1 className="mt-2 text-[48px] font-semibold leading-[1.1] text-heading">Estate Tax Calculator</h1>
        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          The Estate Tax Calculator estimates federal estate tax due. Many states impose their own estate taxes, but they tend to be less than the federal estate tax. This calculator is mainly intended for use by U.S. residents.
        </p>

        <div className="mt-8 xl:relative xl:min-h-[1260px]">
          <div className="xl:absolute xl:left-0 xl:top-[29px] xl:w-[1012px]">
            <EstateTaxForm
              form={form}
              onChange={(field, value) => setForm((previous) => ({ ...previous, [field]: value }))}
              onSubmit={handleCalculate}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calculateError}
            />
          </div>

          {result ? (
            <div className="mt-8 max-w-[516px] xl:absolute xl:left-0 xl:top-[980px] xl:w-[516px]">
              <EstateTaxResults result={result} />
            </div>
          ) : null}
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/estate-tax" />
    </>
  )
}
