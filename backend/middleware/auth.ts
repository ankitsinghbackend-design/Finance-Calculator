import { NextFunction, Request, Response } from 'express'
import User, { type UserRole } from '../models/User'
import { verifyAuthToken, type AuthTokenPayload } from '../services/auth.service'

type LeanAuthUser = {
  _id: unknown
  role: UserRole
  name: string
  email: string
}

export type AuthenticatedRequest = Request & {
  authUser?: AuthTokenPayload
}

const getBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) {
    return null
  }

  const [scheme, token] = authorizationHeader.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return null
  }

  return token
}

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthenticatedRequest
  const token = getBearerToken(req.headers.authorization)

  if (!token) {
    next()
    return
  }

  try {
    authReq.authUser = verifyAuthToken(token)
  } catch {
    authReq.authUser = undefined
  }

  next()
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authReq = req as AuthenticatedRequest
  const token = getBearerToken(req.headers.authorization)

  if (!token) {
    res.status(401).json({ error: 'Please login to continue.' })
    return
  }

  try {
    const payload = verifyAuthToken(token)
    const user = await User.findById(payload.sub)
      .select('_id role name email')
      .lean<LeanAuthUser | null>()

    if (!user) {
      res.status(401).json({ error: 'Your session is no longer valid. Please login again.' })
      return
    }

    authReq.authUser = {
      sub: String(user._id),
      role: user.role,
      name: user.name,
      email: user.email
    }

    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired session. Please login again.' })
  }
}

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest

    if (!authReq.authUser) {
      res.status(401).json({ error: 'Please login to continue.' })
      return
    }

    if (!roles.includes(authReq.authUser.role)) {
      res.status(403).json({ error: 'You do not have permission to perform this action.' })
      return
    }

    next()
  }
}
