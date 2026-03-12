import React, { FormEvent, useMemo, useState } from 'react'
import { calculateAmortization } from '../utils/amortization'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'

const heroGraphic = 'https://www.figma.com/api/mcp/asset/99ee5331-e90e-486e-bd3b-e8c1939b6240'

const currency = (v: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(v)

export default function Amortization() {
  const [loanAmount, setLoanAmount] = useState<string>('200000')
  const [interestRate, setInterestRate] = useState<string>('6')
  const [loanTermYears, setLoanTermYears] = useState<string>('15')
  const [loanTermMonths, setLoanTermMonths] = useState<string>('0')
  const [withExtraPayment, setWithExtraPayment] = useState<boolean>(false)
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<string>('0')
  const [result, setResult] = useState<ReturnType<typeof calculateAmortization> | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculateError, setCalculateError] = useState<string | null>(null)

  const parsedInputs = useMemo(
    () => ({
      loanAmount: Math.max(0, Number(loanAmount) || 0),
      interestRate: Math.max(0, Number(interestRate) || 0),
      loanTermYears: Math.max(0, Math.round(Number(loanTermYears) || 0)),
      loanTermMonths: Math.max(0, Math.round(Number(loanTermMonths) || 0)),
      extraMonthlyPayment: withExtraPayment ? Math.max(0, Number(extraMonthlyPayment) || 0) : 0
    }),
    [loanAmount, interestRate, loanTermYears, loanTermMonths, withExtraPayment, extraMonthlyPayment]
  )

  const handleCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCalculateError(null)

    try {
      setIsCalculating(true)
      const response = await axios.post<{ results: ReturnType<typeof calculateAmortization> }>(
        apiUrl('/api/calculators/amortization'),
        { inputs: parsedInputs }
      )
      setResult(response.data.results)
    } catch {
      setResult(calculateAmortization(parsedInputs))
      setCalculateError('Unable to reach server. Showing local calculation results.')
    } finally {
      setIsCalculating(false)
    }
  }

  const clearAll = () => {
    setLoanAmount('0')
    setInterestRate('0')
    setLoanTermYears('0')
    setLoanTermMonths('0')
    setWithExtraPayment(false)
    setExtraMonthlyPayment('0')
    setResult(null)
    setCalculateError(null)
  }

  return (
    <>
    <div className="bg-alt min-h-full">
      <section className="relative overflow-hidden bg-[#f5f7fa] py-12 min-h-[calc(100vh-82px)]">
        <div className="max-w-[1440px] mx-auto px-6 xl:px-10 relative isolate">
          <img
            src={heroGraphic}
            alt=""
            aria-hidden
            className="hidden xl:block absolute right-[-78px] top-[-28px] z-0 w-[868px] h-[883px] object-contain pointer-events-none"
          />

          <div className="relative z-10">
          <p className="text-[19px] text-sub font-semibold">Home / Finance / Amortization</p>

          <div className="grid grid-cols-1 xl:grid-cols-[586px_516px] justify-between gap-8 mt-3">
            <div>
              <h1 className="text-[48px] leading-none font-semibold text-heading">Amortization Calculator</h1>
              <p className="text-[16px] leading-[25.6px] text-body mt-3">
                There are two general definitions of amortization. The first is the systematic repayment of a loan over time. The second is used in the context of business accounting and is the act of spreading the cost of an expensive and long-lived item over many periods.
              </p>

              <form onSubmit={handleCalculate} className="mt-8 border border-cardBorder rounded-[28px] p-5 bg-[#f9fafb] backdrop-blur-[10.5px] max-w-[516px]">
                <h2 className="text-[19px] font-semibold text-heading">Amortization Calculator</h2>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-[10px] gap-y-5">
                  <div>
                    <label className="block text-[16px] font-medium text-sub">Loan Amount</label>
                    <input
                      type="number"
                      className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      placeholder="$0"
                    />
                  </div>

                  <div>
                    <label className="block text-[16px] font-medium text-sub">Loan Term</label>
                    <div className="mt-1.5 grid grid-cols-2 gap-[6px]">
                      <input
                        type="number"
                        className="h-[42px] w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub"
                        value={loanTermYears}
                        onChange={(e) => setLoanTermYears(e.target.value)}
                        placeholder="Years"
                      />
                      <input
                        type="number"
                        className="h-[42px] w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub"
                        value={loanTermMonths}
                        onChange={(e) => setLoanTermMonths(e.target.value)}
                        placeholder="Months"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[16px] font-medium text-sub">Interest Rate</label>
                    <input
                      type="number"
                      step="0.01"
                      className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      placeholder="%"
                    />
                  </div>

                  <div className="flex items-end">
                    {withExtraPayment && (
                      <div className="w-full">
                        <label className="block text-[16px] font-medium text-sub">Extra Monthly Payment</label>
                        <input
                          type="number"
                          className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub"
                          value={extraMonthlyPayment}
                          onChange={(e) => setExtraMonthlyPayment(e.target.value)}
                          placeholder="$"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <label className="mt-5 flex items-center gap-[10px] text-[19px] text-heading font-semibold">
                  <input
                    type="checkbox"
                    checked={withExtraPayment}
                    onChange={(e) => setWithExtraPayment(e.target.checked)}
                    className="h-5 w-5 accent-primary"
                  />
                  Optional: make extra payments
                </label>

                <div className="mt-5 grid grid-cols-2 gap-[15px]">
                  <button type="submit" disabled={isCalculating} className="h-[37px] rounded-lg bg-primary text-white text-[16px] font-medium disabled:opacity-60">
                    {isCalculating ? 'Calculating...' : 'Calculate'}
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="h-[37px] rounded-lg border border-cardBorder bg-white text-[16px] font-medium text-sub"
                  >
                    Clear
                  </button>
                </div>
                {calculateError && <p className="text-sm text-red-600 mt-3">{calculateError}</p>}
              </form>
            </div>

            <div className="xl:mt-[180px] relative z-20">
              <div className="max-w-[516px] ml-auto bg-white border border-cardBorder rounded-[16px] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)] overflow-hidden">
                <div className="text-center">
                  <p className="text-[16px] font-medium text-sub">Total Monthly Payment</p>
                  <p className="text-[40px] leading-none font-semibold text-heading mt-3">{result ? currency(result.monthlyPayment) : '$0.00'}</p>
                </div>

                <div className="h-px bg-[#a7f3d0] my-10" />

                <p className="text-[19px] text-heading font-semibold text-center">Amortization</p>

                <div className="mt-8 space-y-4 text-[19px]">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-body font-medium">Total of {result ? result.payoffMonths : parsedInputs.loanTermYears * 12 + parsedInputs.loanTermMonths} monthly payments</span>
                    <span className="text-heading font-semibold whitespace-nowrap">{result ? currency(result.totalPayments) : '$0.00'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-body font-medium">Total Interest</span>
                    <span className="text-heading font-semibold whitespace-nowrap">{result ? currency(result.totalInterest) : '$0.00'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>
    </div>

    <CalculatorMarketingSections loginRedirectPath="/calculators/amortization" />
    </>
  )
}
