import { unwrap } from '~/@/result'
import { SecretString } from '~/@/secrets/secret-string'

const DATABASE_URL = () => unwrap(SecretString.init('DATABASE_URL', import.meta.env?.DATABASE_URL))

const POWERSYNC_PRIVATE_KEY = unwrap(SecretString.init('POWERSYNC_PRIVATE_KEY', import.meta.env?.POWERSYNC_PRIVATE_KEY))

const POWERSYNC_PUBLIC_KEY = import.meta.env?.POWERSYNC_PUBLIC_KEY

if (!POWERSYNC_PUBLIC_KEY) {
  throw new Error('POWERSYNC_PUBLIC_KEY is not set')
}

const DEFAULT_PORT = 5002

const PORT = isNaN(Number(import.meta.env?.PORT)) ? DEFAULT_PORT : Number(import.meta.env?.PORT)

export const CONFIG_BACKEND = {
  PORT,
  DATABASE_URL,
  POWERSYNC_PRIVATE_KEY,
  POWERSYNC_PUBLIC_KEY,
}
