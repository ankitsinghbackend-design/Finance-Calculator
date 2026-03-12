import { Router } from 'express'
import { createFeedback } from '../controllers/feedback.controller'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.post('/', requireAuth, createFeedback)

export default router
