import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User, { type IUser, type UserRole } from '../models/User'

const AUTH_SECRET = process.env.AUTH_SECRET || 'finance-calculator-dev-secret'
const TOKEN_EXPIRY = '7d'
const SALT_ROUNDS = 10

const ADMIN_ACCOUNT = {
  name: 'Purple_Admin',
  email: 'admin@purple.com',
  password: 'Admin123@purple',
  role: 'admin' as const
}

export type AuthTokenPayload = {
  sub: string
  name: string
  email: string
  role: UserRole
}

export type PublicUser = {
  id: string
  name: string
  email: string
  role: UserRole
}

type PublicUserInput = {
  _id: unknown
  name: string
  email: string
  role: UserRole
}

export const hashPassword = async (password: string): Promise<string> => bcrypt.hash(password, SALT_ROUNDS)

export const comparePassword = async (password: string, passwordHash: string): Promise<boolean> =>
  bcrypt.compare(password, passwordHash)

export const createAuthToken = (payload: AuthTokenPayload): string =>
  jwt.sign(payload, AUTH_SECRET, { expiresIn: TOKEN_EXPIRY })

export const verifyAuthToken = (token: string): AuthTokenPayload =>
  jwt.verify(token, AUTH_SECRET) as AuthTokenPayload

export const toPublicUser = (user: PublicUserInput | Pick<IUser, '_id' | 'name' | 'email' | 'role'>): PublicUser => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role
})

export async function ensureAdminUser(): Promise<void> {
  const passwordHash = await hashPassword(ADMIN_ACCOUNT.password)

  await User.findOneAndUpdate(
    { email: ADMIN_ACCOUNT.email },
    {
      $set: {
        name: ADMIN_ACCOUNT.name,
        email: ADMIN_ACCOUNT.email,
        passwordHash,
        role: ADMIN_ACCOUNT.role
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  )
}
