import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { calculateAmortization } from '../utils/amortization'

const heroGraphic = 'https://www.figma.com/api/mcp/asset/0649dbdf-6b4c-4205-874b-dbbdef53ccaf'

const currency = (v: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(v)

export default function Amortization() {
  const [loanAmount, setLoanAmount] = useState<number>(200000)
  const [interestRate, setInterestRate] = useState<number>(6)
  const [loanTermYears, setLoanTermYears] = useState<number>(15)
  const [loanTermMonths, setLoanTermMonths] = useState<number>(0)
  const [withExtraPayment, setWithExtraPayment] = useState<boolean>(false)
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(0)

  const result = useMemo(
    () =>
      calculateAmortization({
        loanAmount,
        interestRate,
        loanTermYears,
        loanTermMonths,
        extraMonthlyPayment: withExtraPayment ? extraMonthlyPayment : 0
      }),
    [loanAmount, interestRate, loanTermYears, loanTermMonths, withExtraPayment, extraMonthlyPayment]
  )

  const termLabel = `${Math.floor(result.payoffMonths / 12)} years`

  const clearAll = () => {
    setLoanAmount(0)
    setInterestRate(0)
    setLoanTermYears(0)
    setLoanTermMonths(0)
    setWithExtraPayment(false)
    setExtraMonthlyPayment(0)
  }

  return (
    <div className="bg-alt min-h-full">
      <section className="relative overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-6 xl:px-0 pt-12 pb-16 relative">
          <img
            src={heroGraphic}
            alt=""
            aria-hidden
            className="hidden xl:block absolute right-[-120px] top-[20px] w-[868px] h-[883px] object-contain pointer-events-none"
          />

          <p className="text-[19px] text-body font-semibold">Home / Finance / Amortization</p>

          <div className="grid grid-cols-1 xl:grid-cols-[586px_516px] justify-between gap-8 mt-2">
            <div>
              <h1 className="text-[48px] leading-tight font-semibold text-heading">Amortization Calculator</h1>
              <p className="text-[16px] leading-[25.6px] text-body mt-3">
                There are two general definitions of amortization. The first is the systematic repayment of a loan over time. The second is used in the context of business accounting and is the act of spreading the cost of an expensive and long-lived item over many periods.
              </p>

              <div className="mt-6 border border-cardBorder rounded-[28px] p-5 bg-alt max-w-[516px]">
                <h2 className="text-[19px] font-semibold text-heading">Mortgage Calculator</h2>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-[10px] gap-y-5">
                  <div>
                    <label className="block text-[16px] font-medium text-sub">Home Price</label>
                    <input
                      type="number"
                      className="mt-1.5 h-[42px] w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value || 0))}
                    />
                  </div>

                  <div>
                    <label className="block text-[16px] font-medium text-sub">Loan Term</label>
                    <div className="mt-1.5 grid grid-cols-2 gap-[6px]">
                      <input
                        type="number"
                        className="h-[42px] w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub"
                        value={loanTermYears}
                        onChange={(e) => setLoanTermYears(Number(e.target.value || 0))}
                        placeholder="Years"
                      />
                      <input
                        type="number"
                        className="h-[42px] w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub"
                        value={loanTermMonths}
                        onChange={(e) => setLoanTermMonths(Number(e.target.value || 0))}
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
                      onChange={(e) => setInterestRate(Number(e.target.value || 0))}
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
                          onChange={(e) => setExtraMonthlyPayment(Number(e.target.value || 0))}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <label className="mt-5 flex items-center gap-2 text-[19px] text-sub">
                  <input
                    type="checkbox"
                    checked={withExtraPayment}
                    onChange={(e) => setWithExtraPayment(e.target.checked)}
                    className="h-5 w-5 accent-primary"
                  />
                  Optional: make extra payments
                </label>

                <div className="mt-5 grid grid-cols-2 gap-[15px]">
                  <button className="h-[37px] rounded-lg bg-primary text-white text-[16px] font-medium">Calculate</button>
                  <button
                    onClick={clearAll}
                    className="h-[37px] rounded-lg border border-cardBorder bg-white text-[16px] font-medium text-sub"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-20 xl:pt-[140px] relative z-10">
              <div className="max-w-[516px] ml-auto bg-alt border border-cardBorder rounded-2xl px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
                <div className="text-center">
                  <p className="text-[16px] font-medium text-sub">Monthly Payment</p>
                  <p className="text-[48px] leading-none font-semibold text-heading mt-3">{currency(result.monthlyPayment)}</p>
                </div>

                <div className="h-px bg-[#a7f3d0] my-10" />

                <p className="text-[19px] text-heading font-semibold text-center">Loan Summary</p>

                <div className="mt-8 space-y-4 text-[19px]">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-body font-medium">Total Payments</span>
                    <span className="text-heading font-semibold whitespace-nowrap">{currency(result.totalPayments)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-body font-medium">Total Interest</span>
                    <span className="text-heading font-semibold whitespace-nowrap">{currency(result.totalInterest)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-body font-medium">Loan Term</span>
                    <span className="text-heading font-semibold whitespace-nowrap">{termLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <Link to="/" className="text-primaryDark underline text-[19px] font-semibold">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
