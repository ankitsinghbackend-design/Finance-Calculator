import { z } from 'zod'

export const schema = z.object({
  loanBalance: z.number().min(0),
  annualRate: z.number().min(0),
  termMonths: z.number().int().min(1)
})

export type StudentLoanInputs = z.infer<typeof schema>

export interface StudentLoanResults {
  monthlyPayment: number
  totalPayments: number
  totalInterest: number
  loanBalance: number
  termMonths: number
  annualRate: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

export function calculate(inputs: StudentLoanInputs): StudentLoanResults {
  const monthlyRate = inputs.annualRate / 100 / 12
  const principal = inputs.loanBalance
  const totalMonths = inputs.termMonths

  const monthlyPayment =
    monthlyRate === 0
      ? principal / totalMonths
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths))

  const totalPayments = monthlyPayment * totalMonths
  const totalInterest = totalPayments - principal

  return {
    monthlyPayment: round2(monthlyPayment),
    totalPayments: round2(totalPayments),
    totalInterest: round2(totalInterest),
    loanBalance: round2(principal),
    termMonths: totalMonths,
    annualRate: round2(inputs.annualRate)
  }
}