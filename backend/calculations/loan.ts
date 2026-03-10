import { z } from 'zod'

export const loanModeSchema = z.enum(['fixed-term', 'fixed-payment'])

const baseSchema = z.object({
  loanAmount: z.number().positive('Loan amount must be greater than 0.'),
  interestRate: z.number().min(0, 'Interest rate cannot be negative.'),
  mode: loanModeSchema
})

const fixedTermSchema = baseSchema.extend({
  mode: z.literal('fixed-term'),
  loanTermYears: z.number().min(1, 'Loan term must be at least 1 year.'),
  monthlyPayment: z.number().nullable().optional()
})

const fixedPaymentSchema = baseSchema
  .extend({
    mode: z.literal('fixed-payment'),
    loanTermYears: z.number().nullable().optional(),
    monthlyPayment: z.number().positive('Monthly payment must be greater than 0.')
  })
  .superRefine((value, ctx) => {
    const monthlyRate = value.interestRate / 100 / 12
    const minimumPayment = value.loanAmount * monthlyRate

    if (value.loanAmount > 0 && monthlyRate > 0 && value.monthlyPayment <= minimumPayment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['monthlyPayment'],
        message: 'Monthly payment must be greater than accrued interest to pay off the loan.'
      })
    }
  })

export const schema = z.union([fixedTermSchema, fixedPaymentSchema])

export type LoanMode = z.infer<typeof loanModeSchema>
export type LoanInputs = z.infer<typeof schema>

export type LoanResults = {
  loanAmount: number
  interestRate: number
  loanTermYears: number | null
  monthlyPayment: number
  payoffMonths: number | null
  payoffYears: number | null
  totalPayments: number
  totalInterest: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const calculateMonthlyPaymentAmount = (principal: number, monthlyRate: number, totalMonths: number): number => {
  if (monthlyRate === 0) {
    return principal / totalMonths
  }

  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths))
}

const calculatePayoffMonths = (principal: number, monthlyRate: number, payment: number): number => {
  if (monthlyRate === 0) {
    return principal / payment
  }

  return -Math.log(1 - (monthlyRate * principal) / payment) / Math.log(1 + monthlyRate)
}

export function calculate(inputs: LoanInputs): LoanResults {
  const monthlyRate = inputs.interestRate / 100 / 12

  if (inputs.mode === 'fixed-payment') {
    const rawPayoffMonths = calculatePayoffMonths(inputs.loanAmount, monthlyRate, inputs.monthlyPayment)
    const payoffMonths = Math.max(0, Math.ceil(rawPayoffMonths))
    const payoffYears = payoffMonths / 12
    const totalPayments = inputs.monthlyPayment * payoffMonths
    const totalInterest = totalPayments - inputs.loanAmount

    return {
      loanAmount: round2(inputs.loanAmount),
      interestRate: round2(inputs.interestRate),
      loanTermYears: null,
      monthlyPayment: round2(inputs.monthlyPayment),
      payoffMonths,
      payoffYears: round2(payoffYears),
      totalPayments: round2(totalPayments),
      totalInterest: round2(totalInterest)
    }
  }

  const totalMonths = Math.max(1, Math.round(inputs.loanTermYears * 12))
  const monthlyPayment = calculateMonthlyPaymentAmount(inputs.loanAmount, monthlyRate, totalMonths)
  const totalPayments = monthlyPayment * totalMonths
  const totalInterest = totalPayments - inputs.loanAmount

  return {
    loanAmount: round2(inputs.loanAmount),
    interestRate: round2(inputs.interestRate),
    loanTermYears: round2(inputs.loanTermYears),
    monthlyPayment: round2(monthlyPayment),
    payoffMonths: totalMonths,
    payoffYears: round2(totalMonths / 12),
    totalPayments: round2(totalPayments),
    totalInterest: round2(totalInterest)
  }
}
