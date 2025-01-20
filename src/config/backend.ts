import { SecretString } from '~/@/secrets/secret-string'

const DATABASE_URL = SecretString.of('DATABASE_URL', import.meta.env?.DATABASE_URL)

const REDIS_URL = SecretString.of('REDIS_URL', import.meta.env?.REDIS_URL)

const PORT: number = Number(import.meta.env?.PORT)

const SERVER_PORT = isNaN(PORT) ? null : PORT

export const CONFIG_BACKEND = {
  SERVER_PORT,
  DATABASE_URL,
  REDIS_URL,
}
