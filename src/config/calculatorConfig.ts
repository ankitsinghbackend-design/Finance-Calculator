export type CalculatorItem = {
  id: string
  title: string
  description?: string
  category: string
}

export type FinanceMenuSection = {
  title: string
  items: string[]
}

export type FinanceMenuColumn = {
  title: string
  items?: string[]
  sections?: FinanceMenuSection[]
}

// Seeded list — extendable to 30+ items
export const calculators: CalculatorItem[] = [
  { id: 'mortgage', title: 'Mortgage Calculator', description: 'Estimate monthly mortgage payments.', category: 'Loan' },
  { id: 'auto-loan', title: 'Auto Loan Calculator', description: 'Auto loan payments & amortization.', category: 'Loan' },
  { id: 'personal-loan', title: 'Personal Loan', description: 'Personal loan planner.', category: 'Loan' },
  { id: 'compound-interest', title: 'Compound Interest', description: 'Growth over time with compound interest.', category: 'Investment' },
  { id: 'retirement', title: 'Retirement Calculator', description: 'Estimate retirement savings.', category: 'Retirement' },
  { id: 'savings', title: 'Savings Calculator', description: 'Plan savings goals.', category: 'Savings' },
  { id: 'tax', title: 'Income Tax Calculator', description: 'Estimate taxes.', category: 'Tax' },
  { id: 'currency', title: 'Currency Converter', description: 'Quick conversions.', category: 'Utility' },
  { id: 'inflation', title: 'Inflation Calculator', description: 'Adjust for inflation.', category: 'Investment' },
  { id: 'view-all', title: 'View All Calculators', description: 'Explore full list.', category: 'General' }
]

export const categories = Array.from(new Set(calculators.map(c => c.category)))

export const financeMenuColumns: FinanceMenuColumn[] = [
  {
    title: 'Mortgage & Real Estate',
    items: [
      'Mortgage & Real Estate',
      'Amortization Calculator',
      'Mortgage Payoff Calculator',
      'House Affordability Calculator',
      'Rent Calculator',
      'Debt-to-Income Ratio Calculator',
      'Real Estate Calculator',
      'Refinance Calculator',
      'Rental Property Calculator',
      'APR Calculator',
      'FHA Loan Calculator',
      'VA Mortgage Calculator',
      'Home Equity Loan Calculator',
      'HELOC Calculator',
      'Down Payment Calculator',
      'Rent vs. Buy Calculator'
    ]
  },
  {
    title: 'Auto',
    sections: [
      {
        title: 'Auto',
        items: [
          'Auto Loan Calculator',
          'Cash Back or Low Interest Calculator',
          'Auto Lease Calculator'
        ]
      },
      {
        title: 'Tax and Salary',
        items: [
          'Income Tax Calculator',
          'Salary Calculator',
          'Marriage Tax Calculator',
          'Estate Tax Calculator',
          'Take-Home-Paycheck Calculator'
        ]
      }
    ]
  },
  {
    title: 'Investment',
    items: [
      'Interest Calculator',
      'Investment Calculator',
      'Finance Calculator',
      'Compound Interest Calculator',
      'Interest Rate Calculator',
      'Savings Calculator',
      'Simple Interest Calculator',
      'CD Calculator',
      'Bond Calculator',
      'Average Return Calculator',
      'IRR Calculator',
      'ROI Calculator',
      'Payback Period Calculator',
      'Present Value Calculator',
      'Future Value Calculator'
    ]
  },
  {
    title: 'Retirement',
    items: [
      'Retirement Calculator',
      '401K Calculator',
      'Pension Calculator',
      'Social Security Calculator',
      'Annuity Calculator',
      'Annuity Payout Calculator',
      'Roth IRA Calculator',
      'IRA Calculator',
      'RMD Calculator'
    ]
  },
  {
    title: 'Other',
    items: [
      'Loan Calculator',
      'Payment Calculator',
      'Currency Calculator',
      'Inflation Calculator',
      'Sales Tax Calculator',
      'Credit Card Calculator',
      'Credit Cards Payoff Calculator',
      'Debt Payoff Calculator',
      'Debt Consolidation Calculator',
      'Repayment Calculator',
      'Student Loan Calculator',
      'College Cost Calculator',
      'VAT Calculator',
      'Depreciation Calculator',
      'Margin Calculator',
      'Discount Calculator',
      'Business Loan Calculator',
      'Personal Loan Calculator',
      'Boat Loan Calculator',
      'Lease Calculator',
      'Budget Calculator',
      'Commission Calculator'
    ]
  }
]
