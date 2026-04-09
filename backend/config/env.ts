type RequiredEnvName = 'MONGODB_URI' | 'AUTH_SECRET' | 'CORS_ALLOWED_ORIGINS'

const getRequiredEnv = (name: RequiredEnvName): string => {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const parseAllowedCorsOrigins = (): string[] => {
  const rawOrigins = getRequiredEnv('CORS_ALLOWED_ORIGINS')
  const origins = rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (origins.length === 0) {
    throw new Error('CORS_ALLOWED_ORIGINS must contain at least one origin')
  }

  for (const origin of origins) {
    try {
      const parsed = new URL(origin)
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol')
      }
    } catch {
      throw new Error(`Invalid CORS origin in CORS_ALLOWED_ORIGINS: ${origin}`)
    }
  }

  return Array.from(new Set(origins))
}

const parseAuthSecret = (): string => {
  const authSecret = getRequiredEnv('AUTH_SECRET')

  if (authSecret.length < 32) {
    throw new Error('AUTH_SECRET must be at least 32 characters long')
  }

  if (['finance-calculator-dev-secret', 'changeme', 'change-me'].includes(authSecret.toLowerCase())) {
    throw new Error('AUTH_SECRET is too weak. Use a long random secret value')
  }

  return authSecret
}

const parsePort = (): number => {
  const rawPort = process.env.PORT?.trim() || '5000'
  const parsedPort = Number(rawPort)

  if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
    throw new Error('PORT must be a positive integer')
  }

  return parsedPort
}

export const env = {
  mongoUri: getRequiredEnv('MONGODB_URI'),
  authSecret: parseAuthSecret(),
  siteUrl: (process.env.SITE_URL || 'https://fincalco.com').replace(/\/$/, ''),
  corsAllowedOrigins: parseAllowedCorsOrigins(),
  port: parsePort(),
  shouldSeedAdminOnStart: process.env.ADMIN_SEED_ON_START === 'true'
}
