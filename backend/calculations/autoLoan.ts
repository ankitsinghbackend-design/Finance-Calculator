import { z } from 'zod'

const baseModeFields = {
  loanTermMonths: z.number().int().positive(),
  interestRate: z.number().min(0),
  cashIncentives: z.number().min(0).default(0),
  downPayment: z.number().min(0).default(0),
  tradeInValue: z.number().min(0).default(0),
  amountOwedOnTradeIn: z.number().min(0).default(0),
  salesTaxRate: z.number().min(0).default(0),
  titleFees: z.number().min(0).default(0)
}

const monthlyPaymentSchema = z.object({
  mode: z.literal('monthly-payment').default('monthly-payment'),
  autoPrice: z.number().nonnegative(),
  ...baseModeFields
})

const vehiclePriceSchema = z.object({
  mode: z.literal('vehicle-price'),
  desiredMonthlyPayment: z.number().positive(),
  ...baseModeFields
})

const legacySchema = z
  .object({
    price: z.number().nonnegative(),
    termMonths: z.number().int().positive(),
    annualRatePct: z.number().min(0),
    downPayment: z.number().min(0).default(0),
    tradeInValue: z.number().min(0).default(0),
    amountOwedOnTradeIn: z.number().min(0).default(0),
    cashIncentives: z.number().min(0).default(0),
    salesTaxPct: z.number().min(0).default(0),
    titlesFees: z.number().min(0).default(0),
    otherFees: z.number().min(0).default(0)
  })
  .transform((inputs) => ({
    mode: 'monthly-payment' as const,
    autoPrice: inputs.price,
    loanTermMonths: inputs.termMonths,
    interestRate: inputs.annualRatePct,
    cashIncentives: inputs.cashIncentives,
    downPayment: inputs.downPayment,
    tradeInValue: inputs.tradeInValue,
    amountOwedOnTradeIn: inputs.amountOwedOnTradeIn,
    salesTaxRate: inputs.salesTaxPct,
    titleFees: inputs.titlesFees + inputs.otherFees
  }))

export const schema = z.union([monthlyPaymentSchema, vehiclePriceSchema, legacySchema])

export type AutoLoanMode = 'monthly-payment' | 'vehicle-price'
export type AutoLoanInputs = z.infer<typeof schema>

export interface AutoLoanResults {
  mode: AutoLoanMode
  vehiclePrice: number
  maximumVehiclePrice: number
  loanAmount: number
  monthlyPayment: number
  desiredMonthlyPayment: number
  totalPayments: number
  totalInterest: number
  salesTax: number
  saleTax: number
  totalCost: number
  loanTermMonths: number
  interestRate: number
  downPayment: number
  tradeInCredit: number
  titleFees: number
  cashIncentives: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const calculateMonthlyPayment = (principal: number, totalMonths: number, annualRate: number): number => {
  const monthlyRate = annualRate / 100 / 12

  if (monthlyRate === 0) {
    return principal / totalMonths
  }

  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths))
}

const calculatePrincipalFromMonthlyPayment = (payment: number, totalMonths: number, annualRate: number): number => {
  const monthlyRate = annualRate / 100 / 12

  if (monthlyRate === 0) {
    return payment * totalMonths
  }

  return payment * ((1 - Math.pow(1 + monthlyRate, -totalMonths)) / monthlyRate)
}

const buildMonthlyPaymentResult = (inputs: z.infer<typeof monthlyPaymentSchema>): AutoLoanResults => {
  const netVehiclePrice = Math.max(
    0,
    inputs.autoPrice - inputs.cashIncentives - inputs.tradeInValue + inputs.amountOwedOnTradeIn
  )
  const salesTaxAmount = Math.max(0, netVehiclePrice * (inputs.salesTaxRate / 100))
  const totalPurchaseCost = netVehiclePrice + salesTaxAmount + inputs.titleFees
  const loanAmount = Math.max(0, totalPurchaseCost - inputs.downPayment)
  const monthlyPayment = calculateMonthlyPayment(loanAmount, inputs.loanTermMonths, inputs.interestRate)
  const totalPayments = monthlyPayment * inputs.loanTermMonths
  const totalInterest = Math.max(0, totalPayments - loanAmount)
  const totalCost = totalPurchaseCost + totalInterest
  const tradeInCredit = inputs.tradeInValue - inputs.amountOwedOnTradeIn

  return {
    mode: 'monthly-payment',
    vehiclePrice: round2(inputs.autoPrice),
    maximumVehiclePrice: round2(inputs.autoPrice),
    loanAmount: round2(loanAmount),
    monthlyPayment: round2(monthlyPayment),
    desiredMonthlyPayment: round2(monthlyPayment),
    totalPayments: round2(totalPayments),
    totalInterest: round2(totalInterest),
    salesTax: round2(salesTaxAmount),
    saleTax: round2(salesTaxAmount),
    totalCost: round2(totalCost),
    loanTermMonths: inputs.loanTermMonths,
    interestRate: round2(inputs.interestRate),
    downPayment: round2(inputs.downPayment),
    tradeInCredit: round2(tradeInCredit),
    titleFees: round2(inputs.titleFees),
    cashIncentives: round2(inputs.cashIncentives)
  }
}

const buildVehiclePriceResult = (inputs: z.infer<typeof vehiclePriceSchema>): AutoLoanResults => {
  const loanAmount = Math.max(
    0,
    calculatePrincipalFromMonthlyPayment(inputs.desiredMonthlyPayment, inputs.loanTermMonths, inputs.interestRate)
  )
  const salesTaxMultiplier = 1 + inputs.salesTaxRate / 100
  const netVehiclePrice = Math.max(
    0,
    (loanAmount + inputs.downPayment - inputs.titleFees) / salesTaxMultiplier
  )
  const vehiclePrice = Math.max(
    0,
    netVehiclePrice + inputs.cashIncentives + inputs.tradeInValue - inputs.amountOwedOnTradeIn
  )
  const salesTaxAmount = Math.max(0, netVehiclePrice * (inputs.salesTaxRate / 100))
  const totalPurchaseCost = netVehiclePrice + salesTaxAmount + inputs.titleFees
  const totalPayments = inputs.desiredMonthlyPayment * inputs.loanTermMonths
  const totalInterest = Math.max(0, totalPayments - loanAmount)
  const totalCost = totalPurchaseCost + totalInterest
  const tradeInCredit = inputs.tradeInValue - inputs.amountOwedOnTradeIn

  return {
    mode: 'vehicle-price',
    vehiclePrice: round2(vehiclePrice),
    maximumVehiclePrice: round2(vehiclePrice),
    loanAmount: round2(loanAmount),
    monthlyPayment: round2(inputs.desiredMonthlyPayment),
    desiredMonthlyPayment: round2(inputs.desiredMonthlyPayment),
    totalPayments: round2(totalPayments),
    totalInterest: round2(totalInterest),
    salesTax: round2(salesTaxAmount),
    saleTax: round2(salesTaxAmount),
    totalCost: round2(totalCost),
    loanTermMonths: inputs.loanTermMonths,
    interestRate: round2(inputs.interestRate),
    downPayment: round2(inputs.downPayment),
    tradeInCredit: round2(tradeInCredit),
    titleFees: round2(inputs.titleFees),
    cashIncentives: round2(inputs.cashIncentives)
  }
}

export function calculate(inputs: AutoLoanInputs): AutoLoanResults {
  if (inputs.mode === 'vehicle-price') {
    return buildVehiclePriceResult(inputs)
  }

  return buildMonthlyPaymentResult(inputs)
}
