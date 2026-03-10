import { z } from 'zod'

export const contributionTimingSchema = z.enum(['beginning', 'end'])

export const schema = z.object({
  startingPrincipal: z.number().min(0).default(0),
  annualAddition: z.number().min(0).default(0),
  monthlyAddition: z.number().min(0).default(0),
  contributionTiming: contributionTimingSchema.default('end'),
  annualGrowthRate: z.number().min(0).default(0),
  yearsToGrow: z.number().min(1)
})

export type AnnuityInputs = z.infer<typeof schema>

export interface AnnuityResults {
  totalValue: number
  totalContributions: number
  totalInterest: number
  periodMonths: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const futureValueAnnuity = ({
  payment,
  rate,
  periods,
  timing
}: {
  payment: number
  rate: number
  periods: number
  timing: 'beginning' | 'end'
}): number => {
  if (payment === 0 || periods <= 0) {
    return 0
  }

  if (rate === 0) {
    return payment * periods
  }

  const base = payment * ((Math.pow(1 + rate, periods) - 1) / rate)
  return timing === 'beginning' ? base * (1 + rate) : base
}

export function calculate(inputs: AnnuityInputs): AnnuityResults {
  const annualRate = inputs.annualGrowthRate / 100
  const totalMonths = inputs.yearsToGrow * 12
  const monthlyRate = annualRate / 12

  const futureValuePrincipal = inputs.startingPrincipal * Math.pow(1 + annualRate, inputs.yearsToGrow)
  const futureValueAnnual = futureValueAnnuity({
    payment: inputs.annualAddition,
    rate: annualRate,
    periods: inputs.yearsToGrow,
    timing: inputs.contributionTiming
  })
  const futureValueMonthly = futureValueAnnuity({
    payment: inputs.monthlyAddition,
    rate: monthlyRate,
    periods: totalMonths,
    timing: inputs.contributionTiming
  })

  const totalValue = futureValuePrincipal + futureValueAnnual + futureValueMonthly
  const totalContributions =
    inputs.startingPrincipal + inputs.annualAddition * inputs.yearsToGrow + inputs.monthlyAddition * totalMonths
  const totalInterest = totalValue - totalContributions

  return {
    totalValue: round2(totalValue),
    totalContributions: round2(totalContributions),
    totalInterest: round2(totalInterest),
    periodMonths: totalMonths
  }
}
