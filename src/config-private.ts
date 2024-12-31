export const DATABASE_URL = import.meta.env.DATABASE_URL

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

export const REDIS_URL = 'redis://localhost:6379'

export const TWILIO_ACCOUNT_SID = import.meta.env.TWILIO_ACCOUNT_SID

if (!TWILIO_ACCOUNT_SID) {
  throw new Error('TWILIO_ACCOUNT_SID is not set')
}

export const TWILIO_AUTH_TOKEN = import.meta.env.TWILIO_AUTH_TOKEN

if (!TWILIO_AUTH_TOKEN) {
  throw new Error('TWILIO_AUTH_TOKEN is not set')
}

export const TWILIO_MESSAGING_SERVICE_SID = import.meta.env.TWILIO_MESSAGING_SERVICE_SID

if (!TWILIO_MESSAGING_SERVICE_SID) {
  throw new Error('TWILIO_MESSAGING_SERVICE_SID is not set')
}

const PORT = import.meta.env?.PORT

if (!PORT) {
  throw new Error('PORT is not set')
}

export const SERVER_PORT = Number(PORT)
