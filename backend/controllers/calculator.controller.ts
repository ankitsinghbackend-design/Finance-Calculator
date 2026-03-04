import { Request, Response } from 'express'
import { ZodError } from 'zod'
import { calculatorRegistry, CalculatorModule } from '../calculations'
import { getLocationFromIp, logCalculatorUsage } from '../services/analytics.service'

const getSourceIp = (req: Request): string | undefined => {
  const forwardedFor = req.headers['x-forwarded-for']
  const forwardedIp =
    Array.isArray(forwardedFor) && forwardedFor.length > 0
      ? forwardedFor[0]
      : typeof forwardedFor === 'string'
        ? forwardedFor.split(',')[0].trim()
        : undefined

  const directIp = req.ip?.replace(/^::ffff:/, '').trim()
  const ip = forwardedIp ?? directIp

  return ip || undefined
}

const toRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return { value }
}

/**
 * POST /api/calculators/:calculatorId
 * Validates request body against calculator schema and returns computed results.
 */
export async function calculateHandler(req: Request, res: Response): Promise<void> {
  const calculatorIdParam = req.params.calculatorId
  const calculatorId = Array.isArray(calculatorIdParam) ? calculatorIdParam[0] : calculatorIdParam
  const calculatorModule = calculatorRegistry[calculatorId as keyof typeof calculatorRegistry] as CalculatorModule | undefined

  if (!calculatorModule) {
    res.status(404).json({ error: 'Calculator not found' })
    return
  }

  try {
    const payload = req.body as { inputs?: unknown }
    const rawInputs = payload?.inputs ?? req.body
    const validatedInputs = calculatorModule.schema.parse(rawInputs)
    const results = calculatorModule.calculate(validatedInputs)

    try {
      const location = await getLocationFromIp(getSourceIp(req))

      await logCalculatorUsage({
        calculatorId,
        location,
        inputs: toRecord(validatedInputs),
        results: toRecord(results)
      })
    } catch (analyticsError) {
      console.error('Failed to log calculator usage:', analyticsError)
    }

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
