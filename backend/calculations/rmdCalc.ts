import { z } from 'zod'

const uniformLifetimeTable: Record<number, number> = {
  73: 26.5,
  74: 25.5,
  75: 24.6,
  76: 23.7,
  77: 22.9,
  78: 22.0,
  79: 21.1,
  80: 20.2,
  81: 19.4,
  82: 18.5,
  83: 17.7,
  84: 16.8,
  85: 16.0,
  86: 15.2,
  87: 14.4,
  88: 13.7,
  89: 12.9,
  90: 12.2,
  91: 11.5,
  92: 10.8,
  93: 10.1,
  94: 9.5,
  95: 8.9,
  96: 8.4,
  97: 7.8,
  98: 7.3,
  99: 6.8,
  100: 6.4,
  101: 6.0,
  102: 5.6,
  103: 5.2,
  104: 4.9,
  105: 4.6,
  106: 4.3,
  107: 4.1,
  108: 3.9,
  109: 3.7,
  110: 3.5,
  111: 3.4,
  112: 3.3,
  113: 3.1,
  114: 3.0,
  115: 2.9,
  116: 2.8,
  117: 2.7,
  118: 2.5,
  119: 2.3,
  120: 2.0
}

const spouseDateSchema = z
  .string()
  .optional()
  .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), 'Enter a valid spouse date of birth.')

export const schema = z
  .object({
    yearOfBirth: z.number().int().min(1900),
    yearOfRmd: z.number().int().min(2023),
    accountBalance: z.number().positive(),
    isSpousePrimaryBeneficiary: z.boolean().default(false),
    spouseDateOfBirth: spouseDateSchema,
    estimatedRateOfReturn: z.number().min(0).max(100).optional()
  })
  .superRefine((inputs, ctx) => {
    const age = inputs.yearOfRmd - inputs.yearOfBirth

    if (age < 73) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['yearOfRmd'],
        message: 'RMD calculations apply starting at age 73.'
      })
    }

    if (!uniformLifetimeTable[age]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['yearOfRmd'],
        message: 'No IRS Uniform Lifetime Table factor is available for this age.'
      })
    }

    if (inputs.isSpousePrimaryBeneficiary && !inputs.spouseDateOfBirth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['spouseDateOfBirth'],
        message: 'Spouse date of birth is required when spouse is the primary beneficiary.'
      })
    }
  })

export type RmdInputs = z.infer<typeof schema>

export interface RmdResults {
  rmdAmount: number
  distributionFactor: number
  ageAtRmd: number
  projectedRemainingBalance: number
  startingBalance: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

function getDistributionFactor(age: number): number {
  return uniformLifetimeTable[age]
}

export function calculate(inputs: RmdInputs): RmdResults {
  const ageAtRmd = inputs.yearOfRmd - inputs.yearOfBirth
  const distributionFactor = getDistributionFactor(ageAtRmd)
  const rmdAmount = inputs.accountBalance / distributionFactor
  const remainingBalance = inputs.accountBalance - rmdAmount
  const projectedRemainingBalance =
    typeof inputs.estimatedRateOfReturn === 'number'
      ? remainingBalance * (1 + inputs.estimatedRateOfReturn / 100)
      : remainingBalance

  return {
    rmdAmount: round2(rmdAmount),
    distributionFactor: round2(distributionFactor),
    ageAtRmd,
    projectedRemainingBalance: round2(projectedRemainingBalance),
    startingBalance: round2(inputs.accountBalance)
  }
}
