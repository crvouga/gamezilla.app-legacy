import { SecretString } from '~/@/secrets/secret-string'
import { CONFIG_SHARED } from './shared'

const DATABASE_URL = () => {
  const value = SecretString.init('DATABASE_URL', process.env?.DATABASE_URL)
  if (!value) {
    throw new Error('DATABASE_URL is not set')
  }
  return value
}

const PORT = () => {
  const value = process.env?.PORT
  if (!value) {
    throw new Error('PORT is not set')
  }
  return Number(value)
}

const TWILIO_ACCOUNT_SID = () => {
  const value = process.env?.TWILIO_ACCOUNT_SID
  if (!value) {
    throw new Error('TWILIO_ACCOUNT_SID is not set')
  }
  return value
}

const TWILIO_AUTH_TOKEN = () => {
  const value = SecretString.init('TWILIO_AUTH_TOKEN', process.env?.TWILIO_AUTH_TOKEN)
  if (!value) {
    throw new Error('TWILIO_AUTH_TOKEN is not set')
  }
  return value
}

const TWILIO_MESSAGING_SERVICE_SID = () => {
  const value = process.env?.TWILIO_MESSAGING_SERVICE_SID
  if (!value) {
    throw new Error('TWILIO_MESSAGING_SERVICE_SID is not set')
  }
  return value
}

const CORS_ORIGINS: string[] = []

if (CONFIG_SHARED.IS_LOCAL) {
  CORS_ORIGINS.push('http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000')
}

if (CONFIG_SHARED.IS_PROD) {
  CORS_ORIGINS.push('https://www.gamezilla.app')
}

export const CONFIG_BACKEND = {
  CORS_ORIGINS,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_MESSAGING_SERVICE_SID,
  PORT,
  DATABASE_URL,
}
