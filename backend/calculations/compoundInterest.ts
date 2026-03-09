import { z } from 'zod'

export const compoundPeriodMap = {
  yearly: 1,
  semiannually: 2,
  quarterly: 4,
  monthly: 12,
  weekly: 52,
  daily: 365
} as const

export const schema = z.object({
  principal: z.number().min(0),
  annualRate: z.number().min(0),
  years: z.number().positive(),
  compoundFrequency: z.enum(['yearly', 'semiannually', 'quarterly', 'monthly', 'weekly', 'daily']),
  monthlyContribution: z.number().min(0).default(0)
})

export type CompoundInterestInputs = z.infer<typeof schema>

export interface CompoundInterestResults {
  principal: number
  totalContribution: number
  interestEarned: number
  totalValue: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

export function calculate(inputs: CompoundInterestInputs): CompoundInterestResults {
  const n = compoundPeriodMap[inputs.compoundFrequency]
  const t = inputs.years
  const r = inputs.annualRate / 100

  // A = P (1 + r/n)^(nt)
  const compoundValue = inputs.principal * Math.pow(1 + r / n, n * t)

  // FV = PMT * ((1 + r/12)^(12t) - 1) / (r/12)
  const monthlyRate = r / 12
  const contributionPeriods = 12 * t

  const contributionFutureValue =
    inputs.monthlyContribution <= 0
      ? 0
      : monthlyRate === 0
        ? inputs.monthlyContribution * contributionPeriods
        : inputs.monthlyContribution *
          ((Math.pow(1 + monthlyRate, contributionPeriods) - 1) / monthlyRate)

  const totalValue = compoundValue + contributionFutureValue
  const totalContribution = inputs.principal + inputs.monthlyContribution * contributionPeriods
  const interestEarned = Math.max(0, totalValue - totalContribution)

  return {
    principal: round2(inputs.principal),
    totalContribution: round2(totalContribution),
    interestEarned: round2(interestEarned),
    totalValue: round2(totalValue)
  }
}
