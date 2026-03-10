import { z } from 'zod'

export const investmentModeSchema = z.enum([
  'end-amount',
  'additional-contribution',
  'return-rate',
  'starting-amount',
  'investment-length'
])

export const frequencySchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(4),
  z.literal(12),
  z.literal(365)
])

export const contributeTimingSchema = z.enum(['beginning', 'end'])

const baseSchema = z.object({
  mode: investmentModeSchema,
  startingAmount: z.number().min(0).default(0),
  targetEndAmount: z.number().min(0).default(0),
  returnRate: z.number().min(0).default(0),
  investmentYears: z.number().min(0).default(0),
  compoundFrequency: frequencySchema.default(12),
  additionalContribution: z.number().min(0).default(0),
  contributionFrequency: frequencySchema.default(12),
  contributeTiming: contributeTimingSchema.default('end')
})

const endAmountSchema = baseSchema.extend({
  mode: z.literal('end-amount'),
  investmentYears: z.number().min(1)
})

const additionalContributionSchema = baseSchema.extend({
  mode: z.literal('additional-contribution'),
  investmentYears: z.number().min(1),
  targetEndAmount: z.number().min(0)
})

const returnRateSchema = baseSchema.extend({
  mode: z.literal('return-rate'),
  investmentYears: z.number().min(1),
  targetEndAmount: z.number().min(0)
})

const startingAmountSchema = baseSchema.extend({
  mode: z.literal('starting-amount'),
  investmentYears: z.number().min(1),
  targetEndAmount: z.number().min(0)
})

const investmentLengthSchema = baseSchema.extend({
  mode: z.literal('investment-length'),
  targetEndAmount: z.number().min(0),
  returnRate: z.number().min(0)
})

export const schema = z.union([
  endAmountSchema,
  additionalContributionSchema,
  returnRateSchema,
  startingAmountSchema,
  investmentLengthSchema
])

export type InvestmentMode = z.infer<typeof investmentModeSchema>
export type InvestmentInputs = z.infer<typeof schema>

export type InvestmentResults = {
  futureValue: number
  startingAmount: number
  additionalContribution: number
  returnRate: number
  investmentYears: number
  totalContributions: number
  totalInterestEarned: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const futureValueFromInputs = (params: {
  startingAmount: number
  annualRate: number
  years: number
  compoundFrequency: number
  additionalContribution: number
  contributionFrequency: number
  contributeTiming: 'beginning' | 'end'
}): number => {
  const {
    startingAmount,
    annualRate,
    years,
    compoundFrequency,
    additionalContribution,
    contributionFrequency,
    contributeTiming
  } = params

  if (years <= 0) {
    return startingAmount
  }

  const rate = annualRate / 100
  const compoundGrowth = Math.pow(1 + rate / compoundFrequency, compoundFrequency * years)
  const principalGrowth = startingAmount * compoundGrowth

  if (additionalContribution <= 0) {
    return principalGrowth
  }

  if (rate === 0) {
    return principalGrowth + additionalContribution * contributionFrequency * years
  }

  const contributionPeriods = contributionFrequency * years
  const contributionRate = Math.pow(1 + rate / compoundFrequency, compoundFrequency / contributionFrequency) - 1
  const annuityFactor = contributionRate === 0
    ? contributionPeriods
    : (Math.pow(1 + contributionRate, contributionPeriods) - 1) / contributionRate
  const timingMultiplier = contributeTiming === 'beginning' ? 1 + contributionRate : 1

  return principalGrowth + additionalContribution * annuityFactor * timingMultiplier
}

const totalContributedAmount = (startingAmount: number, additionalContribution: number, contributionFrequency: number, years: number) =>
  startingAmount + additionalContribution * contributionFrequency * years

const maxYearsSearch = 100

export function calculate(inputs: InvestmentInputs): InvestmentResults {
  if (inputs.mode === 'end-amount') {
    const futureValue = futureValueFromInputs({
      startingAmount: inputs.startingAmount,
      annualRate: inputs.returnRate,
      years: inputs.investmentYears,
      compoundFrequency: inputs.compoundFrequency,
      additionalContribution: inputs.additionalContribution,
      contributionFrequency: inputs.contributionFrequency,
      contributeTiming: inputs.contributeTiming
    })
    const totalContributions = totalContributedAmount(
      inputs.startingAmount,
      inputs.additionalContribution,
      inputs.contributionFrequency,
      inputs.investmentYears
    )

    return {
      futureValue: round2(futureValue),
      startingAmount: round2(inputs.startingAmount),
      additionalContribution: round2(inputs.additionalContribution),
      returnRate: round2(inputs.returnRate),
      investmentYears: round2(inputs.investmentYears),
      totalContributions: round2(totalContributions),
      totalInterestEarned: round2(futureValue - totalContributions)
    }
  }

  if (inputs.mode === 'additional-contribution') {
    const rate = inputs.returnRate / 100
    const compoundGrowth = Math.pow(1 + rate / inputs.compoundFrequency, inputs.compoundFrequency * inputs.investmentYears)
    const contributionRate = rate === 0
      ? 0
      : Math.pow(1 + rate / inputs.compoundFrequency, inputs.compoundFrequency / inputs.contributionFrequency) - 1
    const periods = inputs.contributionFrequency * inputs.investmentYears
    const annuityFactor = contributionRate === 0
      ? periods
      : (Math.pow(1 + contributionRate, periods) - 1) / contributionRate
    const timingMultiplier = inputs.contributeTiming === 'beginning' ? 1 + contributionRate : 1
    const baseFutureValue = inputs.startingAmount * compoundGrowth
    const additionalContribution = annuityFactor === 0
      ? 0
      : Math.max(0, (inputs.targetEndAmount - baseFutureValue) / (annuityFactor * timingMultiplier))
    const futureValue = futureValueFromInputs({
      startingAmount: inputs.startingAmount,
      annualRate: inputs.returnRate,
      years: inputs.investmentYears,
      compoundFrequency: inputs.compoundFrequency,
      additionalContribution,
      contributionFrequency: inputs.contributionFrequency,
      contributeTiming: inputs.contributeTiming
    })
    const totalContributions = totalContributedAmount(
      inputs.startingAmount,
      additionalContribution,
      inputs.contributionFrequency,
      inputs.investmentYears
    )

    return {
      futureValue: round2(futureValue),
      startingAmount: round2(inputs.startingAmount),
      additionalContribution: round2(additionalContribution),
      returnRate: round2(inputs.returnRate),
      investmentYears: round2(inputs.investmentYears),
      totalContributions: round2(totalContributions),
      totalInterestEarned: round2(futureValue - totalContributions)
    }
  }

  if (inputs.mode === 'return-rate') {
    let low = 0
    let high = 100

    while (
      futureValueFromInputs({
        startingAmount: inputs.startingAmount,
        annualRate: high,
        years: inputs.investmentYears,
        compoundFrequency: inputs.compoundFrequency,
        additionalContribution: inputs.additionalContribution,
        contributionFrequency: inputs.contributionFrequency,
        contributeTiming: inputs.contributeTiming
      }) < inputs.targetEndAmount && high < 1000
    ) {
      high *= 2
    }

    for (let index = 0; index < 80; index += 1) {
      const mid = (low + high) / 2
      const futureValue = futureValueFromInputs({
        startingAmount: inputs.startingAmount,
        annualRate: mid,
        years: inputs.investmentYears,
        compoundFrequency: inputs.compoundFrequency,
        additionalContribution: inputs.additionalContribution,
        contributionFrequency: inputs.contributionFrequency,
        contributeTiming: inputs.contributeTiming
      })

      if (futureValue >= inputs.targetEndAmount) {
        high = mid
      } else {
        low = mid
      }
    }

    const returnRate = high
    const futureValue = futureValueFromInputs({
      startingAmount: inputs.startingAmount,
      annualRate: returnRate,
      years: inputs.investmentYears,
      compoundFrequency: inputs.compoundFrequency,
      additionalContribution: inputs.additionalContribution,
      contributionFrequency: inputs.contributionFrequency,
      contributeTiming: inputs.contributeTiming
    })
    const totalContributions = totalContributedAmount(
      inputs.startingAmount,
      inputs.additionalContribution,
      inputs.contributionFrequency,
      inputs.investmentYears
    )

    return {
      futureValue: round2(futureValue),
      startingAmount: round2(inputs.startingAmount),
      additionalContribution: round2(inputs.additionalContribution),
      returnRate: round2(returnRate),
      investmentYears: round2(inputs.investmentYears),
      totalContributions: round2(totalContributions),
      totalInterestEarned: round2(futureValue - totalContributions)
    }
  }

  if (inputs.mode === 'starting-amount') {
    const rate = inputs.returnRate / 100
    const growthFactor = Math.pow(1 + rate / inputs.compoundFrequency, inputs.compoundFrequency * inputs.investmentYears)
    const contributionFutureValue = futureValueFromInputs({
      startingAmount: 0,
      annualRate: inputs.returnRate,
      years: inputs.investmentYears,
      compoundFrequency: inputs.compoundFrequency,
      additionalContribution: inputs.additionalContribution,
      contributionFrequency: inputs.contributionFrequency,
      contributeTiming: inputs.contributeTiming
    })
    const startingAmount = growthFactor === 0 ? 0 : Math.max(0, (inputs.targetEndAmount - contributionFutureValue) / growthFactor)
    const futureValue = futureValueFromInputs({
      startingAmount,
      annualRate: inputs.returnRate,
      years: inputs.investmentYears,
      compoundFrequency: inputs.compoundFrequency,
      additionalContribution: inputs.additionalContribution,
      contributionFrequency: inputs.contributionFrequency,
      contributeTiming: inputs.contributeTiming
    })
    const totalContributions = totalContributedAmount(
      startingAmount,
      inputs.additionalContribution,
      inputs.contributionFrequency,
      inputs.investmentYears
    )

    return {
      futureValue: round2(futureValue),
      startingAmount: round2(startingAmount),
      additionalContribution: round2(inputs.additionalContribution),
      returnRate: round2(inputs.returnRate),
      investmentYears: round2(inputs.investmentYears),
      totalContributions: round2(totalContributions),
      totalInterestEarned: round2(futureValue - totalContributions)
    }
  }

  let lowYears = 0
  let highYears = maxYearsSearch

  while (
    futureValueFromInputs({
      startingAmount: inputs.startingAmount,
      annualRate: inputs.returnRate,
      years: highYears,
      compoundFrequency: inputs.compoundFrequency,
      additionalContribution: inputs.additionalContribution,
      contributionFrequency: inputs.contributionFrequency,
      contributeTiming: inputs.contributeTiming
    }) < inputs.targetEndAmount && highYears < 500
  ) {
    highYears *= 2
  }

  for (let index = 0; index < 80; index += 1) {
    const mid = (lowYears + highYears) / 2
    const futureValue = futureValueFromInputs({
      startingAmount: inputs.startingAmount,
      annualRate: inputs.returnRate,
      years: mid,
      compoundFrequency: inputs.compoundFrequency,
      additionalContribution: inputs.additionalContribution,
      contributionFrequency: inputs.contributionFrequency,
      contributeTiming: inputs.contributeTiming
    })

    if (futureValue >= inputs.targetEndAmount) {
      highYears = mid
    } else {
      lowYears = mid
    }
  }

  const investmentYears = highYears
  const futureValue = futureValueFromInputs({
    startingAmount: inputs.startingAmount,
    annualRate: inputs.returnRate,
    years: investmentYears,
    compoundFrequency: inputs.compoundFrequency,
    additionalContribution: inputs.additionalContribution,
    contributionFrequency: inputs.contributionFrequency,
    contributeTiming: inputs.contributeTiming
  })
  const totalContributions = totalContributedAmount(
    inputs.startingAmount,
    inputs.additionalContribution,
    inputs.contributionFrequency,
    investmentYears
  )

  return {
    futureValue: round2(futureValue),
    startingAmount: round2(inputs.startingAmount),
    additionalContribution: round2(inputs.additionalContribution),
    returnRate: round2(inputs.returnRate),
    investmentYears: round2(investmentYears),
    totalContributions: round2(totalContributions),
    totalInterestEarned: round2(futureValue - totalContributions)
  }
}
