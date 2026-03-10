import { z } from 'zod'

const optionalNumber = z.union([z.number(), z.null()]).optional()

export const schema = z
  .object({
    beforeTaxPrice: optionalNumber,
    salesTaxRate: optionalNumber,
    afterTaxPrice: optionalNumber
  })
  .superRefine((value, ctx) => {
    const entries = [value.beforeTaxPrice, value.salesTaxRate, value.afterTaxPrice]
    const providedCount = entries.filter((entry) => entry != null).length

    if (providedCount < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['beforeTaxPrice'],
        message: 'Please provide any two values to calculate the third.'
      })
      return
    }

    if (value.beforeTaxPrice != null && value.beforeTaxPrice < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['beforeTaxPrice'],
        message: 'Before-tax price cannot be negative.'
      })
    }

    if (value.salesTaxRate != null && value.salesTaxRate < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['salesTaxRate'],
        message: 'Sales tax rate cannot be negative.'
      })
    }

    if (value.afterTaxPrice != null && value.afterTaxPrice < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['afterTaxPrice'],
        message: 'After-tax price cannot be negative.'
      })
    }

    if (value.salesTaxRate == null && value.beforeTaxPrice === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['beforeTaxPrice'],
        message: 'Before-tax price must be greater than 0 when solving for sales tax rate.'
      })
    }

    if (value.beforeTaxPrice != null && value.afterTaxPrice != null && value.afterTaxPrice < value.beforeTaxPrice) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['afterTaxPrice'],
        message: 'After-tax price must be greater than or equal to the before-tax price.'
      })
    }

    if (value.beforeTaxPrice != null && value.salesTaxRate != null && value.afterTaxPrice != null) {
      const expectedAfterTax = value.beforeTaxPrice * (1 + value.salesTaxRate / 100)
      const difference = Math.abs(expectedAfterTax - value.afterTaxPrice)

      if (difference > 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['afterTaxPrice'],
          message: 'Provided values do not match the sales tax formula.'
        })
      }
    }
  })

export type SalesTaxInputs = z.infer<typeof schema>

export type SalesTaxResults = {
  beforeTaxPrice: number
  afterTaxPrice: number
  salesTaxRate: number
  salesTaxAmount: number
}

const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

export function calculate(inputs: SalesTaxInputs): SalesTaxResults {
  const beforeTaxPrice = inputs.beforeTaxPrice
  const salesTaxRate = inputs.salesTaxRate
  const afterTaxPrice = inputs.afterTaxPrice

  if (beforeTaxPrice != null && salesTaxRate != null) {
    const solvedAfterTaxPrice = beforeTaxPrice * (1 + salesTaxRate / 100)
    const salesTaxAmount = solvedAfterTaxPrice - beforeTaxPrice

    return {
      beforeTaxPrice: round2(beforeTaxPrice),
      afterTaxPrice: round2(solvedAfterTaxPrice),
      salesTaxRate: round2(salesTaxRate),
      salesTaxAmount: round2(salesTaxAmount)
    }
  }

  if (afterTaxPrice != null && salesTaxRate != null) {
    const solvedBeforeTaxPrice = afterTaxPrice / (1 + salesTaxRate / 100)
    const salesTaxAmount = afterTaxPrice - solvedBeforeTaxPrice

    return {
      beforeTaxPrice: round2(solvedBeforeTaxPrice),
      afterTaxPrice: round2(afterTaxPrice),
      salesTaxRate: round2(salesTaxRate),
      salesTaxAmount: round2(salesTaxAmount)
    }
  }

  if (beforeTaxPrice == null || afterTaxPrice == null || beforeTaxPrice === 0) {
    throw new Error('Please provide a valid before-tax price and after-tax price to solve for the tax rate.')
  }

  const solvedSalesTaxRate = ((afterTaxPrice / beforeTaxPrice) - 1) * 100
  const salesTaxAmount = afterTaxPrice - beforeTaxPrice

  return {
    beforeTaxPrice: round2(beforeTaxPrice),
    afterTaxPrice: round2(afterTaxPrice),
    salesTaxRate: round2(solvedSalesTaxRate),
    salesTaxAmount: round2(salesTaxAmount)
  }
}