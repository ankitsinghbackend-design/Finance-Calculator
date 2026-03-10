import { z } from 'zod'

export const schema = z
  .object({
    purchasePrice: z.number().positive('Purchase price must be greater than 0.'),
    downPayment: z.number().min(0, 'Down payment cannot be negative.'),
    interestRate: z.number().min(0, 'Interest rate cannot be negative.').max(20, 'Interest rate must be 20% or less.'),
    useLoan: z.boolean(),
    loanTerm: z.number().positive('Loan term must be greater than 0.').max(40, 'Loan term must be 40 years or less.'),
    closingCost: z.number().min(0, 'Closing cost cannot be negative.'),
    needRepairsPurchase: z.boolean(),
    monthlyRent: z.number().min(0, 'Monthly rent cannot be negative.'),
    rentAnnualIncrease: z.number().min(0, 'Rent annual increase cannot be negative.').max(100, 'Rent annual increase must be 100% or less.'),
    otherIncome: z.number().min(0, 'Other income cannot be negative.'),
    otherAnnualIncrease: z.number().min(0, 'Other annual increase cannot be negative.').max(100, 'Other annual increase must be 100% or less.'),
    vacancyRate: z.number().min(0, 'Vacancy rate cannot be negative.').max(100, 'Vacancy rate must be 100% or less.'),
    managementFees: z.number().min(0, 'Management fees cannot be negative.'),
    needRepairsIncome: z.boolean(),
    propertyTaxes: z.number().min(0, 'Property taxes cannot be negative.'),
    propertyTaxesIncrease: z.number().min(0, 'Property taxes increase cannot be negative.').max(100, 'Property taxes increase must be 100% or less.'),
    totalInsurance: z.number().min(0, 'Insurance cannot be negative.'),
    totalInsuranceIncrease: z.number().min(0, 'Insurance increase cannot be negative.').max(100, 'Insurance increase must be 100% or less.'),
    hoaFees: z.number().min(0, 'HOA fees cannot be negative.'),
    hoaFeesIncrease: z.number().min(0, 'HOA fee increase cannot be negative.').max(100, 'HOA fee increase must be 100% or less.'),
    valueAppreciation: z.number().min(0, 'Value appreciation cannot be negative.').max(100, 'Value appreciation must be 100% or less.'),
    holdingLength: z.number().positive('Holding length must be greater than 0.').max(50, 'Holding length must be 50 years or less.'),
    costToSell: z.number().min(0, 'Cost to sell cannot be negative.'),
    doYouKnowSellPrice: z.boolean()
  })
  .superRefine((value, ctx) => {
    if (value.downPayment > value.purchasePrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['downPayment'],
        message: 'Down payment must be less than or equal to purchase price.'
      })
    }
  })

export type RentalPropertyInputs = z.infer<typeof schema>

export interface RentalPropertyResults {
  monthlyCashFlow: number
  netOperatingIncome: number
  capRate: number
  cashOnCashReturn: number
  totalROI: number
  breakdown: {
    totalIncome: number
    totalExpenses: number
    mortgage: number
    propertyTaxes: number
    insurance: number
    hoa: number
    management: number
  }
  projections: Array<{ year: number; cashFlow: number; equity: number; propertyValue: number }>
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const monthlyPayment = (principal: number, monthlyRate: number, months: number): number => {
  if (principal <= 0 || months <= 0) {
    return 0
  }

  if (monthlyRate === 0) {
    return principal / months
  }

  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
}

const remainingBalanceAfterMonths = (principal: number, monthlyRate: number, months: number, paidMonths: number): number => {
  if (principal <= 0 || paidMonths >= months) {
    return 0
  }

  if (monthlyRate === 0) {
    return Math.max(0, principal * (1 - paidMonths / months))
  }

  return principal * ((Math.pow(1 + monthlyRate, months) - Math.pow(1 + monthlyRate, paidMonths)) / (Math.pow(1 + monthlyRate, months) - 1))
}

export function calculate(inputs: RentalPropertyInputs): RentalPropertyResults {
  const principal = inputs.useLoan ? Math.max(0, inputs.purchasePrice - inputs.downPayment) : 0
  const loanMonths = Math.max(1, Math.round(inputs.loanTerm * 12))
  const monthlyRate = inputs.interestRate / 100 / 12
  const monthlyMortgage = inputs.useLoan ? monthlyPayment(principal, monthlyRate, loanMonths) : 0

  const grossPotentialIncome = inputs.monthlyRent + inputs.otherIncome
  const vacancyLoss = grossPotentialIncome * (inputs.vacancyRate / 100)
  const monthlyEGI = grossPotentialIncome - vacancyLoss
  const monthlyOperatingExpenses =
    inputs.propertyTaxes / 12 +
    inputs.totalInsurance / 12 +
    inputs.hoaFees / 12 +
    inputs.managementFees
  const monthlyCashFlow = monthlyEGI - monthlyOperatingExpenses - monthlyMortgage

  const annualIncome = monthlyEGI * 12
  const annualOperatingExpenses = monthlyOperatingExpenses * 12
  const annualNOI = annualIncome - annualOperatingExpenses
  const annualCashFlow = annualNOI - monthlyMortgage * 12
  const totalInitialInvestment = inputs.downPayment + inputs.closingCost
  const capRate = inputs.purchasePrice === 0 ? 0 : (annualNOI / inputs.purchasePrice) * 100
  const cashOnCashReturn = totalInitialInvestment === 0 ? 0 : (annualCashFlow / totalInitialInvestment) * 100

  let currentMonthlyRent = inputs.monthlyRent
  let currentOtherIncome = inputs.otherIncome
  let currentPropertyTaxes = inputs.propertyTaxes
  let currentInsurance = inputs.totalInsurance
  let currentHoaFees = inputs.hoaFees
  let cumulativeCashFlow = 0

  const projections = Array.from({ length: Math.max(1, Math.round(inputs.holdingLength)) }, (_, index) => {
    const year = index + 1
    const yearGrossMonthlyIncome = currentMonthlyRent + currentOtherIncome
    const yearVacancyLoss = yearGrossMonthlyIncome * (inputs.vacancyRate / 100)
    const yearEffectiveMonthlyIncome = yearGrossMonthlyIncome - yearVacancyLoss
    const yearMonthlyOperatingExpenses = currentPropertyTaxes / 12 + currentInsurance / 12 + currentHoaFees / 12 + inputs.managementFees
    const monthsPaid = Math.min(year * 12, loanMonths)
    const yearMortgage = inputs.useLoan && monthsPaid <= loanMonths ? monthlyMortgage * Math.min(12, Math.max(0, loanMonths - (year - 1) * 12)) : 0
    const yearCashFlow = yearEffectiveMonthlyIncome * 12 - yearMonthlyOperatingExpenses * 12 - yearMortgage
    cumulativeCashFlow += yearCashFlow

    const propertyValue = inputs.purchasePrice * Math.pow(1 + inputs.valueAppreciation / 100, year)
    const remainingBalance = inputs.useLoan ? remainingBalanceAfterMonths(principal, monthlyRate, loanMonths, monthsPaid) : 0
    const equity = propertyValue - remainingBalance

    currentMonthlyRent *= 1 + inputs.rentAnnualIncrease / 100
    currentOtherIncome *= 1 + inputs.otherAnnualIncrease / 100
    currentPropertyTaxes *= 1 + inputs.propertyTaxesIncrease / 100
    currentInsurance *= 1 + inputs.totalInsuranceIncrease / 100
    currentHoaFees *= 1 + inputs.hoaFeesIncrease / 100

    return {
      year,
      cashFlow: round2(cumulativeCashFlow),
      equity: round2(equity),
      propertyValue: round2(propertyValue)
    }
  })

  const finalProjection = projections[projections.length - 1]
  const estimatedSaleNet = finalProjection.propertyValue - inputs.costToSell - Math.max(0, finalProjection.propertyValue - finalProjection.equity)
  const totalProfit = estimatedSaleNet + finalProjection.cashFlow - totalInitialInvestment
  const totalROI = totalInitialInvestment === 0 ? 0 : (totalProfit / totalInitialInvestment) * 100

  return {
    monthlyCashFlow: round2(monthlyCashFlow),
    netOperatingIncome: round2(annualNOI),
    capRate: round2(capRate),
    cashOnCashReturn: round2(cashOnCashReturn),
    totalROI: round2(totalROI),
    breakdown: {
      totalIncome: round2(monthlyEGI),
      totalExpenses: round2(monthlyOperatingExpenses),
      mortgage: round2(monthlyMortgage),
      propertyTaxes: round2(inputs.propertyTaxes / 12),
      insurance: round2(inputs.totalInsurance / 12),
      hoa: round2(inputs.hoaFees / 12),
      management: round2(inputs.managementFees)
    },
    projections
  }
}
