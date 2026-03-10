import { z } from 'zod'

export const serviceTypeSchema = z.enum(['active-veteran', 'reservist-national-guard', 'surviving-spouse'])
export const fundingFeePaymentMethodSchema = z.enum(['finance', 'upfront'])

export const schema = z.object({
  homePrice: z.number().positive('Home price must be greater than 0.'),
  downPaymentPercent: z.number().min(0, 'Down payment percent cannot be negative.').max(100, 'Down payment percent must be 100% or less.'),
  loanTermMonths: z.number().int().min(12, 'Loan term must be at least 12 months.').max(480, 'Loan term must be 480 months or less.'),
  interestRate: z.number().min(0, 'Interest rate cannot be negative.').max(15, 'Interest rate must be 15% or less.'),
  serviceType: serviceTypeSchema,
  usedVALoanBefore: z.boolean(),
  hasDisability: z.boolean(),
  fundingFeePaymentMethod: fundingFeePaymentMethodSchema
})

export type VAMortgageInputs = z.infer<typeof schema>

export interface VAMortgageResults {
  totalMonthlyPayment: number
  housePrice: number
  fundingFeeAmount: number
  fundingFeePercent: number
  downPaymentAmount: number
  loanAmount: number
  totalPaymentsSum: number
  totalInterest: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

export function getVAFundingFeePercent(inputs: Pick<VAMortgageInputs, 'downPaymentPercent' | 'usedVALoanBefore' | 'hasDisability' | 'serviceType'>): number {
  if (inputs.hasDisability || inputs.serviceType === 'surviving-spouse') {
    return 0
  }

  if (inputs.downPaymentPercent >= 10) {
    return 1.25
  }

  if (inputs.downPaymentPercent >= 5) {
    return 1.5
  }

  return inputs.usedVALoanBefore ? 3.3 : 2.15
}

export function calculate(inputs: VAMortgageInputs): VAMortgageResults {
  const downPaymentAmount = inputs.homePrice * (inputs.downPaymentPercent / 100)
  const baseLoanAmount = inputs.homePrice - downPaymentAmount
  const fundingFeePercent = getVAFundingFeePercent(inputs)
  const fundingFeeAmount = baseLoanAmount * (fundingFeePercent / 100)
  const totalLoanAmount = inputs.fundingFeePaymentMethod === 'finance' ? baseLoanAmount + fundingFeeAmount : baseLoanAmount
  const monthlyRate = inputs.interestRate / 100 / 12
  const totalMonths = inputs.loanTermMonths

  const monthlyPI =
    monthlyRate === 0
      ? totalLoanAmount / totalMonths
      : (totalLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)

  const totalPaymentsSum = monthlyPI * totalMonths
  const totalInterest = totalPaymentsSum - totalLoanAmount

  return {
    totalMonthlyPayment: round2(monthlyPI),
    housePrice: round2(inputs.homePrice),
    fundingFeeAmount: round2(fundingFeeAmount),
    fundingFeePercent: round2(fundingFeePercent),
    downPaymentAmount: round2(downPaymentAmount),
    loanAmount: round2(totalLoanAmount),
    totalPaymentsSum: round2(totalPaymentsSum),
    totalInterest: round2(totalInterest)
  }
}
