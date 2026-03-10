import { z } from 'zod'

export const balanceModeSchema = z.enum(['remaining-balance', 'original-loan-amount'])

export const schema = z.object({
  balanceMode: balanceModeSchema,
  remainingBalance: z.number().positive('Remaining balance must be greater than 0.'),
  monthlyPayment: z.number().positive('Monthly payment must be greater than 0.'),
  currentInterestRate: z.number().min(0, 'Current interest rate cannot be negative.').max(15, 'Current interest rate must be 15% or less.'),
  newLoanTerm: z.number().positive('New loan term must be greater than 0.').max(40, 'New loan term must be 40 years or less.'),
  newInterestRate: z.number().gt(0, 'New interest rate must be greater than 0.').max(15, 'New interest rate must be 15% or less.'),
  points: z.number().min(0, 'Points cannot be negative.').max(10, 'Points must be 10 or less.'),
  costsAndFees: z.number().min(0, 'Costs and fees cannot be negative.')
})

export type RefinanceInputs = z.infer<typeof schema>

export interface RefinanceResults {
  totalMonthlyPayment: number
  currentLoan: {
    principal: number
    monthlyPay: number
    interestRate: number
    totalPayments: number
    totalInterest: number
    lengthMonths: number
  }
  newLoan: {
    principal: number
    monthlyPay: number
    interestRate: number
    totalPayments: number
    totalInterest: number
    upfrontCost: number
    breakEvenMonths: number
    lengthMonths: number
  }
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const calculateMonthlyPayment = (principal: number, monthlyRate: number, months: number): number => {
  if (months <= 0) {
    throw new Error('Loan length must be greater than 0.')
  }

  if (monthlyRate === 0) {
    return principal / months
  }

  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
}

const solveRemainingMonths = (principal: number, payment: number, annualRate: number): number => {
  const monthlyRate = annualRate / 100 / 12

  if (monthlyRate === 0) {
    return Math.max(1, Math.ceil(principal / payment))
  }

  const minimumPayment = principal * monthlyRate

  if (payment <= minimumPayment) {
    throw new Error('Current monthly payment is too low to amortize the remaining balance.')
  }

  const rawMonths = -Math.log(1 - (principal * monthlyRate) / payment) / Math.log(1 + monthlyRate)

  if (!Number.isFinite(rawMonths) || rawMonths <= 0) {
    throw new Error('Unable to determine the remaining term from the current loan details.')
  }

  return Math.max(1, Math.ceil(rawMonths))
}

export function calculate(inputs: RefinanceInputs): RefinanceResults {
  const currentRemainingMonths = solveRemainingMonths(inputs.remainingBalance, inputs.monthlyPayment, inputs.currentInterestRate)
  const currentTotalPayments = inputs.monthlyPayment * currentRemainingMonths
  const currentTotalInterest = currentTotalPayments - inputs.remainingBalance

  const newLoanMonths = Math.max(1, Math.round(inputs.newLoanTerm * 12))
  const newMonthlyRate = inputs.newInterestRate / 100 / 12
  const newMonthlyPayment = calculateMonthlyPayment(inputs.remainingBalance, newMonthlyRate, newLoanMonths)
  const totalUpfrontCost = inputs.costsAndFees + inputs.remainingBalance * (inputs.points / 100)
  const newTotalPayments = newMonthlyPayment * newLoanMonths
  const newTotalInterest = newTotalPayments - inputs.remainingBalance
  const monthlySavings = inputs.monthlyPayment - newMonthlyPayment
  const breakEvenMonths = monthlySavings > 0 ? totalUpfrontCost / monthlySavings : Number.POSITIVE_INFINITY

  return {
    totalMonthlyPayment: round2(newMonthlyPayment),
    currentLoan: {
      principal: round2(inputs.remainingBalance),
      monthlyPay: round2(inputs.monthlyPayment),
      interestRate: round2(inputs.currentInterestRate),
      totalPayments: round2(currentTotalPayments),
      totalInterest: round2(currentTotalInterest),
      lengthMonths: currentRemainingMonths
    },
    newLoan: {
      principal: round2(inputs.remainingBalance),
      monthlyPay: round2(newMonthlyPayment),
      interestRate: round2(inputs.newInterestRate),
      totalPayments: round2(newTotalPayments),
      totalInterest: round2(newTotalInterest),
      upfrontCost: round2(totalUpfrontCost),
      breakEvenMonths: Number.isFinite(breakEvenMonths) ? round2(breakEvenMonths) : Number.POSITIVE_INFINITY,
      lengthMonths: newLoanMonths
    }
  }
}
