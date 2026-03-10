import { z } from 'zod'

export const schema = z.object({
  retirementAge: z.number().min(40).max(80),
  lifeExpectancy: z.number().gt(40),
  lumpSum: z.number().min(0),
  investmentReturn: z.number().min(0),
  monthlyPension: z.number().min(0),
  cola: z.number().min(0)
}).refine((value) => value.lifeExpectancy > value.retirementAge, {
  message: 'Life expectancy must be greater than retirement age',
  path: ['lifeExpectancy']
})

export type PensionInputs = z.infer<typeof schema>

export interface PensionResults {
  lumpSumFutureValue: number
  totalPension: number
  breakEvenAge: number
  betterOption: 'Lump Sum' | 'Monthly Pension' | 'Equal Value'
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

export function calculate(inputs: PensionInputs): PensionResults {
  const yearsRetired = inputs.lifeExpectancy - inputs.retirementAge
  const investmentRate = inputs.investmentReturn / 100
  const colaRate = inputs.cola / 100

  const lumpSumFutureValue = inputs.lumpSum * Math.pow(1 + investmentRate, yearsRetired)

  let totalPension = 0
  for (let year = 0; year < yearsRetired; year += 1) {
    const annualPension = inputs.monthlyPension * 12 * Math.pow(1 + colaRate, year)
    totalPension += annualPension
  }

  const breakEvenMonths = inputs.monthlyPension === 0 ? Number.POSITIVE_INFINITY : inputs.lumpSum / inputs.monthlyPension
  const breakEvenAge =
    Number.isFinite(breakEvenMonths)
      ? inputs.retirementAge + breakEvenMonths / 12
      : Number.POSITIVE_INFINITY

  const difference = lumpSumFutureValue - totalPension
  const betterOption =
    Math.abs(difference) < 0.005
      ? 'Equal Value'
      : difference > 0
        ? 'Lump Sum'
        : 'Monthly Pension'

  return {
    lumpSumFutureValue: round2(lumpSumFutureValue),
    totalPension: round2(totalPension),
    breakEvenAge: Number.isFinite(breakEvenAge) ? round2(breakEvenAge) : Number.POSITIVE_INFINITY,
    betterOption
  }
}