import { Request, Response } from 'express'
import { z } from 'zod'
import Feedback from '../models/Feedback'

const feedbackSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address').max(320, 'Email is too long'),
  message: z.string().trim().min(1, 'Message is required').max(2000, 'Message is too long'),
  rating: z.number().int().min(1, 'Rating is required').max(5, 'Rating must be between 1 and 5')
})

export async function createFeedback(req: Request, res: Response): Promise<void> {
  const parsed = feedbackSchema.safeParse(req.body)

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors

    res.status(400).json({
      error: 'Invalid feedback submission',
      fieldErrors: {
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        message: fieldErrors.message?.[0],
        rating: fieldErrors.rating?.[0]
      }
    })
    return
  }

  try {
    const feedback = await Feedback.create(parsed.data)

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    })
  } catch (error) {
    console.error('Error creating feedback:', error)
    res.status(500).json({ error: 'Failed to save feedback' })
  }
}
