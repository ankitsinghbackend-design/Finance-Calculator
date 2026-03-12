import { Request, Response } from 'express'
import { z } from 'zod'
import User from '../models/User'
import {
  comparePassword,
  createAuthToken,
  hashPassword,
  toPublicUser,
  type PublicUser
} from '../services/auth.service'
import { type AuthenticatedRequest } from '../middleware/auth'

type LeanPublicUser = {
  _id: unknown
  name: string
  email: string
  role: 'user' | 'admin'
}

const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address').max(320, 'Email is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/(?=.*[A-Z])/, 'Password must include at least one uppercase letter')
    .regex(/(?=.*[a-z])/, 'Password must include at least one lowercase letter')
    .regex(/(?=.*\d)/, 'Password must include at least one number')
    .regex(/(?=.*[^A-Za-z0-9])/, 'Password must include at least one special character')
})

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required')
})

const sendAuthSuccess = (res: Response, user: PublicUser): void => {
  const token = createAuthToken({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  })

  res.status(200).json({ token, user })
}

export async function signup(req: Request, res: Response): Promise<void> {
  const parsed = signupSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid signup details',
      fieldErrors: parsed.error.flatten().fieldErrors
    })
    return
  }

  try {
    const existingUser = await User.findOne({ email: parsed.data.email.toLowerCase() }).select('_id').lean()
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists.' })
      return
    }

    const user = await User.create({
      name: parsed.data.name.trim(),
      email: parsed.data.email.trim().toLowerCase(),
      passwordHash: await hashPassword(parsed.data.password),
      role: 'user'
    })

    sendAuthSuccess(res, toPublicUser(user))
  } catch (error) {
    console.error('Signup failed:', error)
    res.status(500).json({ error: 'Failed to create account.' })
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid login details',
      fieldErrors: parsed.error.flatten().fieldErrors
    })
    return
  }

  try {
    const user = await User.findOne({ email: parsed.data.email.trim().toLowerCase() })

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' })
      return
    }

    const passwordMatches = await comparePassword(parsed.data.password, user.passwordHash)

    if (!passwordMatches) {
      res.status(401).json({ error: 'Invalid email or password.' })
      return
    }

    sendAuthSuccess(res, toPublicUser(user))
  } catch (error) {
    console.error('Login failed:', error)
    res.status(500).json({ error: 'Failed to login.' })
  }
}

export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  const authReq = req as AuthenticatedRequest

  if (!authReq.authUser) {
    res.status(401).json({ error: 'Please login to continue.' })
    return
  }

  try {
    const user = await User.findById(authReq.authUser.sub)
      .select('_id name email role')
      .lean<LeanPublicUser | null>()

    if (!user) {
      res.status(401).json({ error: 'Your session is no longer valid. Please login again.' })
      return
    }

    res.status(200).json({ user: toPublicUser(user) })
  } catch (error) {
    console.error('Failed to fetch current user:', error)
    res.status(500).json({ error: 'Failed to fetch user.' })
  }
}
