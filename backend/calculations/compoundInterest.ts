import { z } from 'zod'

export const schema = z.object({
  principal: z.number().nonnegative(),
  annualRatePct: z.number().min(0),
  years: z.number().nonnegative(),
  compoundsPerYear: z.number().int().positive().default(12),
  annualContribution: z.number().min(0).default(0)
})

export type CompoundInterestInputs = z.infer<typeof schema>

export interface CompoundInterestResults {
  finalAmount: number
  totalContributions: number
  totalInterestEarned: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

export function calculate(inputs: CompoundInterestInputs): CompoundInterestResults {
  const n = inputs.compoundsPerYear
  const t = inputs.years
  const r = inputs.annualRatePct / 100

  const principalGrowth = inputs.principal * Math.pow(1 + r / n, n * t)

  const periodicContribution = inputs.annualContribution / n
  const periods = Math.round(n * t)
  let contributionsFutureValue = 0

  if (periodicContribution > 0 && periods > 0) {
    if (r === 0) {
      contributionsFutureValue = periodicContribution * periods
    } else {
      const periodicRate = r / n
      contributionsFutureValue =
        periodicContribution *
        ((Math.pow(1 + periodicRate, periods) - 1) / periodicRate)
    }
  }

  const finalAmount = principalGrowth + contributionsFutureValue
  const totalContributions = inputs.principal + inputs.annualContribution * t
  const totalInterestEarned = Math.max(0, finalAmount - totalContributions)

  return {
    finalAmount: round2(finalAmount),
    totalContributions: round2(totalContributions),
    totalInterestEarned: round2(totalInterestEarned)
  }
}
