import { z } from 'zod'

export const couponFrequencySchema = z.enum(['annual', 'semi-annual', 'quarterly'])
export const dayCountConventionSchema = z.enum(['30/360', 'Actual/360', 'Actual/365', 'Actual/Actual'])
export const maturityUnitSchema = z.enum(['months', 'years'])

export const schema = z
  .object({
    price: z.number().positive().optional(),
    faceValue: z.number().positive(),
    yield: z.number().min(0).optional(),
    timeToMaturity: z.number().positive(),
    maturityUnit: maturityUnitSchema.default('years'),
    annualCoupon: z.number().min(0).default(0),
    couponFrequency: couponFrequencySchema.default('semi-annual'),
    maturityDate: z.string().optional(),
    settlementDate: z.string().optional(),
    dayCountConvention: dayCountConventionSchema.default('30/360')
  })
  .superRefine((inputs, ctx) => {
    if (typeof inputs.price !== 'number' && typeof inputs.yield !== 'number') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['price'],
        message: 'Enter either a bond price or a yield to maturity.'
      })
    }

    if (inputs.maturityDate && Number.isNaN(new Date(inputs.maturityDate).getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['maturityDate'],
        message: 'Enter a valid maturity date.'
      })
    }

    if (inputs.settlementDate && Number.isNaN(new Date(inputs.settlementDate).getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['settlementDate'],
        message: 'Enter a valid settlement date.'
      })
    }

    if (inputs.maturityDate && inputs.settlementDate) {
      const maturity = new Date(inputs.maturityDate)
      const settlement = new Date(inputs.settlementDate)
      if (maturity <= settlement) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['maturityDate'],
          message: 'Maturity date must be after settlement date.'
        })
      }
    }
  })

export type BondInputs = z.infer<typeof schema>

export interface BondResults {
  totalValue: number
  accruedInterest: number
  ytm: number
  totalInterest: number
  totalCouponPayments: number
  couponPaymentsCount: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const frequencyMap: Record<z.infer<typeof couponFrequencySchema>, number> = {
  annual: 1,
  'semi-annual': 2,
  quarterly: 4
}

function monthsBetween(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
}

function getPeriods(inputs: BondInputs): number {
  const frequency = frequencyMap[inputs.couponFrequency]

  if (inputs.maturityDate && inputs.settlementDate) {
    const settlement = new Date(inputs.settlementDate)
    const maturity = new Date(inputs.maturityDate)
    const years = Math.max(0, monthsBetween(settlement, maturity) / 12)
    return Math.max(1, Math.round(years * frequency))
  }

  const years = inputs.maturityUnit === 'months' ? inputs.timeToMaturity / 12 : inputs.timeToMaturity
  return Math.max(1, Math.round(years * frequency))
}

function getYearFraction(start: Date, end: Date, convention: z.infer<typeof dayCountConventionSchema>): number {
  const millisecondsPerDay = 1000 * 60 * 60 * 24
  const actualDays = Math.max(0, (end.getTime() - start.getTime()) / millisecondsPerDay)

  switch (convention) {
    case '30/360': {
      const startDay = Math.min(start.getDate(), 30)
      const endDay = Math.min(end.getDate(), 30)
      const numerator =
        (end.getFullYear() - start.getFullYear()) * 360 +
        (end.getMonth() - start.getMonth()) * 30 +
        (endDay - startDay)
      return numerator / 360
    }
    case 'Actual/360':
      return actualDays / 360
    case 'Actual/365':
      return actualDays / 365
    case 'Actual/Actual': {
      const yearLength = isLeapYear(start.getFullYear()) ? 366 : 365
      return actualDays / yearLength
    }
  }
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function calculateBondPrice(params: {
  faceValue: number
  annualCoupon: number
  annualYield: number
  periods: number
  frequency: number
}): number {
  const couponPayment = (params.faceValue * params.annualCoupon) / 100 / params.frequency
  const periodRate = params.annualYield / 100 / params.frequency

  if (periodRate === 0) {
    return couponPayment * params.periods + params.faceValue
  }

  let couponPresentValue = 0
  for (let period = 1; period <= params.periods; period += 1) {
    couponPresentValue += couponPayment / Math.pow(1 + periodRate, period)
  }

  const faceValuePresentValue = params.faceValue / Math.pow(1 + periodRate, params.periods)
  return couponPresentValue + faceValuePresentValue
}

function solveYieldFromPrice(params: {
  targetPrice: number
  faceValue: number
  annualCoupon: number
  periods: number
  frequency: number
}): number {
  let low = 0
  let high = 100

  while (
    calculateBondPrice({
      faceValue: params.faceValue,
      annualCoupon: params.annualCoupon,
      annualYield: high,
      periods: params.periods,
      frequency: params.frequency
    }) > params.targetPrice && high < 1000
  ) {
    high *= 2
  }

  for (let index = 0; index < 100; index += 1) {
    const mid = (low + high) / 2
    const price = calculateBondPrice({
      faceValue: params.faceValue,
      annualCoupon: params.annualCoupon,
      annualYield: mid,
      periods: params.periods,
      frequency: params.frequency
    })

    if (price > params.targetPrice) {
      low = mid
    } else {
      high = mid
    }
  }

  return high
}

function calculateAccruedInterest(inputs: BondInputs, couponPayment: number): number {
  if (!inputs.maturityDate || !inputs.settlementDate) {
    return 0
  }

  const settlement = new Date(inputs.settlementDate)
  const maturity = new Date(inputs.maturityDate)
  const frequency = frequencyMap[inputs.couponFrequency]
  const monthsPerPeriod = 12 / frequency
  const previousCouponDate = new Date(maturity)

  while (previousCouponDate > settlement) {
    previousCouponDate.setMonth(previousCouponDate.getMonth() - monthsPerPeriod)
  }

  const nextCouponDate = new Date(previousCouponDate)
  nextCouponDate.setMonth(nextCouponDate.getMonth() + monthsPerPeriod)

  const accruedFraction =
    getYearFraction(previousCouponDate, settlement, inputs.dayCountConvention) /
    getYearFraction(previousCouponDate, nextCouponDate, inputs.dayCountConvention)

  return couponPayment * Math.max(0, Math.min(1, accruedFraction))
}

export function calculate(inputs: BondInputs): BondResults {
  const frequency = frequencyMap[inputs.couponFrequency]
  const periods = getPeriods(inputs)
  const couponPayment = (inputs.faceValue * inputs.annualCoupon) / 100 / frequency
  const totalCouponPayments = couponPayment * periods

  const resolvedYield =
    typeof inputs.yield === 'number'
      ? inputs.yield
      : solveYieldFromPrice({
          targetPrice: inputs.price ?? inputs.faceValue,
          faceValue: inputs.faceValue,
          annualCoupon: inputs.annualCoupon,
          periods,
          frequency
        })

  const totalValue =
    typeof inputs.price === 'number'
      ? inputs.price
      : calculateBondPrice({
          faceValue: inputs.faceValue,
          annualCoupon: inputs.annualCoupon,
          annualYield: resolvedYield,
          periods,
          frequency
        })

  const accruedInterest = calculateAccruedInterest(inputs, couponPayment)
  const totalInterest = totalCouponPayments + inputs.faceValue - totalValue

  return {
    totalValue: round2(totalValue),
    accruedInterest: round2(accruedInterest),
    ytm: round2(resolvedYield),
    totalInterest: round2(totalInterest),
    totalCouponPayments: round2(totalCouponPayments),
    couponPaymentsCount: periods
  }
}
