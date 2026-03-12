import { z } from 'zod'

export const compoundSchema = z.enum(['monthly', 'quarterly', 'semi-annually', 'annually'])
export const payBackSchema = z.enum(['monthly', 'bi-weekly', 'weekly'])

export const schema = z
  .object({
    loanAmount: z.number().positive('Loan amount must be greater than 0.'),
    interestRate: z.number().min(0, 'Interest rate cannot be negative.'),
    compound: compoundSchema.default('monthly'),
    loanTerm: z.number().positive('Loan term must be greater than 0.'),
    payBack: payBackSchema.default('monthly'),
    originationFee: z.number().min(0, 'Origination fee cannot be negative.'),
    documentationFee: z.number().min(0, 'Documentation fee cannot be negative.'),
    otherFees: z.number().min(0, 'Other fees cannot be negative.')
  })
  .superRefine((inputs, ctx) => {
    const totalFees = resolveOriginationFee(inputs.loanAmount, inputs.originationFee) + inputs.documentationFee + inputs.otherFees

    if (totalFees >= inputs.loanAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['originationFee'],
        message: 'Total fees must be less than the loan amount.'
      })
    }
  })

export type BusinessLoanInputs = z.infer<typeof schema>

export interface BusinessLoanResults {
  loanAmount: number
  interestRate: number
  compound: z.infer<typeof compoundSchema>
  loanTerm: number
  payBack: z.infer<typeof payBackSchema>
  paymentCount: number
  periodicPayment: number
  totalPayments: number
  totalInterest: number
  totalFees: number
  totalCostOfLoan: number
  apr: number
  effectiveApr: number
  netFunding: number
  originationFeeAmount: number
}

const compoundingPerYear: Record<z.infer<typeof compoundSchema>, number> = {
  monthly: 12,
  quarterly: 4,
  'semi-annually': 2,
  annually: 1
}

const paymentsPerYear: Record<z.infer<typeof payBackSchema>, number> = {
  monthly: 12,
  'bi-weekly': 26,
  weekly: 52
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

function resolveOriginationFee(loanAmount: number, originationFee: number): number {
  if (originationFee <= 100) {
    return loanAmount * (originationFee / 100)
  }

  return originationFee
}

function getPeriodicRate(interestRate: number, compound: z.infer<typeof compoundSchema>, payBack: z.infer<typeof payBackSchema>): number {
  if (interestRate === 0) {
    return 0
  }

  const nominalAnnualRate = interestRate / 100
  const compoundFrequency = compoundingPerYear[compound]
  const paymentFrequency = paymentsPerYear[payBack]

  return Math.pow(1 + nominalAnnualRate / compoundFrequency, compoundFrequency / paymentFrequency) - 1
}

function calculatePeriodicPayment(principal: number, periodicRate: number, numberOfPayments: number): number {
  if (periodicRate === 0) {
    return principal / numberOfPayments
  }

  const growth = Math.pow(1 + periodicRate, numberOfPayments)
  return principal * ((periodicRate * growth) / (growth - 1))
}

function calculatePresentValue(payment: number, periodicRate: number, numberOfPayments: number): number {
  if (periodicRate === 0) {
    return payment * numberOfPayments
  }

  return payment * ((1 - Math.pow(1 + periodicRate, -numberOfPayments)) / periodicRate)
}

function solvePeriodicApr(netFunding: number, payment: number, numberOfPayments: number): number {
  if (payment * numberOfPayments <= netFunding) {
    return 0
  }

  let low = 0
  let high = 1

  while (calculatePresentValue(payment, high, numberOfPayments) > netFunding && high < 100) {
    high *= 2
  }

  for (let iteration = 0; iteration < 120; iteration += 1) {
    const mid = (low + high) / 2
    const presentValue = calculatePresentValue(payment, mid, numberOfPayments)

    if (presentValue > netFunding) {
      low = mid
    } else {
      high = mid
    }
  }

  return high
}

export function calculate(inputs: BusinessLoanInputs): BusinessLoanResults {
  const paymentFrequency = paymentsPerYear[inputs.payBack]
  const numberOfPayments = Math.max(1, Math.round(inputs.loanTerm * paymentFrequency))
  const periodicRate = getPeriodicRate(inputs.interestRate, inputs.compound, inputs.payBack)
  const periodicPayment = calculatePeriodicPayment(inputs.loanAmount, periodicRate, numberOfPayments)
  const totalPayments = periodicPayment * numberOfPayments
  const totalInterest = totalPayments - inputs.loanAmount
  const originationFeeAmount = resolveOriginationFee(inputs.loanAmount, inputs.originationFee)
  const totalFees = originationFeeAmount + inputs.documentationFee + inputs.otherFees
  const totalCostOfLoan = inputs.loanAmount + totalInterest + totalFees
  const netFunding = inputs.loanAmount - totalFees
  const periodicAprRate = solvePeriodicApr(netFunding, periodicPayment, numberOfPayments)
  const apr = periodicAprRate * paymentFrequency * 100
  const effectiveApr = (Math.pow(1 + periodicAprRate, paymentFrequency) - 1) * 100

  return {
    loanAmount: round2(inputs.loanAmount),
    interestRate: round2(inputs.interestRate),
    compound: inputs.compound,
    loanTerm: round2(inputs.loanTerm),
    payBack: inputs.payBack,
    paymentCount: numberOfPayments,
    periodicPayment: round2(periodicPayment),
    totalPayments: round2(totalPayments),
    totalInterest: round2(totalInterest),
    totalFees: round2(totalFees),
    totalCostOfLoan: round2(totalCostOfLoan),
    apr: round2(apr),
    effectiveApr: round2(effectiveApr),
    netFunding: round2(netFunding),
    originationFeeAmount: round2(originationFeeAmount)
  }
}
