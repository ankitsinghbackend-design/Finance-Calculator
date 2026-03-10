import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import ellipseBg from '../assets/Ellipse 1.svg'

type RepaymentOption = 'original' | 'extra' | 'biweekly' | 'normal'

type MortgagePayoffFormState = {
  loanAmount: string
  originalTermYears: string
  originalTermMonths: string
  interestRate: string
  remainingYears: string
  remainingMonths: string
  extraPerMonth: string
  extraPerYear: string
  oneTime: string
}

type MortgagePayoffResult = {
  monthlyPayment: number
  payoffTime: string
  totalInterest: number
  totalPayments: number
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

const parsePayoffYears = (payoffTime: string): number => {
  const match = payoffTime.match(/^(\d+)\s+yrs\s+(\d+)\s+months$/)
  if (!match) return 0
  return Number(match[1]) + Number(match[2]) / 12
}

const parsePayoffMonths = (payoffTime: string): number => {
  const match = payoffTime.match(/^(\d+)\s+yrs\s+(\d+)\s+months$/)
  if (!match) return 0
  return Number(match[1]) * 12 + Number(match[2])
}

export default function MortgagePayoffPage() {
  const [form, setForm] = useState<MortgagePayoffFormState>({
    loanAmount: '300000',
    originalTermYears: '30',
    originalTermMonths: '0',
    interestRate: '6.5',
    remainingYears: '25',
    remainingMonths: '0',
    extraPerMonth: '0',
    extraPerYear: '0',
    oneTime: '0'
  })
  const [repaymentOption, setRepaymentOption] = useState<RepaymentOption>('normal')
  const [baseResult, setBaseResult] = useState<MortgagePayoffResult | null>(null)
  const [payoffResult, setPayoffResult] = useState<MortgagePayoffResult | null>(null)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const remainingTermMonths = useMemo(
    () => Math.max(1, toNumber(form.remainingYears) * 12 + toNumber(form.remainingMonths)),
    [form.remainingYears, form.remainingMonths]
  )

  const extraMonthlyPayment = useMemo(() => {
    const perMonth = Math.max(0, toNumber(form.extraPerMonth))
    const perYear = Math.max(0, toNumber(form.extraPerYear)) / 12
    const oneTime = Math.max(0, toNumber(form.oneTime)) / remainingTermMonths

    if (repaymentOption === 'original' || repaymentOption === 'normal') return 0
    if (repaymentOption === 'extra') return perMonth + perYear + oneTime

    // biweekly approximation (13 monthly payments equivalent in a year)
    return perMonth + perYear + oneTime + (baseResult?.monthlyPayment ?? 0) / 12
  }, [form.extraPerMonth, form.extraPerYear, form.oneTime, remainingTermMonths, repaymentOption, baseResult?.monthlyPayment])

  const runLocalPayoff = (inputs: {
    loanAmount: number
    interestRate: number
    originalTermYears: number
    remainingYears: number
    remainingMonths: number
    extraMonthlyPayment: number
  }): MortgagePayoffResult => {
    const monthlyRate = inputs.interestRate / 100 / 12
    const originalMonths = inputs.originalTermYears * 12

    const monthlyPayment =
      monthlyRate === 0
        ? inputs.loanAmount / originalMonths
        : (inputs.loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -originalMonths))

    let balance = inputs.loanAmount
    let months = 0
    let totalInterest = 0

    while (balance > 0 && months < 1000) {
      const interest = balance * monthlyRate
      const payment = Math.min(monthlyPayment + inputs.extraMonthlyPayment, balance + interest)
      const principal = payment - interest
      balance -= principal
      totalInterest += interest
      months++
    }

    const payoffYears = Math.floor(months / 12)
    const payoffMonths = months % 12

    return {
      monthlyPayment: Math.round((monthlyPayment + Number.EPSILON) * 100) / 100,
      payoffTime: `${payoffYears} yrs ${payoffMonths} months`,
      totalInterest: Math.round((totalInterest + Number.EPSILON) * 100) / 100,
      totalPayments: Math.round((months * (monthlyPayment + inputs.extraMonthlyPayment) + Number.EPSILON) * 100) / 100
    }
  }

  const handleCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCalculateError(null)

    const normalizedInputs = {
      loanAmount: Math.max(0, toNumber(form.loanAmount)),
      interestRate: Math.max(0, toNumber(form.interestRate)),
      originalTermYears: Math.max(1, toNumber(form.originalTermYears)),
      remainingYears: Math.max(0, toNumber(form.remainingYears)),
      remainingMonths: Math.max(0, toNumber(form.remainingMonths))
    }

    const payloadBase = {
      ...normalizedInputs,
      extraMonthlyPayment: 0
    }

    const payloadPayoff = {
      ...normalizedInputs,
      extraMonthlyPayment: Math.max(0, extraMonthlyPayment)
    }

    try {
      setIsCalculating(true)

      const [baseResponse, payoffResponse] = await Promise.all([
        axios.post<{ results: MortgagePayoffResult }>(apiUrl('/api/calculators/mortgage-payoff'), {
          inputs: payloadBase
        }),
        axios.post<{ results: MortgagePayoffResult }>(apiUrl('/api/calculators/mortgage-payoff'), {
          inputs: payloadPayoff
        })
      ])

      setBaseResult(baseResponse.data.results)
      setPayoffResult(payoffResponse.data.results)
    } catch {
      setCalculateError('Unable to reach server. Showing local calculation results.')
      setBaseResult(runLocalPayoff(payloadBase))
      setPayoffResult(runLocalPayoff(payloadPayoff))
    } finally {
      setIsCalculating(false)
    }
  }

  const handleClear = () => {
    setForm({
      loanAmount: '300000',
      originalTermYears: '30',
      originalTermMonths: '0',
      interestRate: '6.5',
      remainingYears: '25',
      remainingMonths: '0',
      extraPerMonth: '0',
      extraPerYear: '0',
      oneTime: '0'
    })
    setRepaymentOption('normal')
    setBaseResult(null)
    setPayoffResult(null)
    setCalculateError(null)
  }

  const base =
    baseResult ??
    runLocalPayoff({
      loanAmount: Math.max(0, toNumber(form.loanAmount)),
      interestRate: Math.max(0, toNumber(form.interestRate)),
      originalTermYears: Math.max(1, toNumber(form.originalTermYears)),
      remainingYears: Math.max(0, toNumber(form.remainingYears)),
      remainingMonths: Math.max(0, toNumber(form.remainingMonths)),
      extraMonthlyPayment: 0
    })

  const payoff =
    payoffResult ??
    runLocalPayoff({
      loanAmount: Math.max(0, toNumber(form.loanAmount)),
      interestRate: Math.max(0, toNumber(form.interestRate)),
      originalTermYears: Math.max(1, toNumber(form.originalTermYears)),
      remainingYears: Math.max(0, toNumber(form.remainingYears)),
      remainingMonths: Math.max(0, toNumber(form.remainingMonths)),
      extraMonthlyPayment: Math.max(0, extraMonthlyPayment)
    })

  const remainingPaymentsBase = Math.max(0, base.totalPayments - Math.max(0, toNumber(form.loanAmount)))
  const remainingPaymentsPayoff = Math.max(0, payoff.totalPayments - Math.max(0, toNumber(form.loanAmount)))

  return (
    <section className="bg-[#f5f7fa] py-12">
      <div className="max-w-[1360px] mx-auto px-6 xl:px-0">
        <p className="text-[19px] text-sub font-semibold">Home / Finance / Mortgage Payoff Calculator</p>

        <h1 className="text-[48px] leading-[1.1] font-semibold text-heading mt-2 max-w-[586px]">Mortgage Payoff Calculator</h1>
        <p className="text-[16px] leading-[25.6px] text-body mt-2 max-w-[586px]">
          This mortgage payoff calculator helps evaluate how adding extra payments or bi-weekly payments can save on interest and shorten mortgage term.
        </p>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[516px_516px] justify-between gap-8 items-start">
          <form onSubmit={handleCalculate} className="border border-cardBorder rounded-[28px] p-5 bg-[#f9fafb]">
            <h2 className="text-[19px] font-semibold text-heading">Payoff Calculator</h2>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              <div>
                <p className="text-[16px] text-sub font-medium">Original loan amount</p>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.loanAmount}
                  onChange={(e) => setForm((prev) => ({ ...prev, loanAmount: e.target.value }))}
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                  placeholder="$0"
                />
              </div>
              <div>
                <p className="text-[16px] text-sub font-medium">Original loan term</p>
                <div className="mt-1.5 grid grid-cols-2 gap-[6px]">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.originalTermYears}
                    onChange={(e) => setForm((prev) => ({ ...prev, originalTermYears: e.target.value }))}
                    className="h-[42px] rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                    placeholder="Year"
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.originalTermMonths}
                    onChange={(e) => setForm((prev) => ({ ...prev, originalTermMonths: e.target.value }))}
                    className="h-[42px] rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                    placeholder="Months"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              <div>
                <p className="text-[16px] text-sub font-medium">Interest Rate</p>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.interestRate}
                  onChange={(e) => setForm((prev) => ({ ...prev, interestRate: e.target.value }))}
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                  placeholder="%"
                />
              </div>
              <div>
                <p className="text-[16px] text-sub font-medium">Remaining Term</p>
                <div className="mt-1.5 grid grid-cols-2 gap-[6px]">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.remainingYears}
                    onChange={(e) => setForm((prev) => ({ ...prev, remainingYears: e.target.value }))}
                    className="h-[42px] rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                    placeholder="Year"
                  />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.remainingMonths}
                    onChange={(e) => setForm((prev) => ({ ...prev, remainingMonths: e.target.value }))}
                    className="h-[42px] rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                    placeholder="Months"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[19px] font-semibold text-heading">Repayment options:</p>

              <div className="mt-2 space-y-2 text-[16px] text-sub">
                {[
                  { key: 'original', label: 'Original loan amount' },
                  { key: 'extra', label: 'Repayment with extra payments' },
                  { key: 'biweekly', label: 'Biweekly Repayment' },
                  { key: 'normal', label: 'Normal Repayment' }
                ].map((option) => (
                  <label key={option.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="repaymentOption"
                      checked={repaymentOption === option.key}
                      onChange={() => setRepaymentOption(option.key as RepaymentOption)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>

              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-[10px]">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.extraPerMonth}
                    onChange={(e) => setForm((prev) => ({ ...prev, extraPerMonth: e.target.value }))}
                    className="h-[42px] w-[120px] rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                    placeholder="$"
                  />
                  <p className="text-[16px] text-sub font-medium">Per Month</p>
                </div>
                <div className="flex items-center gap-[10px]">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.extraPerYear}
                    onChange={(e) => setForm((prev) => ({ ...prev, extraPerYear: e.target.value }))}
                    className="h-[42px] w-[120px] rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                    placeholder="$"
                  />
                  <p className="text-[16px] text-sub font-medium">Per Year</p>
                </div>
                <div className="flex items-center gap-[10px]">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.oneTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, oneTime: e.target.value }))}
                    className="h-[42px] w-[120px] rounded-md border border-cardBorder bg-[#f9fafb] px-2 text-[16px] text-sub font-medium"
                    placeholder="$"
                  />
                  <p className="text-[16px] text-sub font-medium">One Time</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-[15px]">
              <button
                type="submit"
                disabled={isCalculating}
                className="h-[42px] rounded-lg bg-primary text-white text-[16px] font-medium shadow-card"
              >
                {isCalculating ? 'Calculating...' : 'Calculate'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="h-[42px] rounded-lg bg-white border border-[#e1e6ef] text-[#1d2433] text-[16px] font-medium shadow-card"
              >
                Clear
              </button>
            </div>

            {calculateError ? (
              <p className="mt-3 text-sm text-red-600" role="status" aria-live="polite">
                {calculateError}
              </p>
            ) : null}
          </form>

          <div className="relative">
            <img
              src={ellipseBg}
              alt=""
              aria-hidden
              className="absolute -right-[210px] -top-[260px] w-[655px] max-w-none opacity-90 pointer-events-none select-none z-0"
            />
            <div className="relative z-10 bg-[#f9fafb] border border-cardBorder rounded-2xl px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
            <div className="text-center">
              <p className="text-[16px] font-medium text-sub">Total Monthly Payment</p>
              <p className="text-[40px] leading-none font-semibold text-heading mt-3">
                {formatCurrency(payoff.monthlyPayment + Math.max(0, extraMonthlyPayment))}
              </p>
            </div>

            <div className="h-px bg-[#a7f3d0] my-8" />

            <div className="flex items-center justify-between">
              <p className="text-[19px] text-sub font-semibold">Mortgage Payoff Calculator</p>
            </div>

            <div className="mt-4">
              <p className="text-[19px] text-heading font-semibold">Original</p>
              <div className="space-y-1.5 mt-2 text-[19px]">
                <div className="flex items-center justify-between"><p className="text-body font-semibold">Monthly pay</p><p className="text-sub font-semibold">{formatCurrency(base.monthlyPayment)}</p></div>
                <div className="flex items-center justify-between"><p className="text-body font-semibold">Total payments</p><p className="text-sub font-semibold">{formatCurrency(base.totalPayments)}</p></div>
                <div className="flex items-center justify-between"><p className="text-body font-semibold">Total interest</p><p className="text-sub font-semibold">{formatCurrency(base.totalInterest)}</p></div>
                <div className="flex items-center justify-between"><p className="text-body font-semibold">Remaining payments</p><p className="text-sub font-semibold">{formatCurrency(remainingPaymentsBase)}</p></div>
                <div className="flex items-center justify-between"><p className="text-body font-semibold">Remaining interest</p><p className="text-sub font-semibold">{formatCurrency(base.totalInterest)}</p></div>
                <div className="flex items-center justify-between"><p className="text-body font-semibold">Payoff in</p><p className="text-sub font-semibold">{base.payoffTime}</p></div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[19px] text-heading font-semibold">With Payoff</p>
              <div className="space-y-1.5 mt-2 text-[19px]">
                <div className="flex items-center justify-between"><p className="text-body font-semibold">Monthly pay</p><p className="text-sub font-semibold">{formatCurrency(payoff.monthlyPayment + Math.max(0, extraMonthlyPayment))}</p></div>
                <div className="flex items-center justify-between"><p className="text-body font-semibold">Total payments</p><p className="text-sub font-semibold">{formatCurrency(payoff.totalPayments)}</p></div>
                <div className="flex items-center justify-between"><p className="text-body font-semibold">Total interest</p><p className="text-sub font-semibold">{formatCurrency(payoff.totalInterest)}</p></div>
                <div className="flex items-center justify-between"><p className="text-body font-semibold">Remaining payments</p><p className="text-sub font-semibold">{formatCurrency(remainingPaymentsPayoff)}</p></div>
                <div className="flex items-center justify-between"><p className="text-body font-semibold">Remaining interest</p><p className="text-sub font-semibold">{formatCurrency(payoff.totalInterest)}</p></div>
                <div className="flex items-center justify-between"><p className="text-body font-semibold">Payoff in</p><p className="text-sub font-semibold">{parsePayoffYears(payoff.payoffTime) > 0 ? payoff.payoffTime : `${parsePayoffMonths(payoff.payoffTime)} months`}</p></div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
