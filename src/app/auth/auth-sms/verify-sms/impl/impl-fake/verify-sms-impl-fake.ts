import { Err, Ok, PhoneNumber } from '~/@/core'
import type { ILogger } from '~/app/@/server/logger'
import { VerificationId } from '../../verification'
import type { IVerifySMS } from '../../interface'

const DEFAULT_CODE = '123'

export type Config = {
  t: 'fake'
  logger: ILogger
  delay?: () => Promise<void>
  verificationId?: VerificationId
  code?: string
}

export const VerifySMS = (deps: Config): IVerifySMS => {
  const phoneNumbers = new Map<VerificationId, PhoneNumber>()

  return {
    async sendCode(input) {
      await deps.delay?.()

      const verificationId = deps.verificationId ?? VerificationId.generate()

      phoneNumbers.set(verificationId, input.phoneNumber)

      const phoneNumberStr = PhoneNumber.toString(input.phoneNumber)

      deps.logger?.info(`[verify-sms] [test] fake sent code to ${phoneNumberStr}. code: ${DEFAULT_CODE}`)

      return Ok(null)
    },
    async verifyCode(input) {
      await deps.delay?.()

      if (!input.phoneNumber) {
        return Err({
          t: 'verification-not-found'
        })
      }

      const code = deps.code ?? DEFAULT_CODE
      if (code === DEFAULT_CODE) {
        return Ok(null)
      }

      return Err({
        t: 'code-incorrect'
      })
    }
  }
}
