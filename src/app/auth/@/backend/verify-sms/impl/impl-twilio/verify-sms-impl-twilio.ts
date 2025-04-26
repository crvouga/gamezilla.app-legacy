import { Logger, type ILogger } from '~/@/logger'
import { p } from '~/@/parser'
import { PhoneNumber } from '~/@/phone-number'
import { Err, Ok, isErr } from '~/@/result'
import type { IVerifySMS } from '../../interface'

export type Config = {
  t: 'twilio'
  logger: ILogger
}

export const VerifySMS = (config: Config): IVerifySMS => {
  const logger = Logger.prefix('verify-sms-twilio', config.logger)

  const TWILIO_ACCOUNT_SID = import.meta.env?.TWILIO_ACCOUNT_SID

  if (!TWILIO_ACCOUNT_SID) {
    throw new Error('TWILIO_ACCOUNT_SID is not set')
  }

  const TWILIO_AUTH_TOKEN = import.meta.env?.TWILIO_AUTH_TOKEN

  if (!TWILIO_AUTH_TOKEN) {
    throw new Error('TWILIO_AUTH_TOKEN is not set')
  }

  const TWILIO_MESSAGING_SERVICE_SID = import.meta.env?.TWILIO_MESSAGING_SERVICE_SID

  if (!TWILIO_MESSAGING_SERVICE_SID) {
    throw new Error('TWILIO_MESSAGING_SERVICE_SID is not set')
  }

  const AUTHORIZATION = `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`

  return {
    async sendCode(input) {
      try {
        const to = PhoneNumber.toString(input.phoneNumber)
        logger.info(`Sending code to ${to}`)

        const body = new URLSearchParams({
          To: to,
          Channel: 'sms',
        }).toString()

        logger.debug(`Sending code to ${to} body=${body}`)

        if (typeof fetch === 'undefined') {
          return Err({
            t: 'database-error',
            error: 'fetch is not defined',
          })
        }
        const response = await fetch(
          `https://verify.twilio.com/v2/Services/${TWILIO_MESSAGING_SERVICE_SID}/Verifications`,
          {
            method: 'POST',
            headers: {
              Authorization: AUTHORIZATION,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body,
          },
        )

        const json = await response.json()

        if (!response.ok) {
          logger.error(`Errored while sending code: ${JSON.stringify(json)}`)
          return Err({
            t: 'database-error',
            error: JSON.stringify(json),
          })
        }

        logger.info(`Sent code to ${to} successfully: ${JSON.stringify(json)}`)
        return Ok({
          phoneNumber: input.phoneNumber,
        })
      } catch (error) {
        logger.error(`Errored while sending code: ${error}`)

        const twilioCode = typeof error === 'object' && error && 'code' in error ? Number(error.code) : null

        // https://www.twilio.com/docs/api/errors/60203
        if (twilioCode === 60203) {
          return Err({
            t: 'limit-reached',
          })
        }
        return Err({
          t: 'database-error',
          error: String(error),
        })
      }
    },

    async verifyCode(input) {
      try {
        const to = PhoneNumber.toString(input.phoneNumber)

        logger.info(`Verifying code for ${to}`)

        const response = await fetch(
          `https://verify.twilio.com/v2/Services/${TWILIO_MESSAGING_SERVICE_SID}/VerificationCheck`,
          {
            method: 'POST',
            headers: {
              Authorization: AUTHORIZATION,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: to,
              Code: input.code,
            }),
          },
        )

        const data = await response.json()

        const parsed = p
          .or(
            p.obj({
              valid: p.bool,
            }),
            p.obj({
              status: p.l(400),
              code: p.num,
            }),
          )
          .parse(data)

        if (isErr(parsed)) {
          return Err({
            t: 'database-error',
            error: String(parsed),
          })
        }

        if ('status' in parsed.value && parsed.value.status === 400) {
          const twilioCode = parsed.value.code
          // https://www.twilio.com/docs/errors/60200
          if (twilioCode === 60200) {
            return Err({
              t: 'code-incorrect',
            })
          }

          return Err({
            t: 'database-error',
            error: String(parsed),
          })
        }

        const valid = 'valid' in parsed.value ? parsed.value.valid : false

        logger.info(`Verified code for ${to} successfully: ${valid}`)

        if (valid) {
          return Ok({
            phoneNumber: input.phoneNumber,
          })
        }

        return Err({
          t: 'code-incorrect',
        })
      } catch (error) {
        logger.error(`Errored while verifying code: ${error}`)
        return Err({
          t: 'database-error',
          error: String(error),
        })
      }
    },
  }
}
