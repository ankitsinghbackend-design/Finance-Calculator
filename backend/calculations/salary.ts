import { z } from 'zod'

export const schema = z.object({
  salaryAmount: z.number().nonnegative(),

  hoursPerWeek: z
    .number()
    .min(1)
    .max(168)
    .default(40),

  daysPerWeek: z
    .number()
    .min(1)
    .max(7) 
    .default(5),

  holidaysPerYear: z
    .number()
    .min(0)
    .max(365)
    .default(0),

  vacationDaysPerYear: z
    .number()
    .min(0)
    .max(365)
    .default(0)
}).refine(
  (data) => data.holidaysPerYear + data.vacationDaysPerYear <= data.daysPerWeek * 52,
  {
    message: 'Total days off cannot exceed working days in a year',
    path: ['vacationDaysPerYear']
  }
)

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
  const adjustedDailySalary = workDaysPerYear > 0 ? adjustedYearlySalary / workDaysPerYear : 0
  const adjustedWeeklySalary = adjustedDailySalary * daysPerWeek
  const adjustedHourlySalary = adjustedDailySalary * (daysPerWeek / hoursPerWeek)

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
