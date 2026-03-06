import { z } from 'zod'

export const schema = z.object({
  loanAmount: z.number().nonnegative(),
  interestRate: z.number().min(0),
  originalTermYears: z.number().positive(),
  remainingYears: z.number().min(0),
  remainingMonths: z.number().min(0),
  extraMonthlyPayment: z.number().min(0).default(0)
})

export type MortgagePayoffInputs = z.infer<typeof schema>

export interface MortgagePayoffResults {
  monthlyPayment: number
  payoffTime: string
  totalInterest: number
  totalPayments: number
}

const round2 = (v: number): number => Math.round((v + Number.EPSILON) * 100) / 100

export function calculate(inputs: MortgagePayoffInputs): MortgagePayoffResults {
  const {
    loanAmount,
    interestRate,
    originalTermYears,
    remainingYears,
    remainingMonths,
    extraMonthlyPayment = 0
  } = inputs

  const monthlyRate = interestRate / 100 / 12
  const originalMonths = originalTermYears * 12
  const remainingTermMonths = remainingYears * 12 + remainingMonths

  const monthlyPayment =
    monthlyRate === 0
      ? loanAmount / originalMonths
      : (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -originalMonths))

  let balance = loanAmount
  let months = 0
  let totalInterest = 0

  while (balance > 0 && months < 1000) {
    const interest = balance * monthlyRate

    const payment = Math.min(monthlyPayment + extraMonthlyPayment, balance + interest)

    const principal = payment - interest

    balance -= principal
    totalInterest += interest

    months++

    if (monthlyRate === 0 && months >= remainingTermMonths && extraMonthlyPayment <= 0) {
      break
    }
  }

  const payoffYears = Math.floor(months / 12)
  const payoffMonths = months % 12

  const totalPayments = months * (monthlyPayment + extraMonthlyPayment)

  return {
    monthlyPayment: round2(monthlyPayment),
    payoffTime: `${payoffYears} yrs ${payoffMonths} months`,
    totalInterest: round2(totalInterest),
    totalPayments: round2(totalPayments)
  }
}
