export type CalculatorItem = {
  id: string
  title: string
  description?: string
  category: string
}

export type LandingCalculatorLink = {
  label: string
  calculatorId: string
}

export type FinanceMenuItem = {
  label: string
  calculatorId?: string
}

export type FinanceMenuSection = {
  title: string
  items: FinanceMenuItem[]
}

export type FinanceMenuColumn = {
  title: string
  items?: FinanceMenuItem[]
  sections?: FinanceMenuSection[]
}

// Seeded list — extendable to 30+ items
export const calculators: CalculatorItem[] = [
  { id: 'mortgage', title: 'Mortgage Calculator', description: 'Estimate monthly mortgage payments.', category: 'Loan' },
  { id: 'house-affordability', title: 'House Affordability Calculator', description: 'Estimate the home price and mortgage amount you can afford.', category: 'Loan' },
  { id: 'dti-ratio', title: 'Debt-to-Income (DTI) Ratio Calculator', description: 'Measure front-end and back-end debt-to-income ratios.', category: 'Loan' },
  { id: 'refinance', title: 'Refinance Calculator', description: 'Compare mortgage refinance costs and savings.', category: 'Loan' },
  { id: 'rental-property', title: 'Rental Property Calculator', description: 'Evaluate rental income, costs, and return potential.', category: 'Loan' },
  { id: 'apr', title: 'APR Calculator', description: 'Estimate annual percentage rate across loan costs.', category: 'Loan' },
  { id: 'fha-loan', title: 'FHA Loan Calculator', description: 'Estimate FHA mortgage affordability and payments.', category: 'Loan' },
  { id: 'va-mortgage', title: 'VA Mortgage Calculator', description: 'Estimate VA mortgage payments and affordability.', category: 'Loan' },
  { id: 'home-equity-loan', title: 'Home Equity Loan Calculator', description: 'Estimate payments against your home equity.', category: 'Loan' },
  { id: 'heloc', title: 'Home Equity Line of Credit (HELOC) Calculator', description: 'Estimate borrowing and repayment for a HELOC.', category: 'Loan' },
  { id: 'down-payment', title: 'Down Payment Calculator', description: 'Plan required down payment and upfront home costs.', category: 'Loan' },
  { id: 'rent-vs-buy', title: 'Rent vs. Buy Calculator', description: 'Compare long-term rent and homeownership costs.', category: 'Loan' },
  { id: 'auto-loan', title: 'Auto Loan Calculator', description: 'Auto loan payments & amortization.', category: 'Loan' },
  { id: 'cash-back-or-low-interest', title: 'Cash Back or Low Interest Calculator', description: 'Compare dealer cash offers with low-interest financing.', category: 'Loan' },
  { id: 'loan', title: 'Loan Calculator', description: 'Estimate monthly loan payments or payoff time with fixed term and fixed payment modes.', category: 'Loan' },
  { id: 'repayment', title: 'Repayment Calculator', description: 'Estimate monthly repayment amount or payoff time for a loan.', category: 'Loan' },
  { id: 'interest-rate', title: 'Interest Rate Calculator', description: 'Solve for the implied loan interest rate from payment, amount, and term.', category: 'Loan' },
  { id: 'personal-loan', title: 'Personal Loan', description: 'Personal loan planner.', category: 'Loan' },
  { id: 'investment', title: 'Investment Calculator', description: 'Project investment growth and solve for contribution, rate, starting amount, or length.', category: 'Investment' },
  { id: 'compound-interest', title: 'Compound Interest', description: 'Growth over time with compound interest.', category: 'Investment' },
  { id: 'pension', title: 'Pension Calculator', description: 'Compare lump sum versus monthly pension lifetime value.', category: 'Retirement' },
  { id: 'retirement', title: 'Retirement Calculator', description: 'Estimate retirement savings.', category: 'Retirement' },
  { id: 'savings', title: 'Savings Calculator', description: 'Plan savings goals.', category: 'Savings' },
  { id: 'income-tax', title: 'Income Tax Calculator', description: 'Estimate federal tax liability and credits.', category: 'Tax' },
  { id: 'estate-tax', title: 'Estate Tax Calculator', description: 'Estimate federal estate tax owed after deductions, gifts, and the current exemption.', category: 'Tax' },
  { id: 'currency', title: 'Currency Converter', description: 'Quick conversions.', category: 'Utility' },
  { id: 'college-cost', title: 'College Cost Calculator', description: 'Estimate future college cost and funding gap.', category: 'Education' },
  { id: 'inflation', title: 'Inflation Calculator', description: 'Adjust for inflation.', category: 'Investment' },
  { id: 'view-all', title: 'View All Calculators', description: 'Explore full list.', category: 'General' }
]

export const categories = Array.from(new Set(calculators.map(c => c.category)))

export const landingCalculatorColumns: LandingCalculatorLink[][] = [
  [
    { label: 'Mortgage', calculatorId: 'mortgage' },
    { label: 'Auto Loan', calculatorId: 'auto-loan' },
    { label: 'RePayment', calculatorId: 'repayment' },
    { label: 'Amortization', calculatorId: 'amortization' }
  ],
  [
    { label: 'Currency', calculatorId: 'currency' },
    { label: 'House Affordability', calculatorId: 'house-affordability' },
    { label: 'Income Tax', calculatorId: 'income-tax' },
    { label: 'Salary', calculatorId: 'salary' }
  ],
  [
    { label: 'Interest Rate', calculatorId: 'interest-rate' },
    { label: 'College Cost', calculatorId: 'college-cost' },
    { label: 'Student Loan', calculatorId: 'student-loan' },
    { label: 'Loan', calculatorId: 'loan' }
  ],
  [
    { label: 'Estate Tax', calculatorId: 'estate-tax' },
    { label: 'Pension', calculatorId: 'pension' },
    { label: 'Investment', calculatorId: 'investment' },
    { label: 'Inflation', calculatorId: 'inflation' }
  ],
  [
    { label: 'Mortgage Payoff', calculatorId: 'mortgage-payoff' },
    { label: 'Compound Interest', calculatorId: 'compound-interest' },
    { label: '401K', calculatorId: '401k' },
    { label: 'Sales Tax', calculatorId: 'sales-tax' }
  ]
]

export const financeMenuColumns: FinanceMenuColumn[] = [
  {
    title: 'Mortgage & Real Estate',
    items: [
      { label: 'Mortgage & Real Estate' },
      { label: 'Amortization Calculator', calculatorId: 'amortization' },
      { label: 'Mortgage Payoff Calculator', calculatorId: 'mortgage-payoff' },
      { label: 'House Affordability Calculator', calculatorId: 'house-affordability' },
      { label: 'Rent Calculator' },
      { label: 'Debt-to-Income (DTI) Ratio Calculator', calculatorId: 'dti-ratio' },
      { label: 'Real Estate Calculator' },
      { label: 'Refinance Calculator', calculatorId: 'refinance' },
      { label: 'Rental Property Calculator', calculatorId: 'rental-property' },
      { label: 'APR Calculator', calculatorId: 'apr' },
      { label: 'FHA Loan Calculator', calculatorId: 'fha-loan' },
      { label: 'VA Mortgage Calculator', calculatorId: 'va-mortgage' },
      { label: 'Home Equity Loan Calculator', calculatorId: 'home-equity-loan' },
      { label: 'Home Equity Line of Credit (HELOC) Calculator', calculatorId: 'heloc' },
      { label: 'Down Payment Calculator', calculatorId: 'down-payment' },
      { label: 'Rent vs. Buy Calculator', calculatorId: 'rent-vs-buy' }
    ]
  },
  {
    title: 'Auto',
    sections: [
      {
        title: 'Auto',
        items: [
          { label: 'Auto Loan Calculator', calculatorId: 'auto-loan' },
          { label: 'Cash Back or Low Interest Calculator', calculatorId: 'cash-back-or-low-interest' },
          { label: 'Auto Lease Calculator' }
        ]
      },
      {
        title: 'Tax and Salary',
        items: [
          { label: 'Income Tax Calculator', calculatorId: 'income-tax' },
          { label: 'Salary Calculator', calculatorId: 'salary' },
          { label: 'Marriage Tax Calculator' },
          { label: 'Estate Tax Calculator' },
          { label: 'Take-Home-Paycheck Calculator' }
        ]
      }
    ]
  },
  {
    title: 'Investment',
    items: [
      { label: 'Interest Calculator' },
      { label: 'Investment Calculator', calculatorId: 'investment' },
      { label: 'Finance Calculator' },
      { label: 'Compound Interest Calculator', calculatorId: 'compound-interest' },
      { label: 'Interest Rate Calculator', calculatorId: 'interest-rate' },
      { label: 'Savings Calculator' },
      { label: 'Simple Interest Calculator' },
      { label: 'CD Calculator' },
      { label: 'Bond Calculator' },
      { label: 'Average Return Calculator' },
      { label: 'IRR Calculator' },
      { label: 'ROI Calculator' },
      { label: 'Payback Period Calculator' },
      { label: 'Present Value Calculator' },
      { label: 'Future Value Calculator' }
    ]
  },
  {
    title: 'Retirement',
    items: [
      { label: 'Retirement Calculator' },
      { label: '401K Calculator', calculatorId: '401k' },
      { label: 'Pension Calculator', calculatorId: 'pension' },
      { label: 'Social Security Calculator' },
      { label: 'Annuity Calculator' },
      { label: 'Annuity Payout Calculator' },
      { label: 'Roth IRA Calculator' },
      { label: 'IRA Calculator' },
      { label: 'RMD Calculator' }
    ]
  },
  {
    title: 'Other',
    items: [
      { label: 'Loan Calculator', calculatorId: 'loan' },
      { label: 'Payment Calculator' },
      { label: 'Currency Calculator', calculatorId: 'currency' },
      { label: 'Inflation Calculator', calculatorId: 'inflation' },
      { label: 'Sales Tax Calculator' },
      { label: 'Credit Card Calculator' },
      { label: 'Credit Cards Payoff Calculator' },
      { label: 'Debt Payoff Calculator' },
      { label: 'Debt Consolidation Calculator' },
      { label: 'Repayment Calculator', calculatorId: 'repayment' },
      { label: 'Student Loan Calculator', calculatorId: 'student-loan' },
      { label: 'College Cost Calculator', calculatorId: 'college-cost' },
      { label: 'VAT Calculator' },
      { label: 'Depreciation Calculator' },
      { label: 'Margin Calculator' },
      { label: 'Discount Calculator' },
      { label: 'Business Loan Calculator' },
      { label: 'Personal Loan Calculator' },
      { label: 'Boat Loan Calculator' },
      { label: 'Lease Calculator' },
      { label: 'Budget Calculator' },
      { label: 'Commission Calculator' }
    ]
  }
]
