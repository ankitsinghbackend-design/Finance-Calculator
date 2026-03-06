import * as autoLoan from './autoLoan'
import * as mortgage from './mortgage'
import * as compoundInterest from './compoundInterest'
import * as mortgagePayoff from './mortgagePayoff'
import * as k401 from './k401'
import { ZodTypeAny } from 'zod'

export interface CalculatorModule {
  schema: ZodTypeAny
  calculate: (inputs: any) => unknown
}

export const calculatorRegistry = {
  'auto-loan': autoLoan,
  mortgage,
  'mortgage-payoff': mortgagePayoff,
  '401k': k401,
  'compound-interest': compoundInterest
} satisfies Record<string, CalculatorModule>

export type CalculatorId = keyof typeof calculatorRegistry
