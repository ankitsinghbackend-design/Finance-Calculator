import { z } from 'zod'

const CURRENT_YEAR = 2026
const NATIONAL_AVERAGE_BENEFIT = 1900
const MAX_START_AGE = 70
const MIN_START_AGE = 62

export const schema = z
  .object({
    birthYear: z.number().int().min(1900, 'Birth year must be 1900 or later.').max(CURRENT_YEAR, 'Birth year cannot be in the future.'),
    lifeExpectancy: z.number().min(MIN_START_AGE + 1, 'Life expectancy must be at least 63.'),
    investmentReturn: z.number().min(0, 'Investment return cannot be negative.'),
    cola: z.number().min(0, 'COLA cannot be negative.'),
    monthlyBenefitFRA: z.number().min(0, 'Monthly benefit cannot be negative.').optional(),
    startAge: z.number().min(MIN_START_AGE, 'Start age must be at least 62.').max(MAX_START_AGE, 'Start age cannot exceed 70.').optional()
  })
  .superRefine((value, ctx) => {
    const currentAge = CURRENT_YEAR - value.birthYear
    const fraMonths = getFraMonths(value.birthYear)
    const defaultStartAge = fraMonths / 12
    const startAge = value.startAge ?? defaultStartAge

    if (value.lifeExpectancy <= currentAge) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Life expectancy must be greater than your current age.',
        path: ['lifeExpectancy']
      })
    }

    if (value.lifeExpectancy <= startAge) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Life expectancy must be greater than benefit start age.',
        path: ['lifeExpectancy']
      })
    }
  })

export type SocialSecurityInputs = z.infer<typeof schema>

export interface SocialSecurityResults {
  monthlyPayment: number
  totalMonths: number
  totalLifetimePayments: number
  totalInterest: number
  fraAge: number
  usedEstimatedBenefit: boolean
  effectiveStartAge: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100
const round3 = (value: number): number => Math.round((value + Number.EPSILON) * 1000) / 1000

export function getFraMonths(birthYear: number): number {
  if (birthYear <= 1954) {
    return 66 * 12
  }

  if (birthYear >= 1960) {
    return 67 * 12
  }

  return 66 * 12 + (birthYear - 1954) * 2
}

export function adjustMonthlyBenefitForClaimAge(monthlyBenefitFra: number, fraMonths: number, startAgeYears: number): number {
  const startMonths = Math.round(startAgeYears * 12)

  if (startMonths === fraMonths) {
    return monthlyBenefitFra
  }

  if (startMonths < fraMonths) {
    const monthsEarly = fraMonths - startMonths
    const first36 = Math.min(monthsEarly, 36)
    const additional = Math.max(0, monthsEarly - 36)
    const reduction = first36 * (5 / 9 / 100) + additional * (5 / 12 / 100)
    return monthlyBenefitFra * Math.max(0, 1 - reduction)
  }

  const delayMonths = Math.min(startMonths, MAX_START_AGE * 12) - fraMonths
  const delayedIncrease = delayMonths * (2 / 3 / 100)
  return monthlyBenefitFra * (1 + delayedIncrease)
}

export function calculate(inputs: SocialSecurityInputs): SocialSecurityResults {
  const fraMonths = getFraMonths(inputs.birthYear)
  const fraAge = fraMonths / 12
  const effectiveStartAge = inputs.startAge ?? fraAge
  const benefitAtFra = inputs.monthlyBenefitFRA && inputs.monthlyBenefitFRA > 0 ? inputs.monthlyBenefitFRA : NATIONAL_AVERAGE_BENEFIT
  const usedEstimatedBenefit = !(inputs.monthlyBenefitFRA && inputs.monthlyBenefitFRA > 0)
  const startingMonthlyBenefit = adjustMonthlyBenefitForClaimAge(benefitAtFra, fraMonths, effectiveStartAge)
  const totalMonths = Math.max(0, Math.round((inputs.lifeExpectancy - effectiveStartAge) * 12))
  const colaMonthlyFactor = Math.pow(1 + inputs.cola / 100, 1 / 12)
  const investmentMonthlyRate = inputs.investmentReturn / 100 / 12

  let totalLifetimePayments = 0
  let investmentBalance = 0
  let currentMonthlyBenefit = startingMonthlyBenefit

  for (let month = 0; month < totalMonths; month += 1) {
    totalLifetimePayments += currentMonthlyBenefit
    investmentBalance = investmentBalance * (1 + investmentMonthlyRate) + currentMonthlyBenefit
    currentMonthlyBenefit *= colaMonthlyFactor
  }

  return {
    monthlyPayment: round2(startingMonthlyBenefit),
    totalMonths,
    totalLifetimePayments: round2(totalLifetimePayments),
    totalInterest: round2(investmentBalance - totalLifetimePayments),
    fraAge: round3(fraAge),
    usedEstimatedBenefit,
    effectiveStartAge: round3(effectiveStartAge)
  }
}
