import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User, { type IUser, type UserRole } from '../models/User'
import { env } from '../config/env'

const TOKEN_EXPIRY = '7d'
const SALT_ROUNDS = 10

type AdminSeedAccount = {
  name: string
  email: string
  password: string
  role: UserRole
}

const getAdminSeedAccount = (): AdminSeedAccount | null => {
  const email = process.env.ADMIN_SEED_EMAIL?.trim()
  const password = process.env.ADMIN_SEED_PASSWORD?.trim()
  const name = process.env.ADMIN_SEED_NAME?.trim() || 'Admin'

  if (!email || !password) {
    return null
  }

  return {
    name,
    email,
    password,
    role: 'admin'
  }
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
  jwt.sign(payload, env.authSecret, { expiresIn: TOKEN_EXPIRY })

export const verifyAuthToken = (token: string): AuthTokenPayload =>
  jwt.verify(token, env.authSecret) as AuthTokenPayload

export const toPublicUser = (user: PublicUserInput | Pick<IUser, '_id' | 'name' | 'email' | 'role'>): PublicUser => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role
})

export async function ensureAdminUser(): Promise<void> {
  const adminAccount = getAdminSeedAccount()

  if (!adminAccount) {
    console.warn('Admin seed skipped: ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD are not set')
    return
  }

  const passwordHash = await hashPassword(adminAccount.password)

  await User.findOneAndUpdate(
    { email: adminAccount.email },
    {
      $set: {
        name: adminAccount.name,
        email: adminAccount.email,
        passwordHash,
        role: adminAccount.role
      }
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  )
}
