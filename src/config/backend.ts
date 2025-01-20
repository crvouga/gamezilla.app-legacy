import { SecretString } from '~/@/secrets/secret-string'

const DATABASE_URL = SecretString('DATABASE_URL', import.meta.env?.DATABASE_URL)

const REDIS_URL = SecretString('REDIS_URL', import.meta.env?.REDIS_URL)

const PORT: number = Number(import.meta.env?.PORT)

const SERVER_PORT = isNaN(PORT) ? null : PORT

export const CONFIG_BACKEND = {
  SERVER_PORT,
  DATABASE_URL,
  REDIS_URL,
}
