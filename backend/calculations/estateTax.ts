import { z } from 'zod'

export const FEDERAL_ESTATE_TAX_EXEMPTION = 13_610_000
const FEDERAL_ESTATE_TAX_RATE = 0.4

export const schema = z.object({
  residenceRealEstate: z.number().min(0).default(0),
  stocksBonds: z.number().min(0).default(0),
  savingsChecking: z.number().min(0).default(0),
  vehiclesBoats: z.number().min(0).default(0),
  retirementPlans: z.number().min(0).default(0),
  lifeInsuranceBenefit: z.number().min(0).default(0),
  otherAssets: z.number().min(0).default(0),
  debts: z.number().min(0).default(0),
  funeralExpenses: z.number().min(0).default(0),
  charitableContributions: z.number().min(0).default(0),
  stateEstateTaxes: z.number().min(0).default(0),
  lifetimeGiftedAmount: z.number().min(0).default(0)
})

export type EstateTaxInputs = z.infer<typeof schema>

export interface EstateTaxResults {
  totalAssets: number
  totalDeductions: number
  grossEstateAfterDeductions: number
  adjustedEstate: number
  taxableEstate: number
  estateTaxDue: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

export function calculate(inputs: EstateTaxInputs): EstateTaxResults {
  const totalAssets =
    inputs.residenceRealEstate +
    inputs.stocksBonds +
    inputs.savingsChecking +
    inputs.vehiclesBoats +
    inputs.retirementPlans +
    inputs.lifeInsuranceBenefit +
    inputs.otherAssets

  const totalDeductions =
    inputs.debts +
    inputs.funeralExpenses +
    inputs.charitableContributions +
    inputs.stateEstateTaxes

  const grossEstateAfterDeductions = Math.max(0, totalAssets - totalDeductions)
  const adjustedEstate = grossEstateAfterDeductions + inputs.lifetimeGiftedAmount
  const taxableEstate = Math.max(0, adjustedEstate - FEDERAL_ESTATE_TAX_EXEMPTION)
  const estateTaxDue = taxableEstate * FEDERAL_ESTATE_TAX_RATE

  return {
    totalAssets: round2(totalAssets),
    totalDeductions: round2(totalDeductions),
    grossEstateAfterDeductions: round2(grossEstateAfterDeductions),
    adjustedEstate: round2(adjustedEstate),
    taxableEstate: round2(taxableEstate),
    estateTaxDue: round2(estateTaxDue)
  }
}
