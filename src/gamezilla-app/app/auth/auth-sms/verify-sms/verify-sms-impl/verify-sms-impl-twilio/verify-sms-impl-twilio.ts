import { Err, Ok, PhoneNumber, isErr } from 'gamezilla-app/@/core'
import { p } from 'gamezilla-app/@/core/parser'
import type { ILogger } from 'gamezilla-app/app/@/server/logger'
import type { IVerifySMS } from '../../verify-sms'

export type Deps = {
  logger: ILogger
}

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID

if (typeof TWILIO_ACCOUNT_SID !== 'string') {
  throw new Error('TWILIO_ACCOUNT_SID is required')
}

const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN

if (typeof TWILIO_AUTH_TOKEN !== 'string') {
  throw new Error('TWILIO_AUTH_TOKEN is required')
}

const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID

if (typeof TWILIO_MESSAGING_SERVICE_SID !== 'string') {
  throw new Error('TWILIO_MESSAGING_SERVICE_SID is required')
}

export const VerifySMS = (deps: Deps): IVerifySMS => {
  const twilioAccountSid = TWILIO_ACCOUNT_SID
  const twilioAuthToken = TWILIO_AUTH_TOKEN
  const twilioMessagingServiceSid = TWILIO_MESSAGING_SERVICE_SID
  const AUTHORIZATION = `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`
  return {
    async sendCode(input) {
      try {
        const to = PhoneNumber.toString(input.phoneNumber)
        deps.logger.info(`Sending code to ${to}`)

        const response = await fetch(`https://verify.twilio.com/v2/Services/${twilioAccountSid}/Verifications`, {
          method: 'POST',
          headers: {
            Authorization: AUTHORIZATION,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            To: to,
            Channel: 'sms'
          })
        })

        const json = await response.json()

        deps.logger.info(`Sent code to ${to} successfully: ${JSON.stringify(json)}`)
        return Ok(null)
      } catch (error) {
        deps.logger.error(`Errored while sending code: ${error}`)

        const twilioCode = typeof error === 'object' && error && 'code' in error ? Number(error.code) : null

        // https://www.twilio.com/docs/api/errors/60203
        if (twilioCode === 60203) {
          return Err({
            t: 'limit-reached'
          })
        }
        return Err({
          t: 'database-error',
          error: String(error)
        })
      }
    },

    async verifyCode(input) {
      try {
        const to = PhoneNumber.toString(input.phoneNumber)

        deps.logger.info(`Verifying code for ${to}`)

        const response = await fetch(
          `https://verify.twilio.com/v2/Services/${twilioMessagingServiceSid}/VerificationCheck`,
          {
            method: 'POST',
            headers: {
              Authorization: AUTHORIZATION,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              To: to,
              Code: input.code
            })
          }
        )

        const data = await response.json()

        const parsed = p
          .or(
            p.obj({
              valid: p.bool
            }),
            p.obj({
              status: p.l(400),
              code: p.num
            })
          )
          .parse(data)

        if (isErr(parsed)) {
          return Err({
            t: 'database-error',
            error: String(parsed)
          })
        }

        if ('status' in parsed.value && parsed.value.status === 400) {
          const twilioCode = parsed.value.code
          // https://www.twilio.com/docs/errors/60200
          if (twilioCode === 60200) {
            return Err({
              t: 'code-incorrect'
            })
          }

          return Err({
            t: 'database-error',
            error: String(parsed)
          })
        }

        const valid = 'valid' in parsed.value ? parsed.value.valid : false

        deps.logger.info(`Verified code for ${to} successfully: ${valid}`)

        if (valid) {
          return Ok(null)
        }

        return Err({
          t: 'code-incorrect'
        })
      } catch (error) {
        deps.logger.error(`Errored while verifying code: ${error}`)
        return Err({
          t: 'database-error',
          error: String(error)
        })
      }
    }
  }
}
