import { Err, Ok, isErr } from '~/@/core'
import { p } from '~/@/parser'
import type { ILogger } from '~/@/logger'
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_MESSAGING_SERVICE_SID } from '~/config-private'
import type { IVerifySMS } from '../../interface'
import { PhoneNumber } from '~/@/phone-number'

export type Config = {
  t: 'twilio'
  logger: ILogger
}

const AUTHORIZATION = `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`

export const VerifySMS = (deps: Config): IVerifySMS => {
  return {
    async sendCode(input) {
      try {
        const to = PhoneNumber.toString(input.phoneNumber)
        deps.logger.info(`Sending code to ${to}`)

        const body = new URLSearchParams({
          To: to,
          Channel: 'sms'
        }).toString()

        deps.logger.debug(`Sending code to ${to} body=${body}`)

        if (typeof fetch === 'undefined') {
          return Err({
            t: 'database-error',
            error: 'fetch is not defined'
          })
        }
        const response = await fetch(
          `https://verify.twilio.com/v2/Services/${TWILIO_MESSAGING_SERVICE_SID}/Verifications`,
          {
            method: 'POST',
            headers: {
              Authorization: AUTHORIZATION,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body
          }
        )

        const json = await response.json()

        if (!response.ok) {
          deps.logger.error(`Errored while sending code: ${JSON.stringify(json)}`)
          return Err({
            t: 'database-error',
            error: JSON.stringify(json)
          })
        }

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
          `https://verify.twilio.com/v2/Services/${TWILIO_MESSAGING_SERVICE_SID}/VerificationCheck`,
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
