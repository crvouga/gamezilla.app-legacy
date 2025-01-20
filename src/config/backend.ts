const DATABASE_URL: unknown = import.meta.env?.DATABASE_URL

const REDIS_URL: unknown = import.meta.env?.REDIS_URL

const PORT: number = Number(import.meta.env?.PORT)

const SERVER_PORT = isNaN(PORT) ? null : PORT

export const CONFIG_BACKEND = {
  SERVER_PORT,
  DATABASE_URL,
  REDIS_URL,
}

console.log(CONFIG_BACKEND)
