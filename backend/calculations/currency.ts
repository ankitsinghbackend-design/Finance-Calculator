import { z } from 'zod'

export const schema = z.object({
  amount: z.number().min(0),
  fromCurrency: z.string().length(3).default('USD'),
  toCurrency: z.string().length(3),
  exchangeRate: z.number().positive(),
  timeLastUpdateUtc: z.string().min(1).optional(),
  provider: z.string().min(1).optional()
})

export type CurrencyInputs = z.infer<typeof schema>

export interface CurrencyResults {
  amount: number
  fromCurrency: string
  toCurrency: string
  exchangeRate: number
  convertedAmount: number
  timeLastUpdateUtc?: string
  provider?: string
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

export function calculate(inputs: CurrencyInputs): CurrencyResults {
  const convertedAmount = inputs.amount * inputs.exchangeRate

  return {
    amount: round2(inputs.amount),
    fromCurrency: inputs.fromCurrency.toUpperCase(),
    toCurrency: inputs.toCurrency.toUpperCase(),
    exchangeRate: inputs.exchangeRate,
    convertedAmount: round2(convertedAmount),
    timeLastUpdateUtc: inputs.timeLastUpdateUtc,
    provider: inputs.provider
  }
}
