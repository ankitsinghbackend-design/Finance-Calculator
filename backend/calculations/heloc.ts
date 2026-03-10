import { z } from 'zod'

export const schema = z.object({
  loanAmount: z.number().positive('Loan amount must be greater than 0.').min(5000, 'Loan amount should be at least $5,000.').max(1000000, 'Loan amount should be no more than $1,000,000.'),
  interestRate: z.number().gt(0, 'Interest rate must be greater than 0.').min(0.1, 'Interest rate should be at least 0.1%.').max(25, 'Interest rate should be 25% or less.'),
  drawPeriodMonths: z.number().int().positive('Draw period must be greater than 0.').min(24, 'Draw period should be at least 24 months.').max(120, 'Draw period should be 120 months or less.'),
  repaymentPeriodYears: z.number().positive('Repayment period must be greater than 0.').min(5, 'Repayment period should be at least 5 years.').max(30, 'Repayment period should be 30 years or less.'),
  includeClosingCosts: z.boolean().default(false)
})

export type HelocInputs = z.infer<typeof schema>

export interface HelocResults {
  monthlyPayment: number
  repaymentMonths: number
  totalLoanPayments: number
  totalInterest: number
  effectiveLoanAmount: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

export function calculate(inputs: HelocInputs): HelocResults {
  const closingCosts = inputs.includeClosingCosts ? inputs.loanAmount * 0.03 : 0
  const effectiveLoanAmount = inputs.loanAmount + closingCosts
  const monthlyRate = inputs.interestRate / 100 / 12
  const repaymentMonths = Math.max(1, Math.round(inputs.repaymentPeriodYears * 12))

  const monthlyPayment =
    monthlyRate === 0
      ? effectiveLoanAmount / repaymentMonths
      : (effectiveLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) /
        (Math.pow(1 + monthlyRate, repaymentMonths) - 1)

  const totalLoanPayments = monthlyPayment * repaymentMonths
  const totalInterest = totalLoanPayments - effectiveLoanAmount

  return {
    monthlyPayment: round2(monthlyPayment),
    repaymentMonths,
    totalLoanPayments: round2(totalLoanPayments),
    totalInterest: round2(totalInterest),
    effectiveLoanAmount: round2(effectiveLoanAmount)
  }
}
