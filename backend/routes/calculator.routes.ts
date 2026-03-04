import { Router } from 'express'
import { calculateHandler } from '../controllers/calculator.controller'

const router = Router()

router.post('/api/calculators/:calculatorId', calculateHandler)

export default router
