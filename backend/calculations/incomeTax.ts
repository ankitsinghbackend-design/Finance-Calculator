import { z } from 'zod'

const filingStatusSchema = z.enum(['single', 'married', 'head'])
const taxYearSchema = z.union([z.literal(2025), z.literal(2026)])

export const schema = z.object({
  income: z.number().min(0),
  filingStatus: filingStatusSchema,
  youngDependents: z.number().int().min(0),
  otherDependents: z.number().int().min(0),
  taxYear: taxYearSchema
})

export type IncomeTaxInputs = z.infer<typeof schema>

export interface IncomeTaxResults {
  income: number
  taxBeforeCredits: number
  credits: number
  taxOwed: number
  effectiveRate: number
  netIncome: number
}

type FilingStatus = z.infer<typeof filingStatusSchema>
type TaxYear = z.infer<typeof taxYearSchema>

type TaxBracket = {
  upperLimit: number
  rate: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const FEDERAL_BRACKETS: Record<TaxYear, Record<FilingStatus, TaxBracket[]>> = {
  2025: {
    single: [
      { upperLimit: 11600, rate: 0.1 },
      { upperLimit: 47150, rate: 0.12 },
      { upperLimit: 100525, rate: 0.22 },
      { upperLimit: 191950, rate: 0.24 },
      { upperLimit: 243725, rate: 0.32 },
      { upperLimit: 609350, rate: 0.35 },
      { upperLimit: Number.POSITIVE_INFINITY, rate: 0.37 }
    ],
    married: [
      { upperLimit: 23200, rate: 0.1 },
      { upperLimit: 94300, rate: 0.12 },
      { upperLimit: 201050, rate: 0.22 },
      { upperLimit: 383900, rate: 0.24 },
      { upperLimit: 487450, rate: 0.32 },
      { upperLimit: 731200, rate: 0.35 },
      { upperLimit: Number.POSITIVE_INFINITY, rate: 0.37 }
    ],
    head: [
      { upperLimit: 16550, rate: 0.1 },
      { upperLimit: 63100, rate: 0.12 },
      { upperLimit: 100500, rate: 0.22 },
      { upperLimit: 191950, rate: 0.24 },
      { upperLimit: 243700, rate: 0.32 },
      { upperLimit: 609350, rate: 0.35 },
      { upperLimit: Number.POSITIVE_INFINITY, rate: 0.37 }
    ]
  },
  2026: {
    single: [
      { upperLimit: 11600, rate: 0.1 },
      { upperLimit: 47150, rate: 0.12 },
      { upperLimit: 100525, rate: 0.22 },
      { upperLimit: 191950, rate: 0.24 },
      { upperLimit: 243725, rate: 0.32 },
      { upperLimit: 609350, rate: 0.35 },
      { upperLimit: Number.POSITIVE_INFINITY, rate: 0.37 }
    ],
    married: [
      { upperLimit: 23200, rate: 0.1 },
      { upperLimit: 94300, rate: 0.12 },
      { upperLimit: 201050, rate: 0.22 },
      { upperLimit: 383900, rate: 0.24 },
      { upperLimit: 487450, rate: 0.32 },
      { upperLimit: 731200, rate: 0.35 },
      { upperLimit: Number.POSITIVE_INFINITY, rate: 0.37 }
    ],
    head: [
      { upperLimit: 16550, rate: 0.1 },
      { upperLimit: 63100, rate: 0.12 },
      { upperLimit: 100500, rate: 0.22 },
      { upperLimit: 191950, rate: 0.24 },
      { upperLimit: 243700, rate: 0.32 },
      { upperLimit: 609350, rate: 0.35 },
      { upperLimit: Number.POSITIVE_INFINITY, rate: 0.37 }
    ]
  }
}

const calculateProgressiveTax = (income: number, brackets: TaxBracket[]): number => {
  let tax = 0
  let previousLimit = 0

  for (const bracket of brackets) {
    if (income <= previousLimit) {
      break
    }

    const taxableAmount = Math.min(income, bracket.upperLimit) - previousLimit
    tax += taxableAmount * bracket.rate
    previousLimit = bracket.upperLimit
  }

  return tax
}

export function calculate(inputs: IncomeTaxInputs): IncomeTaxResults {
  const brackets = FEDERAL_BRACKETS[inputs.taxYear][inputs.filingStatus]
  const taxBeforeCredits = calculateProgressiveTax(inputs.income, brackets)
  const credits = inputs.youngDependents * 2000 + inputs.otherDependents * 500
  const taxOwed = Math.max(0, taxBeforeCredits - credits)
  const effectiveRate = inputs.income === 0 ? 0 : taxOwed / inputs.income
  const netIncome = inputs.income - taxOwed

  return {
    income: round2(inputs.income),
    taxBeforeCredits: round2(taxBeforeCredits),
    credits: round2(credits),
    taxOwed: round2(taxOwed),
    effectiveRate: round2(effectiveRate),
    netIncome: round2(netIncome)
  }
}