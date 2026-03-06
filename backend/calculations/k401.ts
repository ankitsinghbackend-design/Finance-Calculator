import { z } from 'zod'

export const schema = z.object({
  currentAge: z.number().int().min(0),
  retirementAge: z.number().int().positive(),
  currentSalary: z.number().nonnegative(),
  salaryIncrease: z.number().min(0),
  currentBalance: z.number().nonnegative(),
  contributionPercent: z.number().min(0),
  employerMatchPercent: z.number().min(0),
  employerMatchLimit: z.number().min(0),
  expectedReturn: z.number().min(0),
  inflationRate: z.number().min(0),
  lifeExpectancy: z.number().int().positive()
})

export type K401Inputs = z.infer<typeof schema>

export interface K401Results {
  retirementBalance: number
  totalEmployeeContribution: number
  totalEmployerContribution: number
  totalContribution: number
  investmentGrowth: number
  monthlyIncome: number
  inflationAdjustedBalance: number
}

const round2 = (v: number): number => Math.round((v + Number.EPSILON) * 100) / 100

export function calculate(inputs: K401Inputs): K401Results {
  const {
    currentAge,
    retirementAge,
    currentSalary,
    salaryIncrease,
    currentBalance,
    contributionPercent,
    employerMatchPercent,
    employerMatchLimit,
    expectedReturn,
    inflationRate,
    lifeExpectancy
  } = inputs

  let balance = currentBalance
  let salary = currentSalary

  let totalEmployeeContribution = 0
  let totalEmployerContribution = 0

  const yearsToRetirement = Math.max(0, retirementAge - currentAge)

  for (let i = 0; i < yearsToRetirement; i++) {
    const employeeContribution = salary * (contributionPercent / 100)

    const employerMatch =
      Math.min(employeeContribution, salary * (employerMatchLimit / 100)) * (employerMatchPercent / 100)

    const yearlyContribution = employeeContribution + employerMatch

    totalEmployeeContribution += employeeContribution
    totalEmployerContribution += employerMatch

    balance = balance * (1 + expectedReturn / 100) + yearlyContribution

    salary = salary * (1 + salaryIncrease / 100)
  }

  const totalContribution = totalEmployeeContribution + totalEmployerContribution

  const investmentGrowth = balance - totalContribution - currentBalance

  const retirementYears = Math.max(1, lifeExpectancy - retirementAge)

  const monthlyIncome = (balance / retirementYears) / 12

  const inflationAdjustedBalance =
    balance / Math.pow(1 + inflationRate / 100, yearsToRetirement)

  return {
    retirementBalance: round2(balance),
    totalEmployeeContribution: round2(totalEmployeeContribution),
    totalEmployerContribution: round2(totalEmployerContribution),
    totalContribution: round2(totalContribution),
    investmentGrowth: round2(investmentGrowth),
    monthlyIncome: round2(monthlyIncome),
    inflationAdjustedBalance: round2(inflationAdjustedBalance)
  }
}
