import { z } from 'zod'

export const schema = z.object({
  salaryAmount: z.number().nonnegative(),
  hoursPerWeek: z.number().positive().default(40),
  daysPerWeek: z.number().positive().default(5),
  holidaysPerYear: z.number().min(0).default(0),
  vacationDaysPerYear: z.number().min(0).default(0)
})

export type SalaryInputs = z.infer<typeof schema>

export interface SalaryResults {
  yearlySalary: number
  monthlySalary: number
  weeklySalary: number
  dailySalary: number
  hourlySalary: number
  adjustedYearlySalary: number
  adjustedMonthlySalary: number
  adjustedWeeklySalary: number
  adjustedDailySalary: number
  adjustedHourlySalary: number
}

const round2 = (v: number): number => Math.round((v + Number.EPSILON) * 100) / 100

export function calculate(inputs: SalaryInputs): SalaryResults {
  const {
    salaryAmount,
    hoursPerWeek = 40,
    daysPerWeek = 5,
    holidaysPerYear = 0,
    vacationDaysPerYear = 0
  } = inputs

  const WEEKS_PER_YEAR = 52

  const yearlySalary = salaryAmount
  const monthlySalary = yearlySalary / 12
  const weeklySalary = yearlySalary / WEEKS_PER_YEAR
  const dailySalary = weeklySalary / daysPerWeek
  const hourlySalary = weeklySalary / hoursPerWeek

  const totalDaysOff = holidaysPerYear + vacationDaysPerYear
  const workDaysPerYear = WEEKS_PER_YEAR * daysPerWeek - totalDaysOff

  const adjustedYearlySalary = dailySalary * workDaysPerYear
  const adjustedMonthlySalary = adjustedYearlySalary / 12
  const adjustedWeeklySalary = adjustedYearlySalary / WEEKS_PER_YEAR
  const adjustedDailySalary = adjustedWeeklySalary / daysPerWeek
  const adjustedHourlySalary = adjustedWeeklySalary / hoursPerWeek

  return {
    yearlySalary: round2(yearlySalary),
    monthlySalary: round2(monthlySalary),
    weeklySalary: round2(weeklySalary),
    dailySalary: round2(dailySalary),
    hourlySalary: round2(hourlySalary),
    adjustedYearlySalary: round2(adjustedYearlySalary),
    adjustedMonthlySalary: round2(adjustedMonthlySalary),
    adjustedWeeklySalary: round2(adjustedWeeklySalary),
    adjustedDailySalary: round2(adjustedDailySalary),
    adjustedHourlySalary: round2(adjustedHourlySalary)
  }
}
