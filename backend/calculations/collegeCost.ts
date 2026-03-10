import { z } from 'zod'

export const schema = z.object({
  currentAnnualCost: z.number().min(0),
  inflationRate: z.number().min(0),
  collegeDuration: z.number().min(1),
  savingsPercent: z.number().min(0).max(100),
  currentSavings: z.number().min(0),
  investmentReturn: z.number().min(0),
  taxRate: z.number().min(0).max(100),
  yearsUntilCollege: z.number().min(0)
})

export type CollegeCostInputs = z.infer<typeof schema>

export interface CollegeCostResults {
  futureAnnualCost: number
  totalCollegeCost: number
  futureSavings: number
  savingsContribution: number
  fundingGap: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

export function calculate(inputs: CollegeCostInputs): CollegeCostResults {
  const inflation = inputs.inflationRate / 100
  const investment = inputs.investmentReturn / 100
  const savingsPct = inputs.savingsPercent / 100
  const tax = inputs.taxRate / 100

  // Step 1: Future annual cost
  const futureAnnualCost =
    inputs.currentAnnualCost * Math.pow(1 + inflation, inputs.yearsUntilCollege)

  // Step 2: Total college cost
  const totalCollegeCost = futureAnnualCost * inputs.collegeDuration

  // Step 3: Effective investment return
  const effectiveReturn = investment * (1 - tax)

  // Step 4: Future savings
  const futureSavings =
    inputs.currentSavings * Math.pow(1 + effectiveReturn, inputs.yearsUntilCollege)

  // Step 5: Savings contribution
  const savingsContribution = totalCollegeCost * savingsPct

  // Step 6: Funding gap
  const fundingGap = totalCollegeCost - futureSavings

  return {
    futureAnnualCost: round2(futureAnnualCost),
    totalCollegeCost: round2(totalCollegeCost),
    futureSavings: round2(futureSavings),
    savingsContribution: round2(savingsContribution),
    fundingGap: round2(fundingGap)
  }
}
