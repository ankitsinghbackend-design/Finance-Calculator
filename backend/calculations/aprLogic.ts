import { z } from 'zod'

export const compoundingPeriodSchema = z.enum([
  'Monthly',
  'Biweekly',
  'Weekly',
  'Quarterly',
  'Semi-Annual',
  'Annual'
])

export type CompoundingPeriod = z.infer<typeof compoundingPeriodSchema>

export const aprResultSchema = z.object({
  realApr: z.number(),
  amountFinanced: z.number(),
  upfrontFees: z.number(),
  monthlyPayment: z.number(),
  totalPayments: z.number(),
  totalInterest: z.number(),
  totalAllPaymentsAndFees: z.number(),
  chartData: z.object({
    principal: z.number(),
    interest: z.number(),
    fees: z.number()
  })
})

export type AprResults = z.infer<typeof aprResultSchema>

export const generalAprSchema = z
  .object({
    loanAmount: z.number().positive('Loan amount must be greater than 0.'),
    loanTermYears: z.number().int().min(0, 'Loan term years cannot be negative.'),
    loanTermMonths: z.number().int().min(0, 'Loan term months cannot be negative.').max(11, 'Additional months cannot exceed 11.'),
    nominalRate: z.number().min(0, 'Nominal rate cannot be negative.'),
    compoundingPeriod: compoundingPeriodSchema,
    backPayYear: z.number().min(0, 'Annual recurring back-end payments cannot be negative.'),
    loanedFeesMonthly: z.number().min(0, 'Monthly rolled fees cannot be negative.'),
    upfrontFees: z.number().min(0, 'Upfront fees cannot be negative.')
  })
  .superRefine((value, ctx) => {
    const totalMonths = value.loanTermYears * 12 + value.loanTermMonths

    if (totalMonths < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Loan term must be at least 1 month.',
        path: ['loanTermMonths']
      })
    }

    if (value.upfrontFees >= value.loanAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Upfront fees must be less than the loan amount.',
        path: ['upfrontFees']
      })
    }
  })

export const mortgageAprSchema = z
  .object({
    houseValue: z.number().positive('House value must be greater than 0.'),
    downPaymentPercent: z.number().min(0, 'Down payment cannot be negative.').max(99.99, 'Down payment must leave some amount to finance.'),
    loanTermMonths: z.number().int().min(1, 'Loan term must be at least 1 month.'),
    nominalRate: z.number().min(0, 'Nominal rate cannot be negative.'),
    loanFeeYear: z.number().min(0, 'Annual loan fees cannot be negative.'),
    loansFeesMonthly: z.number().min(0, 'Monthly loan fees cannot be negative.'),
    points: z.number().min(0, 'Points cannot be negative.'),
    pmiInsurance: z.number().min(0, 'PMI insurance cannot be negative.')
  })
  .superRefine((value, ctx) => {
    const loanAmount = value.houseValue * (1 - value.downPaymentPercent / 100)
    const pointsAmount = loanAmount * (value.points / 100)

    if (loanAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Down payment leaves no financed balance.',
        path: ['downPaymentPercent']
      })
    }

    if (pointsAmount >= loanAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Points must be less than the financed amount.',
        path: ['points']
      })
    }
  })

export type GeneralAprInputs = z.infer<typeof generalAprSchema>
export type MortgageAprInputs = z.infer<typeof mortgageAprSchema>

const COMPOUNDING_PERIODS_PER_YEAR: Record<CompoundingPeriod, number> = {
  Monthly: 12,
  Biweekly: 26,
  Weekly: 52,
  Quarterly: 4,
  'Semi-Annual': 2,
  Annual: 1
}

const SOLVER_TOLERANCE = 0.00001
const MAX_ITERATIONS = 500

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100
const round3 = (value: number): number => Math.round((value + Number.EPSILON) * 1000) / 1000

export function getTotalMonths(years: number, months: number): number {
  return years * 12 + months
}

export function getLoanMonthlyRate(nominalRatePercent: number, compoundingPeriod: CompoundingPeriod): number {
  if (nominalRatePercent === 0) {
    return 0
  }

  const nominalRate = nominalRatePercent / 100
  const periodsPerYear = COMPOUNDING_PERIODS_PER_YEAR[compoundingPeriod]

  return Math.pow(1 + nominalRate / periodsPerYear, periodsPerYear / 12) - 1
}

export function getMonthlyPayment(principal: number, monthlyRate: number, totalMonths: number): number {
  if (totalMonths < 1) {
    throw new Error('Loan term must be at least 1 month.')
  }

  if (monthlyRate === 0) {
    return principal / totalMonths
  }

  return principal * ((monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1))
}

function presentValueOfLevelPayments(payment: number, monthlyRate: number, totalMonths: number): number {
  if (monthlyRate === 0) {
    return payment * totalMonths
  }

  return payment * ((1 - Math.pow(1 + monthlyRate, -totalMonths)) / monthlyRate)
}

export function solveRealAprMonthlyRate(netLoanAmount: number, payment: number, totalMonths: number): number {
  if (netLoanAmount <= 0) {
    throw new Error('Net amount financed must be greater than 0.')
  }

  const zeroRatePv = presentValueOfLevelPayments(payment, 0, totalMonths)

  if (zeroRatePv + SOLVER_TOLERANCE < netLoanAmount) {
    throw new Error('Payment stream is too small for the financed amount.')
  }

  if (Math.abs(zeroRatePv - netLoanAmount) <= SOLVER_TOLERANCE) {
    return 0
  }

  let low = 0
  let high = 1

  while (presentValueOfLevelPayments(payment, high, totalMonths) > netLoanAmount && high < 100) {
    high *= 2
  }

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration += 1) {
    const mid = (low + high) / 2
    const pv = presentValueOfLevelPayments(payment, mid, totalMonths)
    const difference = pv - netLoanAmount

    if (Math.abs(difference) <= SOLVER_TOLERANCE || high - low <= SOLVER_TOLERANCE) {
      return mid
    }

    if (difference > 0) {
      low = mid
    } else {
      high = mid
    }
  }

  return (low + high) / 2
}

function buildAprResults(args: {
  principal: number
  totalMonths: number
  baseMonthlyPayment: number
  recurringFeesMonthly: number
  upfrontFees: number
  netLoanAmount: number
}): AprResults {
  const monthlyPayment = args.baseMonthlyPayment + args.recurringFeesMonthly
  const totalPayments = monthlyPayment * args.totalMonths
  const totalInterest = args.baseMonthlyPayment * args.totalMonths - args.principal
  const feeTotal = args.upfrontFees + args.recurringFeesMonthly * args.totalMonths
  const realAprMonthlyRate = solveRealAprMonthlyRate(args.netLoanAmount, monthlyPayment, args.totalMonths)

  return {
    realApr: round3(realAprMonthlyRate * 12 * 100),
    amountFinanced: round2(args.principal),
    upfrontFees: round2(args.upfrontFees),
    monthlyPayment: round2(monthlyPayment),
    totalPayments: round2(totalPayments),
    totalInterest: round2(totalInterest),
    totalAllPaymentsAndFees: round2(totalPayments + args.upfrontFees),
    chartData: {
      principal: round2(args.principal),
      interest: round2(totalInterest),
      fees: round2(feeTotal)
    }
  }
}

export function calculateGeneralApr(inputs: GeneralAprInputs): AprResults {
  const totalMonths = getTotalMonths(inputs.loanTermYears, inputs.loanTermMonths)
  const principal = inputs.loanAmount
  const monthlyRate = getLoanMonthlyRate(inputs.nominalRate, inputs.compoundingPeriod)
  const baseMonthlyPayment = getMonthlyPayment(principal, monthlyRate, totalMonths)
  const recurringFeesMonthly = inputs.backPayYear / 12 + inputs.loanedFeesMonthly
  const netLoanAmount = principal - inputs.upfrontFees

  return buildAprResults({
    principal,
    totalMonths,
    baseMonthlyPayment,
    recurringFeesMonthly,
    upfrontFees: inputs.upfrontFees,
    netLoanAmount
  })
}

export function calculateMortgageApr(inputs: MortgageAprInputs): AprResults {
  const principal = inputs.houseValue * (1 - inputs.downPaymentPercent / 100)
  const pointsAmount = principal * (inputs.points / 100)
  const monthlyRate = getLoanMonthlyRate(inputs.nominalRate, 'Monthly')
  const baseMonthlyPayment = getMonthlyPayment(principal, monthlyRate, inputs.loanTermMonths)
  const recurringFeesMonthly = inputs.loanFeeYear / 12 + inputs.loansFeesMonthly + inputs.pmiInsurance / 12
  const netLoanAmount = principal - pointsAmount

  return buildAprResults({
    principal,
    totalMonths: inputs.loanTermMonths,
    baseMonthlyPayment,
    recurringFeesMonthly,
    upfrontFees: pointsAmount,
    netLoanAmount
  })
}
