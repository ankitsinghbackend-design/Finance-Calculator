import { Router } from 'express'
import { calculateHandler } from '../controllers/calculator.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.post('/api/calculators/:calculatorId', requireAuth, calculateHandler)

export default router
