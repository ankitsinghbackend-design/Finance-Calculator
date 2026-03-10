import { z } from 'zod'

export const schema = z
  .object({
    cashBackAmount: z.number().min(0),
    interestRateHigh: z.number().min(0),
    interestRateLow: z.number().min(0),
    autoPrice: z.number().positive(),
    loanTerm: z.number().int().positive(),
    downPayment: z.number().min(0).default(0),
    tradeInValue: z.number().min(0).default(0),
    salesTaxRate: z.number().min(0).default(0),
    fees: z.number().min(0).default(0)
  })
  .superRefine((inputs, ctx) => {
    if (inputs.autoPrice <= inputs.downPayment + inputs.tradeInValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['autoPrice'],
        message: 'Auto price must be greater than the combined down payment and trade-in value.'
      })
    }

    if (inputs.interestRateHigh <= inputs.interestRateLow) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['interestRateHigh'],
        message: 'The cash back interest rate must be higher than the low-interest offer.'
      })
    }
  })

export type CashBackComparisonInputs = z.infer<typeof schema>

export interface OfferScenario {
  loanAmount: number
  salesTax: number
  upfront: number
  monthly: number
  totalPayments: number
  totalInterest: number
  totalCost: number
}

export interface CashBackComparisonResults {
  monthlySavings: number
  recommendedOffer: 'Cash Back' | 'Low Interest'
  loanTerm: number
  cashBackScenario: OfferScenario
  lowInterestScenario: OfferScenario
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

function calculateMonthlyPayment(principal: number, totalMonths: number, annualRate: number): number {
  const safePrincipal = Math.max(0, principal)
  const monthlyRate = annualRate / 100 / 12

  if (safePrincipal === 0) {
    return 0
  }

  if (monthlyRate === 0) {
    return safePrincipal / totalMonths
  }

  return (safePrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
}

function buildScenario({
  loanAmount,
  salesTax,
  upfront,
  interestRate,
  loanTerm,
  downPayment,
  tradeInValue
}: {
  loanAmount: number
  salesTax: number
  upfront: number
  interestRate: number
  loanTerm: number
  downPayment: number
  tradeInValue: number
}): OfferScenario {
  const normalizedLoanAmount = Math.max(0, loanAmount)
  const monthly = calculateMonthlyPayment(normalizedLoanAmount, loanTerm, interestRate)
  const totalPayments = monthly * loanTerm
  const totalInterest = Math.max(0, totalPayments - normalizedLoanAmount)
  const totalCost = totalPayments + downPayment + tradeInValue

  return {
    loanAmount: round2(normalizedLoanAmount),
    salesTax: round2(salesTax),
    upfront: round2(upfront),
    monthly: round2(monthly),
    totalPayments: round2(totalPayments),
    totalInterest: round2(totalInterest),
    totalCost: round2(totalCost)
  }
}

export function calculate(inputs: CashBackComparisonInputs): CashBackComparisonResults {
  const taxableAmount = inputs.autoPrice - inputs.tradeInValue
  const calculatedSalesTax = taxableAmount * (inputs.salesTaxRate / 100)
  const upfrontPayment = inputs.downPayment + inputs.fees

  const cashBackScenario = buildScenario({
    loanAmount: inputs.autoPrice - inputs.tradeInValue - inputs.downPayment - inputs.cashBackAmount + calculatedSalesTax + inputs.fees,
    salesTax: calculatedSalesTax,
    upfront: upfrontPayment,
    interestRate: inputs.interestRateHigh,
    loanTerm: inputs.loanTerm,
    downPayment: inputs.downPayment,
    tradeInValue: inputs.tradeInValue
  })

  const lowInterestScenario = buildScenario({
    loanAmount: inputs.autoPrice - inputs.tradeInValue - inputs.downPayment + calculatedSalesTax + inputs.fees,
    salesTax: calculatedSalesTax,
    upfront: upfrontPayment,
    interestRate: inputs.interestRateLow,
    loanTerm: inputs.loanTerm,
    downPayment: inputs.downPayment,
    tradeInValue: inputs.tradeInValue
  })

  return {
    monthlySavings: round2(Math.abs(cashBackScenario.monthly - lowInterestScenario.monthly)),
    recommendedOffer: cashBackScenario.totalCost < lowInterestScenario.totalCost ? 'Cash Back' : 'Low Interest',
    loanTerm: inputs.loanTerm,
    cashBackScenario,
    lowInterestScenario
  }
}
