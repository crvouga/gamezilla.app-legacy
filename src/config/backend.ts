import { SecretString } from '~/@/secrets/secret-string'

const DATABASE_URL = () => SecretString.of('DATABASE_URL', import.meta.env?.DATABASE_URL)

const PORT = isNaN(Number(import.meta.env?.PORT)) ? null : Number(import.meta.env?.PORT)

export const CONFIG_BACKEND = {
  PORT,
  DATABASE_URL,
}
