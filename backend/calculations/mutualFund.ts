import { z } from 'zod'

export const holdingUnitSchema = z.enum(['months', 'years'])

export const schema = z.object({
  initialInvestment: z.number().min(0).default(0),
  annualContribution: z.number().min(0).default(0),
  monthlyContribution: z.number().min(0).default(0),
  rateOfReturn: z.number().min(0).default(0),
  holdingLength: z.number().positive(),
  holdingUnit: holdingUnitSchema.default('months'),
  salesCharge: z.number().min(0).max(100).default(0),
  deferredSalesCharge: z.number().min(0).max(100).default(0),
  operatingExpenses: z.number().min(0).max(100).default(0)
})

export type MutualFundInputs = z.infer<typeof schema>

export interface MutualFundResults {
  finalBalance: number
  totalContributions: number
  totalFeesPaid: number
  netGain: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const toMonths = (holdingLength: number, holdingUnit: z.infer<typeof holdingUnitSchema>): number =>
  holdingUnit === 'years' ? Math.max(1, Math.round(holdingLength * 12)) : Math.max(1, Math.round(holdingLength))

function simulateBalance(params: {
  initialAmount: number
  annualContribution: number
  monthlyContribution: number
  monthlyRate: number
  totalMonths: number
}): number {
  let balance = params.initialAmount

  for (let monthIndex = 1; monthIndex <= params.totalMonths; monthIndex += 1) {
    balance *= 1 + params.monthlyRate
    balance += params.monthlyContribution

    if (monthIndex % 12 === 0) {
      balance += params.annualContribution
    }
  }

  return balance
}

export function calculate(inputs: MutualFundInputs): MutualFundResults {
  const totalMonths = toMonths(inputs.holdingLength, inputs.holdingUnit)
  const grossMonthlyRate = inputs.rateOfReturn / 100 / 12
  const netMonthlyRate = (inputs.rateOfReturn - inputs.operatingExpenses) / 100 / 12
  const frontLoadMultiplier = 1 - inputs.salesCharge / 100
  const deferredMultiplier = 1 - inputs.deferredSalesCharge / 100

  const grossInitialContribution = inputs.initialInvestment
  const grossAnnualContribution = inputs.annualContribution * Math.floor(totalMonths / 12)
  const grossMonthlyContribution = inputs.monthlyContribution * totalMonths
  const totalContributions = grossInitialContribution + grossAnnualContribution + grossMonthlyContribution

  const netInitial = inputs.initialInvestment * frontLoadMultiplier
  const netAnnual = inputs.annualContribution * frontLoadMultiplier
  const netMonthly = inputs.monthlyContribution * frontLoadMultiplier

  const endingBeforeDeferred = simulateBalance({
    initialAmount: netInitial,
    annualContribution: netAnnual,
    monthlyContribution: netMonthly,
    monthlyRate: netMonthlyRate,
    totalMonths
  })

  const grossEndingBeforeExpense = simulateBalance({
    initialAmount: netInitial,
    annualContribution: netAnnual,
    monthlyContribution: netMonthly,
    monthlyRate: grossMonthlyRate,
    totalMonths
  })

  const finalBalance = endingBeforeDeferred * deferredMultiplier

  const frontLoadFees = totalContributions - (netInitial + netAnnual * Math.floor(totalMonths / 12) + netMonthly * totalMonths)
  const operatingExpenseCost = Math.max(0, grossEndingBeforeExpense - endingBeforeDeferred)
  const deferredSalesFee = endingBeforeDeferred - finalBalance
  const totalFeesPaid = frontLoadFees + operatingExpenseCost + deferredSalesFee
  const netGain = finalBalance - totalContributions

  return {
    finalBalance: round2(finalBalance),
    totalContributions: round2(totalContributions),
    totalFeesPaid: round2(totalFeesPaid),
    netGain: round2(netGain)
  }
}
