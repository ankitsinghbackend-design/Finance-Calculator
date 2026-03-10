import { z } from 'zod'

export const repaymentModeSchema = z.enum(['monthly-payment', 'payoff-time'])

const baseSchema = z.object({
  loanBalance: z.number().min(0),
  interestRate: z.number().min(0),
  compoundMonths: z.number().min(1).default(12),
  mode: repaymentModeSchema
})

const monthlyPaymentSchema = baseSchema.extend({
  mode: z.literal('monthly-payment'),
  loanTermMonths: z.number().int().min(1),
  monthlyPayment: z.number().nullable().optional()
})

const payoffTimeSchema = baseSchema
  .extend({
    mode: z.literal('payoff-time'),
    loanTermMonths: z.number().nullable().optional(),
    monthlyPayment: z.number().min(0)
  })
  .superRefine((value, ctx) => {
    const periodicRate = value.interestRate / 100 / value.compoundMonths
    const minimumPayment = value.loanBalance * periodicRate

    if (value.loanBalance > 0 && periodicRate > 0 && value.monthlyPayment <= minimumPayment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['monthlyPayment'],
        message: 'Monthly payment must be greater than accrued interest to pay off the loan.'
      })
    }
  })

const legacySchema = z
  .object({
    loanBalance: z.number().min(0),
    annualRate: z.number().min(0),
    termMonths: z.number().int().min(1)
  })
  .transform((inputs) => ({
    loanBalance: inputs.loanBalance,
    interestRate: inputs.annualRate,
    compoundMonths: 12,
    loanTermMonths: inputs.termMonths,
    monthlyPayment: null,
    mode: 'monthly-payment' as const
  }))

export const schema = z.union([monthlyPaymentSchema, payoffTimeSchema, legacySchema])

export type RepaymentMode = z.infer<typeof repaymentModeSchema>
export type RepaymentInputs = z.infer<typeof schema>

export type RepaymentResults = {
  monthlyPayment: number | null
  payoffMonths: number | null
  payoffYears: number | null
  totalPayments: number | null
  totalInterest: number | null
  loanBalance: number
  interestRate: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const calculateMonthlyPaymentAmount = (principal: number, periodicRate: number, totalPeriods: number): number => {
  if (principal <= 0) {
    return 0
  }

  if (periodicRate === 0) {
    return principal / totalPeriods
  }

  return (principal * periodicRate) / (1 - Math.pow(1 + periodicRate, -totalPeriods))
}

const calculatePayoffPeriods = (principal: number, periodicRate: number, payment: number): number => {
  if (principal <= 0) {
    return 0
  }

  if (periodicRate === 0) {
    return principal / payment
  }

  return -Math.log(1 - (periodicRate * principal) / payment) / Math.log(1 + periodicRate)
}

export function calculate(inputs: RepaymentInputs): RepaymentResults {
  const periodicRate = inputs.interestRate / 100 / inputs.compoundMonths

  if (inputs.mode === 'payoff-time') {
    const rawPayoffMonths = calculatePayoffPeriods(inputs.loanBalance, periodicRate, inputs.monthlyPayment)
    const payoffMonths = Math.max(0, Math.ceil(rawPayoffMonths))
    const payoffYears = payoffMonths / 12
    const totalPayments = inputs.monthlyPayment * payoffMonths
    const totalInterest = totalPayments - inputs.loanBalance

    return {
      monthlyPayment: round2(inputs.monthlyPayment),
      payoffMonths,
      payoffYears: round2(payoffYears),
      totalPayments: round2(totalPayments),
      totalInterest: round2(totalInterest),
      loanBalance: round2(inputs.loanBalance),
      interestRate: round2(inputs.interestRate)
    }
  }

  const totalPeriods = inputs.loanTermMonths
  const monthlyPayment = calculateMonthlyPaymentAmount(inputs.loanBalance, periodicRate, totalPeriods)
  const totalPayments = monthlyPayment * totalPeriods
  const totalInterest = totalPayments - inputs.loanBalance

  return {
    monthlyPayment: round2(monthlyPayment),
    payoffMonths: null,
    payoffYears: null,
    totalPayments: round2(totalPayments),
    totalInterest: round2(totalInterest),
    loanBalance: round2(inputs.loanBalance),
    interestRate: round2(inputs.interestRate)
  }
}
