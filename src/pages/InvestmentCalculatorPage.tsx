import { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import {
  calculate,
  type InvestmentInputs,
  type InvestmentMode
} from '../../backend/calculations/investment'
import InvestmentForm, {
  type InvestmentFormState
} from '../components/calculators/InvestmentForm'
import InvestmentResults, {
  type InvestmentResult
} from '../components/calculators/InvestmentResults'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import { API_BASE_URL } from '../config/api'
import EllipseBackground from '../components/EllipseBackground'

const defaultMode: InvestmentMode = 'end-amount'

const defaultFormState: InvestmentFormState = {
  startingAmount: '10000',
  targetEndAmount: '50000',
  returnRate: '7',
  investmentYears: '10',
  compoundFrequency: '12',
  additionalContribution: '200',
  contributionFrequency: '12',
  contributeTiming: 'end'
}

const frequencyLabels: Record<string, string> = {
  '1': 'Yearly',
  '2': 'Semiannual',
  '4': 'Quarterly',
  '12': 'Monthly',
  '365': 'Daily'
}

export default function InvestmentCalculatorPage() {
  const [mode, setMode] = useState<InvestmentMode>(defaultMode)
  const [form, setForm] = useState<InvestmentFormState>(defaultFormState)
  const [result, setResult] = useState<InvestmentResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const compoundFrequencyLabel = useMemo(
    () => frequencyLabels[form.compoundFrequency] ?? 'Monthly',
    [form.compoundFrequency]
  )

  const contributionFrequencyLabel = useMemo(
    () => frequencyLabels[form.contributionFrequency] ?? 'Monthly',
    [form.contributionFrequency]
  )

  const handleFormChange = (field: keyof InvestmentFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleModeChange = (nextMode: InvestmentMode) => {
    setMode(nextMode)
    setError(null)
    setResult(null)
  }

  const handleClear = () => {
    setForm(defaultFormState)
    setMode(defaultMode)
    setResult(null)
    setError(null)
  }

  const buildPayload = (): InvestmentInputs => ({
    mode,
    startingAmount: Number(form.startingAmount || 0),
    targetEndAmount: Number(form.targetEndAmount || 0),
    returnRate: Number(form.returnRate || 0),
    investmentYears: Number(form.investmentYears || 0),
    compoundFrequency: Number(form.compoundFrequency || 12) as 1 | 2 | 4 | 12 | 365,
    additionalContribution: Number(form.additionalContribution || 0),
    contributionFrequency: Number(form.contributionFrequency || 12) as 1 | 2 | 4 | 12 | 365,
    contributeTiming: form.contributeTiming
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsCalculating(true)
    setError(null)

    const payload = buildPayload()

    try {
      const response = await axios.post(`${API_BASE_URL}/calculators/investment`, payload)
      setResult(response.data.result as InvestmentResult)
    } catch (requestError) {
      try {
        setResult(calculate(payload) as InvestmentResult)
      } catch (calculationError) {
        const message = calculationError instanceof Error ? calculationError.message : 'Unable to calculate investment result.'
        setError(message)
      }
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <>
    <section className="relative min-h-[calc(100vh-82px)] overflow-hidden bg-[#f5f7fa] text-[#1d2433]">
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

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-16 pt-12 xl:px-0 lg:pb-24">
        <div className="max-w-[760px]">
          <p className="text-[19px] font-semibold text-sub">Home / Finance / Investment Calculator</p>
          <h1 className="mt-2 text-[34px] font-semibold tracking-[-0.03em] text-[#1d2433] sm:text-[46px] lg:text-[48px] lg:leading-[1.1]">
              Investment Calculator
          </h1>
          <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body sm:text-[18px] sm:leading-8">
            Estimate your future portfolio value, required return, additional contributions, or investment horizon with the same multi-scenario workflow shown in the design.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)] lg:items-start">
          <InvestmentForm
            mode={mode}
            form={form}
            onModeChange={handleModeChange}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            onClear={handleClear}
            isCalculating={isCalculating}
            error={error}
          />

          <div className="lg:sticky lg:top-24">
            {result ? (
              <InvestmentResults
                result={result}
                compoundFrequencyLabel={compoundFrequencyLabel}
                contributionFrequencyLabel={contributionFrequencyLabel}
              />
            ) : (
              <section className="rounded-[28px] border border-dashed border-cardBorder bg-[#f9fafb] p-6 text-center shadow-card">
                <p className="text-[18px] font-semibold text-[#1d2433]">Your results will appear here</p>
                <p className="mt-2 text-[15px] leading-7 text-sub">
                  Choose a tab, fill in your assumptions, and click Calculate to see your future investment value and contribution breakdown.
                </p>
              </section>
            )}
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/investment" />
    </>
  )
}
