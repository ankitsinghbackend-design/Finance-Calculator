import { z } from 'zod'

export const schema = z.object({
  loanAmount: z.number().nonnegative(),
  interestRate: z.number().min(0),
  loanTermYears: z.number().int().nonnegative(),
  loanTermMonths: z.number().int().min(0).default(0),
  extraMonthlyPayment: z.number().min(0).default(0)
})

export type AmortizationInputs = z.infer<typeof schema>

export interface AmortizationRow {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
}

export interface AmortizationResults {
  monthlyPayment: number
  totalPayments: number
  totalInterest: number
  payoffMonths: number
  schedule: AmortizationRow[]
}

const round2 = (v: number): number => Math.round((v + Number.EPSILON) * 100) / 100

export function calculate(inputs: AmortizationInputs): AmortizationResults {
  const {
    loanAmount,
    interestRate,
    loanTermYears,
    loanTermMonths = 0,
    extraMonthlyPayment = 0
  } = inputs

  const totalMonths = loanTermYears * 12 + loanTermMonths
  const monthlyRate = interestRate / 100 / 12

  if (totalMonths <= 0) {
    return {
      monthlyPayment: 0,
      totalPayments: 0,
      totalInterest: 0,
      payoffMonths: 0,
      schedule: []
    }
  }

  let monthlyPayment: number

  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / totalMonths
  } else {
    monthlyPayment =
      (loanAmount * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -totalMonths))
  }

  let balance = loanAmount
  let totalInterest = 0
  let months = 0

  const schedule: AmortizationRow[] = []

  while (balance > 0 && months < totalMonths + 1) {
    const interest = balance * monthlyRate

    let principal = monthlyPayment - interest
    let payment = monthlyPayment

    if (extraMonthlyPayment > 0) {
      payment += extraMonthlyPayment
      principal += extraMonthlyPayment
    }

    if (principal > balance) {
      principal = balance
      payment = principal + interest
    }

    balance -= principal
    totalInterest += interest
    months++

    schedule.push({
      month: months,
      payment: round2(payment),
      principal: round2(principal),
      interest: round2(interest),
      balance: round2(balance)
    })

    if (balance <= 0) break
  }

  const totalPayments = monthlyPayment * months

  return {
    monthlyPayment: round2(monthlyPayment),
    totalPayments: round2(totalPayments),
    totalInterest: round2(totalInterest),
    payoffMonths: months,
    schedule
  }
}
