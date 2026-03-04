import { z } from 'zod'

export const schema = z.object({
  principal: z.number().positive(),
  annualRatePct: z.number().min(0),
  termYears: z.number().positive()
})

export type MortgageInputs = z.infer<typeof schema>

export interface MortgageResults {
  monthlyPayment: number
  totalPayments: number
  totalInterest: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

export function calculate(inputs: MortgageInputs): MortgageResults {
  const n = Math.round(inputs.termYears * 12)
  const monthlyRate = inputs.annualRatePct / 100 / 12

  const monthlyPayment =
    monthlyRate === 0
      ? inputs.principal / n
      : (inputs.principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n))

  const totalPayments = monthlyPayment * n
  const totalInterest = Math.max(0, totalPayments - inputs.principal)

  return {
    monthlyPayment: round2(monthlyPayment),
    totalPayments: round2(totalPayments),
    totalInterest: round2(totalInterest)
  }
}
