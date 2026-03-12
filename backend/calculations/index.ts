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
import * as socialSecurity from './socialSecurity'
import * as houseAffordability from './houseAffordability'
import * as repayment from './repayment'
import * as investment from './investment'
import * as interestRate from './interestRate'
import * as estateTax from './estateTax'
import * as loan from './loan'
import * as heloc from './heloc'
import * as rentVsBuy from './rentVsBuy'
import * as autoLease from './autoLease'
import * as salesTax from './salesTax'
import * as debtToIncome from './debtToIncome'
import * as fhaLoan from './fhaLoan'
import * as vaMortgage from './vaMortgage'
import * as refinance from './refinance'
import * as rentalProperty from './rentalProperty'
import * as downPayment from './downPayment'
import * as cashBackComparison from './cashBackComparison'
import * as annuityCalc from './annuityCalc'
import * as rothIraCalc from './rothIraCalc'
import * as rmdCalc from './rmdCalc'
import * as bondCalc from './bondCalc'
import * as mutualFund from './mutualFund'
import * as depreciation from './depreciation'
import { generalAprSchema, mortgageAprSchema, calculateGeneralApr, calculateMortgageApr } from './aprLogic'
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
  loan,
  heloc,
  'rent-vs-buy': rentVsBuy,
  'auto-lease': autoLease,
  'fha-loan': fhaLoan,
  'va-mortgage': vaMortgage,
  refinance,
  'rental-property': rentalProperty,
  'down-payment': downPayment,
  'cashback-vs-low-interest': cashBackComparison,
  'cash-back-or-low-interest': cashBackComparison,
  annuity: annuityCalc,
  'roth-ira': rothIraCalc,
  rmd: rmdCalc,
  'bond-pricing': bondCalc,
  bond: bondCalc,
  'mutual-fund': mutualFund,
  'general-apr': {
    schema: generalAprSchema,
    calculate: calculateGeneralApr
  },
  'mortgage-apr': {
    schema: mortgageAprSchema,
    calculate: calculateMortgageApr
  },
  'sales-tax': salesTax,
  'debt-to-income': debtToIncome,
  investment,
  'interest-rate': interestRate,
  'estate-tax': estateTax,
  currency,
  'college-cost': collegeCost,
  'student-loan': studentLoan,
  'house-affordability': houseAffordability,
  'income-tax': incomeTax,
  pension,
  'social-security': socialSecurity,
  'compound-interest': compoundInterest,
  depreciation
} satisfies Record<string, CalculatorModule>

export type CalculatorId = keyof typeof calculatorRegistry
