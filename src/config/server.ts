export const DATABASE_URL = import.meta.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required')
}

export const REDIS_URL = import.meta.env.REDIS_URL || 'redis://localhost:6379'

if (!REDIS_URL) {
  throw new Error('REDIS_URL is required')
}
