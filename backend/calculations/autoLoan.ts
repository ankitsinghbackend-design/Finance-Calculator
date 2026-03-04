import { z } from 'zod'

/**
 * Input schema for Auto Loan calculator.
 * All monetary values are expected in the same currency unit.
 */
export const schema = z.object({
  price: z.number().nonnegative(),
  termMonths: z.number().int().positive(),
  annualRatePct: z.number().min(0),
  downPayment: z.number().min(0).default(0),
  tradeInValue: z.number().min(0).default(0),
  amountOwedOnTradeIn: z.number().min(0).default(0),
  cashIncentives: z.number().min(0).default(0),
  salesTaxPct: z.number().min(0).default(0),
  titlesFees: z.number().min(0).default(0),
  otherFees: z.number().min(0).default(0)
})

export type AutoLoanInputs = z.infer<typeof schema>

export interface AutoLoanResults {
  loanAmount: number
  monthlyPayment: number
  totalPayments: number
  totalInterest: number
  saleTax: number
  totalCost: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

/**
 * Pure auto loan calculator.
 * Uses standard amortization formula and handles zero-rate edge case.
 */
export function calculate(inputs: AutoLoanInputs): AutoLoanResults {
  const saleTax = (inputs.price * inputs.salesTaxPct) / 100

const netTrade = Math.max(0, inputs.tradeInValue - inputs.amountOwedOnTradeIn)
const negativeEquity = Math.max(0, inputs.amountOwedOnTradeIn - inputs.tradeInValue)

const loanAmount = Math.max(
  0,
  inputs.price +
    saleTax +
    inputs.titlesFees +
    inputs.otherFees +
    negativeEquity -
    inputs.downPayment -
    netTrade -
    inputs.cashIncentives
)

const n = inputs.termMonths
const monthlyRate = inputs.annualRatePct / 100 / 12

const monthlyPayment =
  monthlyRate === 0
    ? loanAmount / n
    : (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n))

const totalPayments = monthlyPayment * n
const totalInterest = Math.max(0, totalPayments - loanAmount)

const totalCost =
  inputs.price +
  saleTax +
  inputs.titlesFees +
  inputs.otherFees +
  totalInterest

  return {
    loanAmount: round2(loanAmount),
    monthlyPayment: round2(monthlyPayment),
    totalPayments: round2(totalPayments),
    totalInterest: round2(totalInterest),
    saleTax: round2(saleTax),
    totalCost: round2(totalCost)
  }
}
