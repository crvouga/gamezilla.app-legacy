export const DATABASE_URL = import.meta.env?.DATABASE_URL

export const REDIS_URL = import.meta.env?.REDIS_URL || 'redis://localhost:6379'

const PORT = import.meta.env?.PORT

export const SERVER_PORT = isNaN(PORT) ? null : PORT
