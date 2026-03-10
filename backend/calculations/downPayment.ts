import { z } from 'zod'

export const schema = z
  .object({
    upfrontCashAvailable: z.number().positive('Upfront cash available must be greater than 0.'),
    downPaymentAmount: z.number().positive('Down payment must be greater than 0.'),
    drawPeriod: z.number().int().min(0, 'Draw period cannot be negative.').max(360, 'Draw period must be 360 months or less.'),
    paymentPeriod: z.number().positive('Payment period must be greater than 0.').max(50, 'Payment period must be 50 years or less.'),
    loanTerm: z.number().positive('Loan term must be greater than 0.').max(50, 'Loan term must be 50 years or less.'),
    includingClosingCosts: z.boolean()
  })
  .superRefine((value, ctx) => {
    const inferredHomePrice = value.downPaymentAmount > 0 ? value.downPaymentAmount / 0.2 : value.upfrontCashAvailable / 0.2
    const estimatedClosingCosts = inferredHomePrice * 0.03

    if (value.includingClosingCosts && value.upfrontCashAvailable <= estimatedClosingCosts) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['upfrontCashAvailable'],
        message: 'Upfront cash available must be greater than the estimated closing costs.'
      })
    }
  })

export type DownPaymentInputs = z.infer<typeof schema>

export interface DownPaymentResults {
  totalMonthlyPayment: number
  homePrice: number
  downPayment: number
  closingCosts: number
  loanAmount: number
  monthlyPayment: number
}

const DEFAULT_INTEREST_RATE = 6.5
const DEFAULT_DOWN_PAYMENT_RATIO = 0.2
const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

export function calculate(inputs: DownPaymentInputs): DownPaymentResults {
  const inferredHomePrice = inputs.downPaymentAmount > 0 ? inputs.downPaymentAmount / DEFAULT_DOWN_PAYMENT_RATIO : inputs.upfrontCashAvailable / DEFAULT_DOWN_PAYMENT_RATIO
  const closingCostEstimate = inputs.includingClosingCosts ? inferredHomePrice * 0.03 : 0
  const effectiveDownPayment = Math.max(0, Math.min(inputs.downPaymentAmount, inputs.upfrontCashAvailable - closingCostEstimate))
  const loanAmount = Math.max(0, inferredHomePrice - effectiveDownPayment)
  const monthlyRate = DEFAULT_INTEREST_RATE / 100 / 12
  const totalMonths = Math.max(1, Math.round(inputs.loanTerm * 12))

  const monthlyPayment =
    monthlyRate === 0
      ? loanAmount / totalMonths
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)

  return {
    totalMonthlyPayment: round2(monthlyPayment),
    homePrice: round2(inferredHomePrice),
    downPayment: round2(effectiveDownPayment),
    closingCosts: round2(closingCostEstimate),
    loanAmount: round2(loanAmount),
    monthlyPayment: round2(monthlyPayment)
  }
}
