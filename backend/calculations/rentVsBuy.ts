import { z } from 'zod'

export const taxFilingStatusSchema = z.enum([
  'Single',
  'Married Filing Jointly',
  'Married Filing Separately'
])

export const schema = z
  .object({
    homePrice: z.number().positive('Home price must be greater than 0.'),
    downPayment: z.number().min(0, 'Down payment cannot be negative.'),
    interestRate: z.number().min(0, 'Interest rate cannot be negative.').max(20, 'Interest rate must be 20% or less.'),
    loanTermYears: z.number().int().min(5, 'Loan term must be at least 5 years.').max(40, 'Loan term must be 40 years or less.'),
    buyingClosingCosts: z.number().min(0, 'Buying closing costs cannot be negative.'),
    propertyTax: z.number().min(0, 'Property tax cannot be negative.'),
    propertyTaxIncrease: z.number().min(0, 'Property tax increase cannot be negative.').max(20, 'Property tax increase must be 20% or less.'),
    homeInsurance: z.number().min(0, 'Home insurance cannot be negative.'),
    hoaFee: z.number().min(0, 'HOA fee cannot be negative.'),
    maintenanceCost: z.number().min(0, 'Maintenance cost cannot be negative.'),
    homeValueAppreciation: z.number().min(0, 'Home value appreciation cannot be negative.').max(20, 'Home value appreciation must be 20% or less.'),
    costInsuranceIncrease: z.number().min(0, 'Cost / insurance increase cannot be negative.').max(20, 'Cost / insurance increase must be 20% or less.'),
    sellingClosingCosts: z.number().min(0, 'Selling closing costs cannot be negative.').max(20, 'Selling closing costs must be 20% or less.'),
    monthlyRent: z.number().positive('Monthly rent must be greater than 0.'),
    rentIncreaseRate: z.number().min(0, 'Rent increase cannot be negative.').max(20, 'Rent increase must be 20% or less.'),
    rentersInsurance: z.number().min(0, 'Renter\'s insurance cannot be negative.'),
    securityDeposit: z.number().min(0, 'Security deposit cannot be negative.'),
    upfrontCost: z.number().min(0, 'Upfront cost cannot be negative.'),
    averageInvestmentReturn: z.number().min(0, 'Average investment return cannot be negative.').max(20, 'Average investment return must be 20% or less.'),
    marginalFederalTaxRate: z.number().min(0, 'Marginal federal tax rate cannot be negative.').max(20, 'Marginal federal tax rate must be 20% or less.'),
    marginalStateTaxRate: z.number().min(0, 'Marginal state tax rate cannot be negative.').max(20, 'Marginal state tax rate must be 20% or less.'),
    taxFilingStatus: taxFilingStatusSchema
  })
  .superRefine((value, ctx) => {
    if (value.downPayment >= value.homePrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['downPayment'],
        message: 'Down payment must be less than the home price.'
      })
    }
  })

export type RentVsBuyInputs = z.infer<typeof schema>

export interface RentVsBuyResults {
  totalRentCost: number
  totalBuyCost: number
  homeValueEnd: number
  equityAfterSale: number
  remainingMortgageBalance: number
  investmentValue: number
  rentVsBuyDifference: number
  recommendedOption: 'rent' | 'buy'
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const monthlyPayment = (principal: number, monthlyRate: number, months: number): number => {
  if (monthlyRate === 0) {
    return principal / months
  }

  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
}

const remainingBalanceAfterMonths = (principal: number, monthlyRate: number, months: number, paidMonths: number): number => {
  if (paidMonths >= months) {
    return 0
  }

  if (monthlyRate === 0) {
    return Math.max(0, principal * (1 - paidMonths / months))
  }

  return principal * ((Math.pow(1 + monthlyRate, months) - Math.pow(1 + monthlyRate, paidMonths)) / (Math.pow(1 + monthlyRate, months) - 1))
}

const deductionCaps = (status: RentVsBuyInputs['taxFilingStatus']) => {
  if (status === 'Married Filing Separately') {
    return { saltCap: 5000, mortgageCap: 375000 }
  }

  return { saltCap: 10000, mortgageCap: 750000 }
}

export function calculate(inputs: RentVsBuyInputs): RentVsBuyResults {
  const years = inputs.loanTermYears
  const months = years * 12
  const loanAmount = inputs.homePrice - inputs.downPayment
  const monthlyRate = inputs.interestRate / 100 / 12
  const mortgagePayment = monthlyPayment(loanAmount, monthlyRate, months)
  const combinedTaxRate = (inputs.marginalFederalTaxRate + inputs.marginalStateTaxRate) / 100
  const { saltCap, mortgageCap } = deductionCaps(inputs.taxFilingStatus)
  const deductibleInterestRatio = loanAmount > 0 ? Math.min(1, mortgageCap / loanAmount) : 0

  let totalBuyOutflows = inputs.downPayment + inputs.buyingClosingCosts
  let totalTaxBenefits = 0
  let propertyTaxCurrent = inputs.propertyTax
  let insuranceCurrent = inputs.homeInsurance
  let maintenanceCurrent = inputs.maintenanceCost
  let balance = loanAmount

  for (let year = 0; year < years; year += 1) {
    let annualInterestPaid = 0

    for (let month = 0; month < 12; month += 1) {
      const interestPaid = balance * monthlyRate
      const principalPaid = mortgagePayment - interestPaid
      annualInterestPaid += interestPaid
      balance = Math.max(0, balance - principalPaid)
    }

    const annualMortgagePayments = mortgagePayment * 12
    const annualHousingCosts = annualMortgagePayments + propertyTaxCurrent + insuranceCurrent + inputs.hoaFee + maintenanceCurrent
    totalBuyOutflows += annualHousingCosts

    const deductibleInterest = annualInterestPaid * deductibleInterestRatio
    const deductiblePropertyTax = Math.min(propertyTaxCurrent, saltCap)
    totalTaxBenefits += (deductibleInterest + deductiblePropertyTax) * combinedTaxRate

    propertyTaxCurrent *= 1 + inputs.propertyTaxIncrease / 100
    insuranceCurrent *= 1 + inputs.costInsuranceIncrease / 100
    maintenanceCurrent *= 1 + inputs.costInsuranceIncrease / 100
  }

  const homeValueEnd = inputs.homePrice * Math.pow(1 + inputs.homeValueAppreciation / 100, years)
  const remainingMortgageBalance = remainingBalanceAfterMonths(loanAmount, monthlyRate, months, months)
  const homeSaleValue = homeValueEnd * (1 - inputs.sellingClosingCosts / 100)
  const equityAfterSale = Math.max(0, homeSaleValue - remainingMortgageBalance)
  const investmentValue = inputs.downPayment * Math.pow(1 + inputs.averageInvestmentReturn / 100, years)
  const opportunityCost = investmentValue - inputs.downPayment

  let totalRentCost = inputs.securityDeposit + inputs.upfrontCost
  for (let year = 0; year < years; year += 1) {
    const annualRent = inputs.monthlyRent * 12 * Math.pow(1 + inputs.rentIncreaseRate / 100, year)
    totalRentCost += annualRent + inputs.rentersInsurance * 12
  }

  const totalBuyCost = totalBuyOutflows - equityAfterSale - totalTaxBenefits + opportunityCost
  const rentVsBuyDifference = totalRentCost - totalBuyCost

  return {
    totalRentCost: round2(totalRentCost),
    totalBuyCost: round2(totalBuyCost),
    homeValueEnd: round2(homeValueEnd),
    equityAfterSale: round2(equityAfterSale),
    remainingMortgageBalance: round2(remainingMortgageBalance),
    investmentValue: round2(investmentValue),
    rentVsBuyDifference: round2(rentVsBuyDifference),
    recommendedOption: rentVsBuyDifference > 0 ? 'buy' : 'rent'
  }
}
