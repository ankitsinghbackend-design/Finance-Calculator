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
import * as pension from './pension'
import * as houseAffordability from './houseAffordability'
import * as repayment from './repayment'
import * as investment from './investment'
import * as interestRate from './interestRate'
import * as estateTax from './estateTax'
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
  repayment,
  investment,
  'interest-rate': interestRate,
  'estate-tax': estateTax,
  currency,
  'college-cost': collegeCost,
  'student-loan': studentLoan,
  'house-affordability': houseAffordability,
  'income-tax': incomeTax,
  pension,
  'compound-interest': compoundInterest
} satisfies Record<string, CalculatorModule>

export type CalculatorId = keyof typeof calculatorRegistry
