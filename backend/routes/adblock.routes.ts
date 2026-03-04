import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { postAdblockLog } from '../controllers/adblock.controller'

const router = Router()

const adblockLogLimiter = rateLimit({
  windowMs: Number(process.env.ADBLOCK_RATE_LIMIT_WINDOW_MS ?? 60_000),
  max: Number(process.env.ADBLOCK_RATE_LIMIT_MAX ?? 120),
  standardHeaders: true,
  legacyHeaders: false
})

router.post('/api/log/adblock', adblockLogLimiter, postAdblockLog)

export default router
