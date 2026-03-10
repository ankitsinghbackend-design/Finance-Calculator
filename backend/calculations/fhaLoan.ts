import { z } from 'zod'

export const schema = z.object({
  homePrice: z.number().positive('Home price must be greater than 0.'),
  downPaymentPercent: z
    .number()
    .min(3.5, 'FHA loans require a minimum down payment of 3.5%.')
    .max(100, 'Down payment percent must be 100% or less.'),
  loanTermMonths: z.number().int().positive('Loan term must be greater than 0.').max(480, 'Loan term must be 480 months or less.'),
  interestRate: z.number().min(0, 'Interest rate cannot be negative.').max(15, 'Interest rate must be 15% or less.'),
  upfrontMIPRate: z.number().min(0, 'Upfront MIP cannot be negative.').max(10, 'Upfront MIP must be 10% or less.'),
  annualMIPRate: z.number().min(0, 'Annual MIP cannot be negative.').max(5, 'Annual MIP must be 5% or less.'),
  mipDurationYears: z.number().positive('MIP duration must be greater than 0.').max(40, 'MIP duration must be 40 years or less.'),
  propertyTaxRate: z.number().min(0, 'Property tax rate cannot be negative.').max(15, 'Property tax rate must be 15% or less.'),
  homeInsurance: z.number().min(0, 'Home insurance cannot be negative.'),
  hoaFee: z.number().min(0, 'HOA fee cannot be negative.'),
  otherCosts: z.number().min(0, 'Other costs cannot be negative.'),
  pmiInsurance: z.number().min(0, 'PMI insurance cannot be negative.')
})

export type FHALoanInputs = z.infer<typeof schema>

export interface FHALoanResults {
  monthlyPayment: number
  baseLoanAmount: number
  upfrontMIP: number
  totalLoanAmount: number
  monthlyPI: number
  monthlyTax: number
  monthlyInsurance: number
  monthlyMIP: number
  totalInterest: number
  totalPaymentsSum: number
  totalOutOfPocket: number
  payoffDate: string
  breakdown: {
    principal: number
    interest: number
    taxes: number
    mip: number
    other: number
  }
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const formatPayoffDate = (loanTermMonths: number): string => {
  const payoff = new Date()
  payoff.setMonth(payoff.getMonth() + loanTermMonths)

  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(payoff)
  const year = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(payoff)

  return `${month}. ${year}`
}

export function calculate(inputs: FHALoanInputs): FHALoanResults {
  const downPaymentAmount = inputs.homePrice * (inputs.downPaymentPercent / 100)
  const baseLoanAmount = inputs.homePrice - downPaymentAmount
  const upfrontMIPAmount = baseLoanAmount * (inputs.upfrontMIPRate / 100)
  const totalLoanAmount = baseLoanAmount + upfrontMIPAmount
  const monthlyRate = inputs.interestRate / 100 / 12
  const totalMonths = inputs.loanTermMonths

  const monthlyPI =
    monthlyRate === 0
      ? totalLoanAmount / totalMonths
      : (totalLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)

  const monthlyMIP = (baseLoanAmount * (inputs.annualMIPRate / 100)) / 12
  const monthlyTax = (inputs.homePrice * (inputs.propertyTaxRate / 100)) / 12
  const monthlyInsurance = inputs.homeInsurance / 12
  const monthlyOther = inputs.hoaFee / 12 + inputs.otherCosts / 12 + inputs.pmiInsurance / 12
  const totalMonthlyPayment = monthlyPI + monthlyTax + monthlyInsurance + monthlyMIP + monthlyOther

  const totalMortgagePayments = monthlyPI * totalMonths
  const totalInterest = totalMortgagePayments - totalLoanAmount
  const mipMonths = Math.min(totalMonths, Math.round(inputs.mipDurationYears * 12))
  const totalMIPPayments = monthlyMIP * mipMonths
  const totalOutOfPocket =
    totalMortgagePayments +
    monthlyTax * totalMonths +
    monthlyInsurance * totalMonths +
    monthlyOther * totalMonths +
    totalMIPPayments +
    downPaymentAmount +
    upfrontMIPAmount

  const firstMonthInterest = totalLoanAmount * monthlyRate
  const firstMonthPrincipal = monthlyPI - firstMonthInterest

  return {
    monthlyPayment: round2(totalMonthlyPayment),
    baseLoanAmount: round2(baseLoanAmount),
    upfrontMIP: round2(upfrontMIPAmount),
    totalLoanAmount: round2(totalLoanAmount),
    monthlyPI: round2(monthlyPI),
    monthlyTax: round2(monthlyTax),
    monthlyInsurance: round2(monthlyInsurance),
    monthlyMIP: round2(monthlyMIP),
    totalInterest: round2(totalInterest),
    totalPaymentsSum: round2(totalMortgagePayments),
    totalOutOfPocket: round2(totalOutOfPocket),
    payoffDate: formatPayoffDate(totalMonths),
    breakdown: {
      principal: round2(Math.max(0, firstMonthPrincipal)),
      interest: round2(Math.max(0, firstMonthInterest)),
      taxes: round2(monthlyTax),
      mip: round2(monthlyMIP),
      other: round2(monthlyInsurance + monthlyOther)
    }
  }
}
