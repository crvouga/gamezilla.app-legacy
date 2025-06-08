import { SecretString } from '~/@/secrets/secret-string'

const DATABASE_URL = () => SecretString.of('DATABASE_URL', import.meta.env?.DATABASE_URL)

const DEFAULT_PORT = 5002

const PORT = isNaN(Number(import.meta.env?.PORT)) ? DEFAULT_PORT : Number(import.meta.env?.PORT)

export const CONFIG_BACKEND = {
  PORT,
  DATABASE_URL,
}
