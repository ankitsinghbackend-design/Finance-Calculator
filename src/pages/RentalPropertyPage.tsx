import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import RentalPropertyForm, { type RentalPropertyFormState } from '../components/calculators/RentalPropertyForm'
import RentalPropertyResults from '../components/calculators/RentalPropertyResults'
import {
  calculate,
  schema,
  type RentalPropertyInputs,
  type RentalPropertyResults as RentalPropertyResult
} from '../../backend/calculations/rentalProperty'

const rentalPropertyGraphic = 'https://www.figma.com/api/mcp/asset/686dfdce-87e1-44f1-8fbc-f9e51513cf94'

const initialForm: RentalPropertyFormState = {
  purchasePrice: '350000',
  downPayment: '70000',
  interestRate: '6.5',
  useLoan: 'yes',
  loanTerm: '30',
  closingCost: '6000',
  needRepairsPurchase: 'no',
  monthlyRent: '2800',
  rentAnnualIncrease: '3',
  otherIncome: '150',
  otherAnnualIncrease: '2',
  vacancyRate: '5',
  managementFees: '150',
  needRepairsIncome: 'no',
  propertyTaxes: '4200',
  propertyTaxesIncrease: '2',
  totalInsurance: '1600',
  totalInsuranceIncrease: '2',
  hoaFees: '900',
  hoaFeesIncrease: '2',
  valueAppreciation: '3',
  holdingLength: '10',
  costToSell: '25000',
  doYouKnowSellPrice: 'no'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildInputs(form: RentalPropertyFormState): RentalPropertyInputs {
  return {
    purchasePrice: Math.max(0, toNumber(form.purchasePrice)),
    downPayment: Math.max(0, toNumber(form.downPayment)),
    interestRate: Math.max(0, toNumber(form.interestRate)),
    useLoan: form.useLoan === 'yes',
    loanTerm: Math.max(0, toNumber(form.loanTerm)),
    closingCost: Math.max(0, toNumber(form.closingCost)),
    needRepairsPurchase: form.needRepairsPurchase === 'yes',
    monthlyRent: Math.max(0, toNumber(form.monthlyRent)),
    rentAnnualIncrease: Math.max(0, toNumber(form.rentAnnualIncrease)),
    otherIncome: Math.max(0, toNumber(form.otherIncome)),
    otherAnnualIncrease: Math.max(0, toNumber(form.otherAnnualIncrease)),
    vacancyRate: Math.max(0, toNumber(form.vacancyRate)),
    managementFees: Math.max(0, toNumber(form.managementFees)),
    needRepairsIncome: form.needRepairsIncome === 'yes',
    propertyTaxes: Math.max(0, toNumber(form.propertyTaxes)),
    propertyTaxesIncrease: Math.max(0, toNumber(form.propertyTaxesIncrease)),
    totalInsurance: Math.max(0, toNumber(form.totalInsurance)),
    totalInsuranceIncrease: Math.max(0, toNumber(form.totalInsuranceIncrease)),
    hoaFees: Math.max(0, toNumber(form.hoaFees)),
    hoaFeesIncrease: Math.max(0, toNumber(form.hoaFeesIncrease)),
    valueAppreciation: Math.max(0, toNumber(form.valueAppreciation)),
    holdingLength: Math.max(0, toNumber(form.holdingLength)),
    costToSell: Math.max(0, toNumber(form.costToSell)),
    doYouKnowSellPrice: form.doYouKnowSellPrice === 'yes'
  }
}

const initialResult = (() => {
  const parsed = schema.safeParse(buildInputs(initialForm))
  return parsed.success ? calculate(parsed.data) : null
})()

export default function RentalPropertyPage() {
  const [form, setForm] = useState<RentalPropertyFormState>(initialForm)
  const [result, setResult] = useState<RentalPropertyResult | null>(initialResult)
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
      const response = await axios.post<{ results: RentalPropertyResult }>(apiUrl('/api/calculators/rental-property'), {
        inputs: parsed.data
      })
      setResult(response.data.results)
    } catch {
      try {
        setResult(calculate(parsed.data))
        setCalculateError('Unable to reach server. Showing local calculation results.')
      } catch (error) {
        setResult(null)
        setCalculateError(error instanceof Error ? error.message : 'Unable to calculate rental property results.')
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
      <img
        src={rentalPropertyGraphic}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[calc(37.5%+32px)] top-[42px] hidden h-[883px] w-[868px] select-none object-contain xl:block"
      />

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[180px] pt-[131px] xl:min-h-[2037px] xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / Rental Property Calculator</p>

        <h1 className="mt-2 max-w-[586px] text-[48px] font-semibold leading-[1.1] text-heading">Rental Property Calculator</h1>
        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          Evaluate the profitability of a real estate investment by estimating cash flow, operating performance, financing costs,
          and long-term equity growth from rental income and property appreciation.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-8">
          <RentalPropertyForm
            form={form}
            onChange={(field, value) => setForm((previous) => ({ ...previous, [field]: value }))}
            onSubmit={handleCalculate}
            onClear={handleClear}
            isCalculating={isCalculating}
            error={calculateError}
          />

          <div className="w-full max-w-[962px]">
            <RentalPropertyResults result={result} />
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/rental-property" />
    </>
  )
}
