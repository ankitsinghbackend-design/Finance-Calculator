import { z } from 'zod'

export const schema = z.object({
  homePrice: z.number().nonnegative(),
  downPaymentPercent: z.number().min(0),
  loanTermYears: z.number().positive(),
  interestRate: z.number().min(0),
  annualTaxPercent: z.number().min(0).default(0),
  homeInsurance: z.number().min(0).default(0),
  pmi: z.number().min(0).default(0),
  hoa: z.number().min(0).default(0),
  otherCosts: z.number().min(0).default(0)
})

export type MortgageInputs = z.infer<typeof schema>

export interface MortgageResults {
  monthlyMortgagePayment: number
  monthlyPropertyTax: number
  monthlyInsurance: number
  totalMonthlyPayment: number
  totalInterest: number
  totalCost: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

export function calculate(inputs: MortgageInputs): MortgageResults {
  const downPayment = inputs.homePrice * (inputs.downPaymentPercent / 100)
  const loanAmount = inputs.homePrice - downPayment
  const monthlyRate = inputs.interestRate / 100 / 12
  const totalMonths = inputs.loanTermYears * 12

  const monthlyMortgagePayment =
    monthlyRate === 0
      ? loanAmount / totalMonths
      : (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths))

  const monthlyPropertyTax = (inputs.homePrice * (inputs.annualTaxPercent / 100)) / 12
  const monthlyInsurance = inputs.homeInsurance / 12

  const totalMonthlyPayment =
    monthlyMortgagePayment + monthlyPropertyTax + monthlyInsurance + inputs.pmi + inputs.hoa + inputs.otherCosts

  const totalPayments = monthlyMortgagePayment * totalMonths
  const totalInterest = totalPayments - loanAmount

  const totalCost =
    inputs.homePrice +
    totalInterest +
    monthlyPropertyTax * totalMonths +
    monthlyInsurance * totalMonths +
    (inputs.pmi + inputs.hoa + inputs.otherCosts) * totalMonths

  return {
    monthlyMortgagePayment: round2(monthlyMortgagePayment),
    monthlyPropertyTax: round2(monthlyPropertyTax),
    monthlyInsurance: round2(monthlyInsurance),
    totalMonthlyPayment: round2(totalMonthlyPayment),
    totalInterest: round2(totalInterest),
    totalCost: round2(totalCost)
  }
}
