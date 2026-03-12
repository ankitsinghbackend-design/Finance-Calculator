import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import GeneralAprForm, { type GeneralAprFormState } from '../components/calculators/GeneralAprForm'
import MortgageAprForm, { type MortgageAprFormState } from '../components/calculators/MortgageAprForm'
import AprResultsCard from '../components/calculators/AprResultsCard'
import {
  calculateGeneralApr,
  calculateMortgageApr,
  generalAprSchema,
  mortgageAprSchema,
  getTotalMonths,
  type AprResults,
  type CompoundingPeriod,
  type GeneralAprInputs,
  type MortgageAprInputs
} from '../../backend/calculations/aprLogic'

const imgEllipse1 = 'https://www.figma.com/api/mcp/asset/10f76cbf-649a-4f1b-afb9-6699ae24ce90'
const imgEllipse2 = 'https://www.figma.com/api/mcp/asset/29ba2be2-6dce-48d2-80db-12f713778116'

type AprMode = 'general' | 'mortgage'

const initialGeneralForm: GeneralAprFormState = {
  loanAmount: '25000',
  loanTermYears: '5',
  loanTermMonths: '0',
  nominalRate: '6.25',
  compoundingPeriod: 'Monthly',
  backPayYear: '120',
  loanedFeesMonthly: '18',
  upfrontFees: '750'
}

const initialMortgageForm: MortgageAprFormState = {
  houseValue: '425000',
  downPaymentPercent: '20',
  loanTermMonths: '360',
  nominalRate: '6.50',
  loanFeeYear: '300',
  loansFeesMonthly: '35',
  points: '1',
  pmiInsurance: '0'
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const buildGeneralInputs = (form: GeneralAprFormState): GeneralAprInputs => ({
  loanAmount: Math.max(0, toNumber(form.loanAmount)),
  loanTermYears: Math.max(0, Math.round(toNumber(form.loanTermYears))),
  loanTermMonths: Math.max(0, Math.min(11, Math.round(toNumber(form.loanTermMonths)))),
  nominalRate: Math.max(0, toNumber(form.nominalRate)),
  compoundingPeriod: form.compoundingPeriod as CompoundingPeriod,
  backPayYear: Math.max(0, toNumber(form.backPayYear)),
  loanedFeesMonthly: Math.max(0, toNumber(form.loanedFeesMonthly)),
  upfrontFees: Math.max(0, toNumber(form.upfrontFees))
})

const buildMortgageInputs = (form: MortgageAprFormState): MortgageAprInputs => ({
  houseValue: Math.max(0, toNumber(form.houseValue)),
  downPaymentPercent: Math.max(0, toNumber(form.downPaymentPercent)),
  loanTermMonths: Math.max(1, Math.round(toNumber(form.loanTermMonths))),
  nominalRate: Math.max(0, toNumber(form.nominalRate)),
  loanFeeYear: Math.max(0, toNumber(form.loanFeeYear)),
  loansFeesMonthly: Math.max(0, toNumber(form.loansFeesMonthly)),
  points: Math.max(0, toNumber(form.points)),
  pmiInsurance: Math.max(0, toNumber(form.pmiInsurance))
})

const initialGeneralResult = (() => {
  const parsed = generalAprSchema.safeParse(buildGeneralInputs(initialGeneralForm))
  return parsed.success ? calculateGeneralApr(parsed.data) : null
})()

const initialMortgageResult = (() => {
  const parsed = mortgageAprSchema.safeParse(buildMortgageInputs(initialMortgageForm))
  return parsed.success ? calculateMortgageApr(parsed.data) : null
})()

export default function APRCalculatorPage() {
  const [mode, setMode] = useState<AprMode>('general')
  const [generalForm, setGeneralForm] = useState(initialGeneralForm)
  const [mortgageForm, setMortgageForm] = useState(initialMortgageForm)
  const [generalResult, setGeneralResult] = useState<AprResults | null>(initialGeneralResult)
  const [mortgageResult, setMortgageResult] = useState<AprResults | null>(initialMortgageResult)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [mortgageError, setMortgageError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const generalInputs = useMemo(() => buildGeneralInputs(generalForm), [generalForm])
  const mortgageInputs = useMemo(() => buildMortgageInputs(mortgageForm), [mortgageForm])

  const currentResult = mode === 'general' ? generalResult : mortgageResult
  const currentPaymentCount = mode === 'general'
    ? getTotalMonths(generalInputs.loanTermYears, generalInputs.loanTermMonths)
    : mortgageInputs.loanTermMonths

  const handleGeneralCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setGeneralError(null)

    const parsed = generalAprSchema.safeParse(generalInputs)
    if (!parsed.success) {
      setGeneralResult(null)
      setGeneralError(parsed.error.issues[0]?.message ?? 'Invalid inputs. Please check your values.')
      return
    }

    try {
      setIsCalculating(true)
      const response = await axios.post<{ results: AprResults }>(apiUrl('/api/calculators/general-apr'), {
        inputs: parsed.data
      })
      setGeneralResult(response.data.results)
    } catch {
      try {
        setGeneralResult(calculateGeneralApr(parsed.data))
        setGeneralError('Unable to reach server. Showing local calculation results.')
      } catch (error) {
        setGeneralResult(null)
        setGeneralError(error instanceof Error ? error.message : 'Unable to calculate the general APR.')
      }
    } finally {
      setIsCalculating(false)
    }
  }

  const handleMortgageCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMortgageError(null)

    const parsed = mortgageAprSchema.safeParse(mortgageInputs)
    if (!parsed.success) {
      setMortgageResult(null)
      setMortgageError(parsed.error.issues[0]?.message ?? 'Invalid inputs. Please check your values.')
      return
    }

    try {
      setIsCalculating(true)
      const response = await axios.post<{ results: AprResults }>(apiUrl('/api/calculators/mortgage-apr'), {
        inputs: parsed.data
      })
      setMortgageResult(response.data.results)
    } catch {
      try {
        setMortgageResult(calculateMortgageApr(parsed.data))
        setMortgageError('Unable to reach server. Showing local calculation results.')
      } catch (error) {
        setMortgageResult(null)
        setMortgageError(error instanceof Error ? error.message : 'Unable to calculate the mortgage APR.')
      }
    } finally {
      setIsCalculating(false)
    }
  }

  const handleGeneralClear = () => {
    setGeneralForm(initialGeneralForm)
    setGeneralResult(initialGeneralResult)
    setGeneralError(null)
  }

  const handleMortgageClear = () => {
    setMortgageForm(initialMortgageForm)
    setMortgageResult(initialMortgageResult)
    setMortgageError(null)
  }

  return (
    <>
    <section className="relative min-h-[calc(100vh-82px)] overflow-hidden bg-[#f5f7fa]">
      <div
        className="pointer-events-none absolute top-[42px] hidden h-[883px] w-[868px] xl:block"
        style={{ left: 'calc(37.5% + 32px)' }}
      >
        <div
          className="absolute flex items-center justify-center"
          style={{ left: '112.89px', top: '127.89px', width: '686.725px', height: '686.725px' }}
        >
          <div className="shrink-0" style={{ transform: 'rotate(-90.57deg)' }}>
            <div className="relative" style={{ width: 680, height: 680 }}>
              <div className="absolute" style={{ inset: '-0.59% -0.57% 4.56% -0.59%' }}>
                <img src={imgEllipse1} alt="" className="block h-full w-full" style={{ maxWidth: 'none' }} />
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute flex items-center justify-center"
          style={{ left: '36.38px', top: '55.38px', width: '839.685px', height: '839.685px' }}
        >
          <div className="shrink-0" style={{ transform: 'rotate(15.83deg)' }}>
            <div className="relative" style={{ width: 680, height: 680 }}>
              <div className="absolute" style={{ inset: '0 -0.57% 48.82% 43.65%' }}>
                <img src={imgEllipse2} alt="" className="block h-full w-full" style={{ maxWidth: 'none' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1360px] px-6 pb-[160px] pt-[131px] xl:px-0">
        <p className="text-[19px] font-semibold text-sub">Home / Finance / APR Calculator</p>

        <h1 className="mt-2 max-w-[586px] text-[48px] font-semibold leading-[1.1] text-heading">APR Calculator</h1>
        <p className="mt-3 max-w-[586px] text-[16px] leading-[25.6px] text-body">
          Compare the stated interest rate with the real APR by factoring in points, upfront fees, recurring charges, and other borrowing costs for both standard loans and mortgages.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[516px_598px] xl:justify-between xl:items-start">
          <div>
            <div className="mb-4 flex rounded-[14px] border border-cardBorder bg-white p-1 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.18)]">
              <button
                type="button"
                onClick={() => setMode('general')}
                className={`flex-1 rounded-[10px] px-4 py-3 text-[16px] font-medium transition ${mode === 'general' ? 'bg-primary text-white' : 'text-sub'}`}
              >
                General APR Calculator
              </button>
              <button
                type="button"
                onClick={() => setMode('mortgage')}
                className={`flex-1 rounded-[10px] px-4 py-3 text-[16px] font-medium transition ${mode === 'mortgage' ? 'bg-primary text-white' : 'text-sub'}`}
              >
                Mortgage APR Calculator
              </button>
            </div>

            {mode === 'general' ? (
              <GeneralAprForm
                form={generalForm}
                onChange={(field, value) => setGeneralForm((previous) => ({ ...previous, [field]: value }))}
                onSubmit={handleGeneralCalculate}
                onClear={handleGeneralClear}
                isCalculating={isCalculating}
                error={generalError}
              />
            ) : (
              <MortgageAprForm
                form={mortgageForm}
                onChange={(field, value) => setMortgageForm((previous) => ({ ...previous, [field]: value }))}
                onSubmit={handleMortgageCalculate}
                onClear={handleMortgageClear}
                isCalculating={isCalculating}
                error={mortgageError}
              />
            )}
          </div>

          <div className="xl:pt-[2px] xl:-ml-[24px]">
            <AprResultsCard result={currentResult} paymentCount={currentPaymentCount} />
          </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/apr" />
    </>
  )
}
