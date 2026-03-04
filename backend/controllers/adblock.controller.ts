import crypto from 'node:crypto'
import { Request, Response } from 'express'
import { z } from 'zod'
import { logAdblock } from '../services/adblock.service'

const adblockLogSchema = z.object({
  location: z.string().trim().min(1).max(120),
  url: z.string().trim().url().max(2048),
  userAgent: z.string().trim().max(512).optional(),
  detected: z.boolean(),
  details: z.record(z.unknown()).optional().default({}),
  ts: z.coerce.date().optional()
})

const hashSource = (source: string): string => {
  const salt = process.env.ADBLOCK_IP_HASH_SALT ?? 'adblock-default-salt'
  return crypto.createHash('sha256').update(`${salt}:${source}`).digest('hex')
}

const getSourceHint = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for']
  const firstForwarded = Array.isArray(forwarded)
    ? forwarded[0]
    : typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : ''

  return firstForwarded || req.ip || 'unknown'
}

export const postAdblockLog = async (req: Request, res: Response): Promise<void> => {
  const result = adblockLogSchema.safeParse(req.body)

  if (!result.success) {
    res.status(400).json({
      error: 'Invalid adblock log payload',
      issues: result.error.issues
    })
    return
  }

  const payload = result.data

  await logAdblock({
    location: payload.location,
    url: payload.url,
    userAgent: payload.userAgent ?? req.get('user-agent') ?? 'unknown',
    detected: payload.detected,
    details: {
      ...payload.details,
      sourceHash: hashSource(getSourceHint(req))
    },
    ts: payload.ts ?? new Date()
  })

  res.status(204).send()
}
