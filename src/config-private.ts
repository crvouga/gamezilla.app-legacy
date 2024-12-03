import { IS_PROD } from './config-public'

if (typeof window !== 'undefined') {
  throw new Error('Detected client-side code within config-private.ts')
}

const DATABASE_URL_LOCAL = 'postgresql://gamezilla-app:gamezilla-app@localhost:5433/gamezilla-app?sslmode=disable'

export const DATABASE_URL = IS_PROD ? import.meta.env.DATABASE_URL : DATABASE_URL_LOCAL

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const REDIS_URL_LOCAL = 'redis://localhost:6379'

export const REDIS_URL = IS_PROD ? import.meta.env.REDIS_URL : REDIS_URL_LOCAL

if (!REDIS_URL) {
  throw new Error('REDIS_URL is not set')
}

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
