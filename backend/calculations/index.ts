import * as autoLoan from './autoLoan'
import * as mortgage from './mortgage'
import * as compoundInterest from './compoundInterest'
import * as mortgagePayoff from './mortgagePayoff'
import * as k401 from './k401'
import * as salary from './salary'
import * as amortization from './amortization'
import * as currency from './currency'
import * as collegeCost from './collegeCost'
import * as studentLoan from './studentLoan'
import * as incomeTax from './incomeTax'
import { ZodTypeAny } from 'zod'

export interface CalculatorModule {
  schema: ZodTypeAny
  calculate: (inputs: any) => unknown
}

export const calculatorRegistry = {
  'auto-loan': autoLoan,
  mortgage,
  'mortgage-payoff': mortgagePayoff,
  amortization,
  '401k': k401,
  salary,
  currency,
  'college-cost': collegeCost,
  'student-loan': studentLoan,
  'income-tax': incomeTax,
  'compound-interest': compoundInterest
} satisfies Record<string, CalculatorModule>

export type CalculatorId = keyof typeof calculatorRegistry
