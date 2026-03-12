import { z } from 'zod'

export const depreciationMethodSchema = z.enum([
  'straight-line',
  'declining-balance',
  'sum-of-years-digits'
])

export const schema = z
  .object({
    method: depreciationMethodSchema.default('straight-line'),
    assetCost: z.number().positive('Asset cost must be greater than 0.'),
    salvageValue: z.number().min(0, 'Salvage value cannot be negative.'),
    depreciationYears: z.number().positive('Depreciation years must be greater than 0.'),
    depreciationFactor: z.number().positive('Depreciation factor must be greater than 0.').max(10).default(1.5),
    roundToDollars: z.boolean().default(false),
    partialYearDepreciation: z.boolean().default(false)
  })
  .superRefine((inputs, ctx) => {
    if (inputs.salvageValue > inputs.assetCost) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['salvageValue'],
        message: 'Salvage value cannot exceed asset cost.'
      })
    }

    if (!inputs.partialYearDepreciation && !Number.isInteger(inputs.depreciationYears)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['depreciationYears'],
        message: 'Use a whole number of years unless partial year depreciation is enabled.'
      })
    }
  })

export type DepreciationInputs = z.infer<typeof schema>

export interface DepreciationScheduleRow {
  period: number
  periodLabel: string
  periodFraction: number
  beginningBookValue: number
  depreciationExpense: number
  accumulatedDepreciation: number
  endingBookValue: number
}

export interface DepreciationResults {
  method: z.infer<typeof depreciationMethodSchema>
  assetCost: number
  salvageValue: number
  depreciationYears: number
  depreciationFactor: number
  roundToDollars: boolean
  partialYearDepreciation: boolean
  totalDepreciation: number
  firstYearDepreciation: number
  averageAnnualDepreciation: number
  endingBookValue: number
  schedule: DepreciationScheduleRow[]
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const roundForDisplay = (value: number, roundToDollars: boolean): number => {
  if (roundToDollars) {
    return Math.round(value)
  }

  return round2(value)
}

const buildPeriodFractions = (years: number, partialYearDepreciation: boolean): number[] => {
  if (!partialYearDepreciation) {
    return Array.from({ length: Math.max(1, Math.round(years)) }, () => 1)
  }

  const wholeYears = Math.floor(years)
  const fractionalYear = round2(years - wholeYears)
  const periods = Array.from({ length: wholeYears }, () => 1)

  if (fractionalYear > 0) {
    periods.push(fractionalYear)
  }

  if (periods.length === 0) {
    periods.push(round2(years))
  }

  return periods
}

const getStraightLineExpense = (inputs: DepreciationInputs, fraction: number): number => {
  const depreciableBase = inputs.assetCost - inputs.salvageValue
  return (depreciableBase / inputs.depreciationYears) * fraction
}

const getDecliningBalanceExpense = (
  bookValue: number,
  inputs: DepreciationInputs,
  fraction: number
): number => {
  const rate = Math.min(inputs.depreciationFactor / inputs.depreciationYears, 1)
  return bookValue * (1 - Math.pow(1 - rate, fraction))
}

const getSumOfYearsDigitsExpense = (
  inputs: DepreciationInputs,
  periodIndex: number,
  totalPeriods: number,
  fraction: number
): number => {
  const depreciableBase = inputs.assetCost - inputs.salvageValue
  const denominator = (totalPeriods * (totalPeriods + 1)) / 2
  const numerator = totalPeriods - periodIndex
  return depreciableBase * (numerator / denominator) * fraction
}

export function calculate(inputs: DepreciationInputs): DepreciationResults {
  const periods = buildPeriodFractions(inputs.depreciationYears, inputs.partialYearDepreciation)
  const schedule: DepreciationScheduleRow[] = []
  let currentBookValue = inputs.assetCost
  let accumulatedDepreciation = 0

  periods.forEach((fraction, index) => {
    const rawExpense = (() => {
      switch (inputs.method) {
        case 'straight-line':
          return getStraightLineExpense(inputs, fraction)
        case 'declining-balance':
          return getDecliningBalanceExpense(currentBookValue, inputs, fraction)
        case 'sum-of-years-digits':
          return getSumOfYearsDigitsExpense(inputs, index, periods.length, fraction)
      }
    })()

    const maxAllowedExpense = Math.max(0, currentBookValue - inputs.salvageValue)
    const depreciationExpense = Math.min(rawExpense, maxAllowedExpense)
    const beginningBookValue = currentBookValue
    accumulatedDepreciation += depreciationExpense
    currentBookValue = Math.max(inputs.salvageValue, currentBookValue - depreciationExpense)

    schedule.push({
      period: index + 1,
      periodLabel:
        fraction === 1
          ? `Year ${index + 1}`
          : `Year ${index + 1} (${round2(fraction)} yr)`,
      periodFraction: round2(fraction),
      beginningBookValue: roundForDisplay(beginningBookValue, inputs.roundToDollars),
      depreciationExpense: roundForDisplay(depreciationExpense, inputs.roundToDollars),
      accumulatedDepreciation: roundForDisplay(accumulatedDepreciation, inputs.roundToDollars),
      endingBookValue: roundForDisplay(currentBookValue, inputs.roundToDollars)
    })
  })

  const totalDepreciation = inputs.assetCost - currentBookValue
  const firstYearDepreciation = schedule[0]?.depreciationExpense ?? 0
  const averageAnnualDepreciation = totalDepreciation / inputs.depreciationYears

  return {
    method: inputs.method,
    assetCost: roundForDisplay(inputs.assetCost, inputs.roundToDollars),
    salvageValue: roundForDisplay(inputs.salvageValue, inputs.roundToDollars),
    depreciationYears: round2(inputs.depreciationYears),
    depreciationFactor: round2(inputs.depreciationFactor),
    roundToDollars: inputs.roundToDollars,
    partialYearDepreciation: inputs.partialYearDepreciation,
    totalDepreciation: roundForDisplay(totalDepreciation, inputs.roundToDollars),
    firstYearDepreciation: roundForDisplay(firstYearDepreciation, inputs.roundToDollars),
    averageAnnualDepreciation: roundForDisplay(averageAnnualDepreciation, inputs.roundToDollars),
    endingBookValue: roundForDisplay(currentBookValue, inputs.roundToDollars),
    schedule
  }
}
