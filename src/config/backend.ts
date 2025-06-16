import { SecretString } from '~/@/secrets/secret-string'

const DATABASE_URL = () => {
  const value = SecretString.init('DATABASE_URL', import.meta.env?.DATABASE_URL)
  if (!value) {
    throw new Error('DATABASE_URL is not set')
  }
  return value
}

const POWERSYNC_PRIVATE_KEY = () => {
  const value = SecretString.init('POWERSYNC_PRIVATE_KEY', import.meta.env?.POWERSYNC_PRIVATE_KEY)
  if (!value) {
    throw new Error('POWERSYNC_PRIVATE_KEY is not set')
  }
  return value
}

const POWERSYNC_PUBLIC_KEY = () => {
  const value = import.meta.env?.POWERSYNC_PUBLIC_KEY
  if (!value) {
    throw new Error('POWERSYNC_PUBLIC_KEY is not set')
  }
  return value
}

const PORT = () => {
  const value = import.meta.env?.PORT
  if (!value) {
    throw new Error('PORT is not set')
  }
  return Number(value)
}

export const CONFIG_BACKEND = {
  PORT,
  DATABASE_URL,
  POWERSYNC_PRIVATE_KEY,
  POWERSYNC_PUBLIC_KEY,
}
