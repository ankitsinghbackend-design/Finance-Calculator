import { Request, Response } from 'express'
import { ZodError } from 'zod'
import { calculatorRegistry, CalculatorModule } from '../calculations'

/**
 * POST /api/calculators/:calculatorId
 * Validates request body against calculator schema and returns computed results.
 */
export async function calculateHandler(req: Request, res: Response): Promise<void> {
  const calculatorId = req.params.calculatorId
  const calculatorModule = calculatorRegistry[calculatorId as keyof typeof calculatorRegistry] as CalculatorModule | undefined

  if (!calculatorModule) {
    res.status(404).json({ error: 'Calculator not found' })
    return
  }

  try {
    const validatedInputs = calculatorModule.schema.parse(req.body)
    const results = calculatorModule.calculate(validatedInputs)

    res.status(200).json({ results })
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Invalid inputs',
        issues: error.issues
      })
      return
    }

    res.status(500).json({ error: 'Calculation failed' })
  }
}
