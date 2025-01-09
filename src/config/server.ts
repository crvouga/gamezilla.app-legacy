import { env } from './env'

export const DATABASE_URL = env.DATABASE_URL ?? ''

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required')
}

export const REDIS_URL = env.REDIS_URL ?? 'redis://localhost:6379'

if (!REDIS_URL) {
  throw new Error('REDIS_URL is required')
}

export const SERVER_PORT = parseInt(env?.PORT ?? '')

if (isNaN(SERVER_PORT)) {
  throw new Error('PORT is required and must be a number')
}
