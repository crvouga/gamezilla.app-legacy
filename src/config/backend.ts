const DATABASE_URL = import.meta.env?.DATABASE_URL

const REDIS_URL = import.meta.env?.REDIS_URL || 'redis://localhost:6379'

const PORT = import.meta.env?.PORT

const SERVER_PORT = isNaN(PORT) ? null : PORT

export const CONFIG_BACKEND = {
  SERVER_PORT,
  DATABASE_URL,
  REDIS_URL,
}
