import { z } from 'zod'

export const schema = z.object({
  loanAmount: z.number().positive('Loan amount must be greater than 0.'),
  monthlyPayment: z.number().positive('Monthly payment must be greater than 0.'),
  loanTermYears: z.number().int().min(1, 'Loan term must be at least 1 year.')
})

export type InterestRateInputs = z.infer<typeof schema>

export interface InterestRateResults {
  loanAmount: number
  monthlyPayment: number
  loanTermYears: number
  annualInterestRate: number
  monthlyInterestRate: number
  totalPayments: number
  totalInterest: number
}

const MAX_ITERATIONS = 1000
const TOLERANCE = 0.000001
const MIN_ANNUAL_RATE = 0
const MAX_ANNUAL_RATE = 100

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const paymentForAnnualRate = (loanAmount: number, annualRatePercent: number, months: number): number => {
  const monthlyRate = annualRatePercent / 100 / 12

  if (monthlyRate === 0) {
    return loanAmount / months
  }

  return (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
}

export function calculate(inputs: InterestRateInputs): InterestRateResults {
  const months = inputs.loanTermYears * 12
  const zeroRatePayment = paymentForAnnualRate(inputs.loanAmount, 0, months)

  if (inputs.monthlyPayment < zeroRatePayment - TOLERANCE) {
    throw new Error('Monthly payment is too low to repay this loan within the selected term.')
  }

  let annualInterestRate = 0

  if (Math.abs(inputs.monthlyPayment - zeroRatePayment) > TOLERANCE) {
    const maxRatePayment = paymentForAnnualRate(inputs.loanAmount, MAX_ANNUAL_RATE, months)

    if (inputs.monthlyPayment > maxRatePayment + TOLERANCE) {
      throw new Error('Monthly payment implies an interest rate above the supported 100% annual range.')
    }

    let low = MIN_ANNUAL_RATE
    let high = MAX_ANNUAL_RATE
    let mid = 0

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration += 1) {
      mid = (low + high) / 2
      const estimatedPayment = paymentForAnnualRate(inputs.loanAmount, mid, months)
      const difference = estimatedPayment - inputs.monthlyPayment

      if (Math.abs(difference) < TOLERANCE) {
        annualInterestRate = mid
        break
      }

      if (estimatedPayment > inputs.monthlyPayment) {
        high = mid
      } else {
        low = mid
      }

      annualInterestRate = (low + high) / 2
    }
  }

  const monthlyInterestRate = annualInterestRate / 12
  const totalPayments = inputs.monthlyPayment * months
  const totalInterest = totalPayments - inputs.loanAmount

  return {
    loanAmount: round2(inputs.loanAmount),
    monthlyPayment: round2(inputs.monthlyPayment),
    loanTermYears: inputs.loanTermYears,
    annualInterestRate: round2(annualInterestRate),
    monthlyInterestRate: round2(monthlyInterestRate),
    totalPayments: round2(totalPayments),
    totalInterest: round2(totalInterest)
  }
}
