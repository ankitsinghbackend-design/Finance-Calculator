import { z } from 'zod'

export const statusColorSchema = z.enum(['green', 'yellow', 'red'])
export const statusSchema = z.enum(['Safe', 'Acceptable', 'Aggressive'])

export const schema = z.object({
  salaryIncome: z.number().min(0, 'Salary income cannot be negative.'),
  pensionIncome: z.number().min(0, 'Pension income cannot be negative.'),
  investmentIncome: z.number().min(0, 'Investment income cannot be negative.'),
  otherIncome: z.number().min(0, 'Other income cannot be negative.'),
  rentalCost: z.number().min(0, 'Rental cost cannot be negative.'),
  mortgage: z.number().min(0, 'Mortgage cannot be negative.'),
  propertyTax: z.number().min(0, 'Property tax cannot be negative.'),
  hoaFees: z.number().min(0, 'HOA fees cannot be negative.'),
  homeownerInsurance: z.number().min(0, 'Homeowner insurance cannot be negative.'),
  studentLoan: z.number().min(0, 'Student loan cannot be negative.'),
  autoLoan: z.number().min(0, 'Auto loan cannot be negative.'),
  otherLiabilities: z.number().min(0, 'Other liabilities cannot be negative.')
})

export type DebtToIncomeInputs = z.infer<typeof schema>

export type DebtToIncomeResults = {
  totalMonthlyIncome: number
  totalMonthlyDebt: number
  dtiRatio: number
  status: z.infer<typeof statusSchema>
  statusColor: z.infer<typeof statusColorSchema>
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

function getStatus(dtiRatio: number): Pick<DebtToIncomeResults, 'status' | 'statusColor'> {
  if (dtiRatio <= 36) {
    return { status: 'Safe', statusColor: 'green' }
  }

  if (dtiRatio <= 43) {
    return { status: 'Acceptable', statusColor: 'yellow' }
  }

  return { status: 'Aggressive', statusColor: 'red' }
}

export function calculate(inputs: DebtToIncomeInputs): DebtToIncomeResults {
  const totalAnnualIncome =
    inputs.salaryIncome +
    inputs.pensionIncome +
    inputs.investmentIncome +
    inputs.otherIncome

  const totalAnnualDebt =
    inputs.rentalCost +
    inputs.mortgage +
    inputs.propertyTax +
    inputs.hoaFees +
    inputs.homeownerInsurance +
    inputs.studentLoan +
    inputs.autoLoan +
    inputs.otherLiabilities

  const totalMonthlyIncome = totalAnnualIncome / 12
  const totalMonthlyDebt = totalAnnualDebt / 12

  if (totalMonthlyIncome <= 0) {
    throw new Error('Total monthly income must be greater than 0 to calculate the DTI ratio.')
  }

  const dtiRatio = (totalMonthlyDebt / totalMonthlyIncome) * 100
  const statusDetails = getStatus(dtiRatio)

  return {
    totalMonthlyIncome: round2(totalMonthlyIncome),
    totalMonthlyDebt: round2(totalMonthlyDebt),
    dtiRatio: round2(dtiRatio),
    status: statusDetails.status,
    statusColor: statusDetails.statusColor
  }
}