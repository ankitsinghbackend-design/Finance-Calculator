import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import DTIForm, { type DTIFormState } from '../components/calculators/DTIForm'
import DTIResults from '../components/calculators/DTIResults'
import {
  calculate,
  schema,
  type DebtToIncomeInputs,
  type DebtToIncomeResults
} from '../../backend/calculations/debtToIncome'

/* ── Figma ellipse decorative assets ── */
const imgEllipse1 = 'https://www.figma.com/api/mcp/asset/dbdf40ce-8d55-40b7-9641-f9023e11e5f4'
const imgEllipse2 = 'https://www.figma.com/api/mcp/asset/4f7eadab-ac2f-4cb7-9e8d-49b7dc6f92f3'

/* ── Initial form values ── */
const initialForm: DTIFormState = {
  salaryIncome: '72000',
  pensionIncome: '0',
  investmentIncome: '6000',
  otherIncome: '0',
  rentalCost: '12000',
  mortgage: '18000',
  propertyTax: '3600',
  hoaFees: '1200',
  homeownerInsurance: '1500',
  studentLoan: '2400',
  autoLoan: '4800',
  otherLiabilities: '2400'
}

const toNumber = (v: string): number => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const buildInputs = (f: DTIFormState): DebtToIncomeInputs => ({
  salaryIncome: Math.max(0, toNumber(f.salaryIncome)),
  pensionIncome: Math.max(0, toNumber(f.pensionIncome)),
  investmentIncome: Math.max(0, toNumber(f.investmentIncome)),
  otherIncome: Math.max(0, toNumber(f.otherIncome)),
  rentalCost: Math.max(0, toNumber(f.rentalCost)),
  mortgage: Math.max(0, toNumber(f.mortgage)),
  propertyTax: Math.max(0, toNumber(f.propertyTax)),
  hoaFees: Math.max(0, toNumber(f.hoaFees)),
  homeownerInsurance: Math.max(0, toNumber(f.homeownerInsurance)),
  studentLoan: Math.max(0, toNumber(f.studentLoan)),
  autoLoan: Math.max(0, toNumber(f.autoLoan)),
  otherLiabilities: Math.max(0, toNumber(f.otherLiabilities))
})

const initialResult = (() => {
  try {
    return calculate(schema.parse(buildInputs(initialForm)))
  } catch {
    return null
  }
})()

export default function DebtToIncomeCalculatorPage() {
  const [form, setForm] = useState<DTIFormState>(initialForm)
  const [result, setResult] = useState<DebtToIncomeResults | null>(initialResult)
  const [calcError, setCalcError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currentInputs = useMemo(() => buildInputs(form), [form])

  /* ── Calculate ── */
  const handleCalculate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCalcError(null)

    const parsed = schema.safeParse(currentInputs)
    if (!parsed.success) {
      setResult(null)
      setCalcError(parsed.error.issues[0]?.message ?? 'Invalid inputs.')
      return
    }

    try {
      setIsCalculating(true)
      const res = await axios.post<{ results: DebtToIncomeResults }>(
        apiUrl('/api/calculators/debt-to-income'),
        { inputs: parsed.data }
      )
      setResult(res.data.results)
    } catch {
      try {
        setResult(calculate(parsed.data))
        setCalcError('Unable to reach server. Showing local results.')
      } catch (err) {
        setResult(null)
        setCalcError(err instanceof Error ? err.message : 'Calculation failed.')
      }
    } finally {
      setIsCalculating(false)
    }
  }

  /* ── Clear ── */
  const handleClear = () => {
    setForm({
      salaryIncome: '', pensionIncome: '', investmentIncome: '', otherIncome: '',
      rentalCost: '', mortgage: '', propertyTax: '', hoaFees: '',
      homeownerInsurance: '', studentLoan: '', autoLoan: '', otherLiabilities: ''
    })
    setResult(null)
    setCalcError(null)
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f5f7fa]">
      {/* ────────────────────────────────────────────────────
          Decorative Graphic — desktop only (ellipses only)
          Matches Figma node 162:925
          ──────────────────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute top-[42px] hidden h-[883px] w-[868px] xl:block"
        style={{ left: 'calc(37.5% + 32px)' }}
      >
        {/* Ellipse 1 — Figma 162:926 */}
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

        {/* Ellipse 2 — Figma 162:927 */}
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

      {/* ────────────────────────────────────────────────────
          Page content
          ──────────────────────────────────────────────────── */}
      <div className="relative z-10 px-6 pb-16 pt-12 xl:px-10">
        {/* Breadcrumb — Figma 162:969 */}
        <p className="text-[19px] font-semibold text-sub">
          Home / Finance / Debt-to-Income (DTI) Ratio Calculator
        </p>

        {/* Title + description — Figma 162:938 */}
        <div className="mt-[12px] flex max-w-[586px] flex-col gap-[12px]">
          <h1 className="text-[48px] font-semibold leading-[1] text-heading">
            Debt-to-Income (DTI) Ratio Calculator
          </h1>
          <p className="text-[16px] leading-[25.6px] text-body">
            Debt-to-income ratio (DTI) is the ratio of total debt payments divided by
            gross income (before tax) expressed as a percentage, usually on either a
            monthly or annual basis. As a quick example, if someone's monthly income is
            $1,000 and they spend $480 on debt each month, their DTI ratio is 48%. If
            they had no debt, their ratio is 0%.
          </p>
        </div>

        {/* ── Two-column layout: form (left) + results strip (right on xl) ── */}
        <div className="mt-8 flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-16">
          {/* Form — Figma 162:942 */}
          <div className="w-full max-w-[516px] shrink-0">
            <DTIForm
              form={form}
              onChange={(field: keyof DTIFormState, value: string) => setForm((prev) => ({ ...prev, [field]: value }))}
              onSubmit={handleCalculate}
              onClear={handleClear}
              isCalculating={isCalculating}
              error={calcError}
            />
          </div>

          {/* Results strip — Figma 162:928 */}
          <div className="w-full max-w-[598px] xl:mt-[280px]">
            <DTIResults result={result} />
          </div>
        </div>
      </div>
    </section>
  )
}
