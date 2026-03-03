export type CalculatorItem = {
  id: string
  title: string
  description?: string
  category: string
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
