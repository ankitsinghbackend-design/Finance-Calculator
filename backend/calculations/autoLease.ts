import { z } from 'zod'

export const schema = z
  .object({
    autoPrice: z.number().positive('Auto price must be greater than 0.'),
    leaseTermMonths: z.number().int('Lease term must be a whole number of months.').min(1, 'Lease term must be at least 1 month.'),
    interestRate: z.number().min(0, 'Interest rate cannot be negative.'),
    cashIncentives: z.number().min(0, 'Cash incentives cannot be negative.'),
    downPayment: z.number().min(0, 'Down payment cannot be negative.'),
    tradeInValue: z.number().min(0, 'Trade-in value cannot be negative.'),
    salesTaxRate: z.number().min(0, 'Sales tax cannot be negative.'),
    residualValue: z.number().min(0, 'Residual value cannot be negative.')
  })
  .superRefine((value, ctx) => {
    const adjustedCapitalizedCost = value.autoPrice - value.cashIncentives - value.downPayment - value.tradeInValue

    if (adjustedCapitalizedCost <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tradeInValue'],
        message: 'Incentives, down payment, and trade-in value cannot reduce the adjusted capitalized cost to zero or below.'
      })
    }

    if (value.residualValue > adjustedCapitalizedCost) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['residualValue'],
        message: 'Residual value must be less than or equal to the adjusted capitalized cost.'
      })
    }
  })

export type AutoLeaseInputs = z.infer<typeof schema>

export type AutoLeaseResults = {
  autoPrice: number
  leaseTermMonths: number
  interestRate: number
  cashIncentives: number
  downPayment: number
  tradeInValue: number
  salesTaxRate: number
  residualValue: number
  adjustedCapitalizedCost: number
  moneyFactor: number
  monthlyDepreciation: number
  monthlyFinanceCharge: number
  baseMonthlyPayment: number
  monthlySalesTax: number
  totalMonthlyPayment: number
  totalLeasePayments: number
  totalFinanceCost: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100
const round6 = (value: number): number => Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000

export function calculate(inputs: AutoLeaseInputs): AutoLeaseResults {
  const adjustedCapitalizedCost = inputs.autoPrice - inputs.cashIncentives - inputs.downPayment - inputs.tradeInValue
  const moneyFactor = inputs.interestRate / 2400
  const monthlyDepreciation = (adjustedCapitalizedCost - inputs.residualValue) / inputs.leaseTermMonths
  const monthlyFinanceCharge = (adjustedCapitalizedCost + inputs.residualValue) * moneyFactor
  const baseMonthlyPayment = monthlyDepreciation + monthlyFinanceCharge
  const monthlySalesTax = baseMonthlyPayment * (inputs.salesTaxRate / 100)
  const totalMonthlyPayment = baseMonthlyPayment + monthlySalesTax
  const totalLeasePayments = totalMonthlyPayment * inputs.leaseTermMonths
  const totalFinanceCost = monthlyFinanceCharge * inputs.leaseTermMonths

  return {
    autoPrice: round2(inputs.autoPrice),
    leaseTermMonths: inputs.leaseTermMonths,
    interestRate: round2(inputs.interestRate),
    cashIncentives: round2(inputs.cashIncentives),
    downPayment: round2(inputs.downPayment),
    tradeInValue: round2(inputs.tradeInValue),
    salesTaxRate: round2(inputs.salesTaxRate),
    residualValue: round2(inputs.residualValue),
    adjustedCapitalizedCost: round2(adjustedCapitalizedCost),
    moneyFactor: round6(moneyFactor),
    monthlyDepreciation: round2(monthlyDepreciation),
    monthlyFinanceCharge: round2(monthlyFinanceCharge),
    baseMonthlyPayment: round2(baseMonthlyPayment),
    monthlySalesTax: round2(monthlySalesTax),
    totalMonthlyPayment: round2(totalMonthlyPayment),
    totalLeasePayments: round2(totalLeasePayments),
    totalFinanceCost: round2(totalFinanceCost)
  }
}