import { z } from 'zod'

export const contributionTimingSchema = z.enum(['beginning', 'end'])

export const schema = z
  .object({
    currentBalance: z.number().min(0).default(0),
    annualContribution: z.number().min(0).default(0),
    maximizeContributions: z.number().int().min(0).default(0),
    contributionTiming: contributionTimingSchema.default('end'),
    expectedRateOfReturn: z.number().min(0).default(0),
    currentAge: z.number().int().min(0),
    retirementAge: z.number().int().min(1),
    marginalTaxRate: z.number().min(0).max(100).default(0)
  })
  .superRefine((inputs, ctx) => {
    if (inputs.retirementAge <= inputs.currentAge) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['retirementAge'],
        message: 'Retirement age must be greater than current age.'
      })
    }
  })

export type RothIraInputs = z.infer<typeof schema>

export interface RothIraResults {
  rothBalance: number
  taxableBalance: number
  taxSavings: number
  yearsToRetirement: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const rothLimitsByYear: Record<number, number> = {
  2022: 6000,
  2023: 6500,
  2024: 7000,
  2025: 7000,
  2026: 7000
}

const catchUpContribution = 1000

function getRothContributionLimit(year: number, age: number): number {
  const normalizedYear = Math.min(2026, Math.max(2022, year))
  const baseLimit = rothLimitsByYear[normalizedYear] ?? rothLimitsByYear[2026]
  return age >= 50 ? baseLimit + catchUpContribution : baseLimit
}

function futureValueWithAnnualContribution({
  principal,
  annualContribution,
  annualRate,
  years,
  timing
}: {
  principal: number
  annualContribution: number
  annualRate: number
  years: number
  timing: 'beginning' | 'end'
}): number {
  if (years <= 0) {
    return principal
  }

  const principalValue = principal * Math.pow(1 + annualRate, years)

  if (annualContribution === 0) {
    return principalValue
  }

  if (annualRate === 0) {
    return principalValue + annualContribution * years
  }

  const annuityFactor = (Math.pow(1 + annualRate, years) - 1) / annualRate
  const timingMultiplier = timing === 'beginning' ? 1 + annualRate : 1

  return principalValue + annualContribution * annuityFactor * timingMultiplier
}

export function calculate(inputs: RothIraInputs): RothIraResults {
  const years = inputs.retirementAge - inputs.currentAge
  const annualRate = inputs.expectedRateOfReturn / 100
  const taxableRate = annualRate * (1 - inputs.marginalTaxRate / 100)
  const effectiveContribution =
    inputs.maximizeContributions > 0
      ? getRothContributionLimit(inputs.maximizeContributions, inputs.currentAge)
      : inputs.annualContribution

  const rothBalance = futureValueWithAnnualContribution({
    principal: inputs.currentBalance,
    annualContribution: effectiveContribution,
    annualRate,
    years,
    timing: inputs.contributionTiming
  })

  const taxableBalance = futureValueWithAnnualContribution({
    principal: inputs.currentBalance,
    annualContribution: effectiveContribution,
    annualRate: taxableRate,
    years,
    timing: inputs.contributionTiming
  })

  return {
    rothBalance: round2(rothBalance),
    taxableBalance: round2(taxableBalance),
    taxSavings: round2(rothBalance - taxableBalance),
    yearsToRetirement: years
  }
}
