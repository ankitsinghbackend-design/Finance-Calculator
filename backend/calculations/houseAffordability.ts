import { z } from 'zod'

export const dtiRatioTypeSchema = z.enum([
  'conventional',
  'fha',
  'va',
  'manual-10',
  'manual-15',
  'manual-20',
  'manual-25',
  'manual-30',
  'manual-35',
  'manual-40',
  'manual-45',
  'manual-50'
])

export type HouseAffordabilityDTIType = z.infer<typeof dtiRatioTypeSchema>

export const DTI_OPTION_LABELS: Record<HouseAffordabilityDTIType, string> = {
  conventional: 'Conventional Loan (28/36 rule)',
  fha: 'FHA Loan (31/43)',
  va: 'VA Loan (41%)',
  'manual-10': '10%',
  'manual-15': '15%',
  'manual-20': '20%',
  'manual-25': '25%',
  'manual-30': '30%',
  'manual-35': '35%',
  'manual-40': '40%',
  'manual-45': '45%',
  'manual-50': '50%'
}

export const schema = z.object({
  annualIncome: z.number().min(0),
  mortgageTermYears: z.number().min(1),
  interestRate: z.number().min(0),
  monthlyDebtPayments: z.number().min(0),
  downPaymentPercent: z.number().min(0).max(1),
  propertyTaxRate: z.number().min(0),
  hoaMonthlyFee: z.number().min(0),
  insuranceAnnual: z.number().min(0),
  dtiRatioType: dtiRatioTypeSchema
})

export type HouseAffordabilityInputs = z.infer<typeof schema>

export type HouseAffordabilityResults = {
  loanAmount: number
  housePrice: number
  downPayment: number
  closingCost: number
  mortgagePayment: number
  propertyTaxAnnual: number
  insuranceAnnual: number
  hoaAnnual: number
  frontEndDTI: number
  backEndDTI: number
  totalMonthlyCost: number
}

type DTISetting = {
  frontEndDTI: number
  backEndDTI: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

export const resolveDTISetting = (dtiRatioType: HouseAffordabilityDTIType): DTISetting => {
  switch (dtiRatioType) {
    case 'conventional':
      return { frontEndDTI: 0.28, backEndDTI: 0.36 }
    case 'fha':
      return { frontEndDTI: 0.31, backEndDTI: 0.43 }
    case 'va':
      return { frontEndDTI: 0.41, backEndDTI: 0.41 }
    default: {
      const manualPercent = Number(dtiRatioType.replace('manual-', '')) / 100
      return { frontEndDTI: manualPercent, backEndDTI: manualPercent }
    }
  }
}

const getMonthlyMortgagePayment = (loanAmount: number, monthlyRate: number, totalMonths: number): number => {
  if (loanAmount <= 0) {
    return 0
  }

  if (monthlyRate === 0) {
    return loanAmount / totalMonths
  }

  return (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths))
}

const getMonthlyHousingCost = (
  housePrice: number,
  downPaymentPercent: number,
  monthlyRate: number,
  totalMonths: number,
  propertyTaxRate: number,
  insuranceMonthly: number,
  hoaMonthlyFee: number
) => {
  const downPayment = housePrice * downPaymentPercent
  const loanAmount = Math.max(0, housePrice - downPayment)
  const mortgagePayment = getMonthlyMortgagePayment(loanAmount, monthlyRate, totalMonths)
  const propertyTaxMonthly = (housePrice * propertyTaxRate) / 12
  const totalMonthlyCost = mortgagePayment + propertyTaxMonthly + insuranceMonthly + hoaMonthlyFee

  return {
    downPayment,
    loanAmount,
    mortgagePayment,
    propertyTaxMonthly,
    totalMonthlyCost
  }
}

export function calculate(inputs: HouseAffordabilityInputs): HouseAffordabilityResults {
  const monthlyIncome = inputs.annualIncome / 12
  const { frontEndDTI, backEndDTI } = resolveDTISetting(inputs.dtiRatioType)
  const maxHousingByFront = monthlyIncome * frontEndDTI
  const maxHousingByBack = Math.max(0, monthlyIncome * backEndDTI - inputs.monthlyDebtPayments)
  const maxHousingPayment = Math.max(0, Math.min(maxHousingByFront, maxHousingByBack))
  const insuranceMonthly = inputs.insuranceAnnual / 12
  const monthlyRate = inputs.interestRate / 100 / 12
  const totalMonths = Math.max(1, Math.round(inputs.mortgageTermYears * 12))
  const fixedMonthlyHousingCosts = insuranceMonthly + inputs.hoaMonthlyFee

  if (maxHousingPayment <= fixedMonthlyHousingCosts) {
    return {
      loanAmount: 0,
      housePrice: 0,
      downPayment: 0,
      closingCost: 0,
      mortgagePayment: 0,
      propertyTaxAnnual: 0,
      insuranceAnnual: round2(inputs.insuranceAnnual),
      hoaAnnual: round2(inputs.hoaMonthlyFee * 12),
      frontEndDTI: round2(frontEndDTI),
      backEndDTI: round2(backEndDTI),
      totalMonthlyCost: round2(fixedMonthlyHousingCosts)
    }
  }

  let low = 0
  let high = Math.max(inputs.annualIncome * 8, 100000)

  while (
    getMonthlyHousingCost(
      high,
      inputs.downPaymentPercent,
      monthlyRate,
      totalMonths,
      inputs.propertyTaxRate,
      insuranceMonthly,
      inputs.hoaMonthlyFee
    ).totalMonthlyCost < maxHousingPayment
  ) {
    high *= 2

    if (high > 100000000) {
      break
    }
  }

  for (let index = 0; index < 80; index += 1) {
    const midpoint = (low + high) / 2
    const estimate = getMonthlyHousingCost(
      midpoint,
      inputs.downPaymentPercent,
      monthlyRate,
      totalMonths,
      inputs.propertyTaxRate,
      insuranceMonthly,
      inputs.hoaMonthlyFee
    )

    if (estimate.totalMonthlyCost <= maxHousingPayment) {
      low = midpoint
    } else {
      high = midpoint
    }
  }

  const housePrice = low
  const monthlyEstimate = getMonthlyHousingCost(
    housePrice,
    inputs.downPaymentPercent,
    monthlyRate,
    totalMonths,
    inputs.propertyTaxRate,
    insuranceMonthly,
    inputs.hoaMonthlyFee
  )
  const propertyTaxAnnual = housePrice * inputs.propertyTaxRate
  const closingCost = housePrice * 0.03

  return {
    loanAmount: round2(monthlyEstimate.loanAmount),
    housePrice: round2(housePrice),
    downPayment: round2(monthlyEstimate.downPayment),
    closingCost: round2(closingCost),
    mortgagePayment: round2(monthlyEstimate.mortgagePayment),
    propertyTaxAnnual: round2(propertyTaxAnnual),
    insuranceAnnual: round2(inputs.insuranceAnnual),
    hoaAnnual: round2(inputs.hoaMonthlyFee * 12),
    frontEndDTI: round2(frontEndDTI),
    backEndDTI: round2(backEndDTI),
    totalMonthlyCost: round2(monthlyEstimate.totalMonthlyCost)
  }
}
