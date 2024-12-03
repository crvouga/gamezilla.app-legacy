import { Ok, PhoneNumber } from '~/@/core'
import { ILogger } from '~/app/@/server/logger'
import type { IVerifySMS } from '../../interface'

export type Config = {
  t: 'fake-always-ok'
  phoneNumber?: PhoneNumber
  logger: ILogger
}

export const VerifySMS = (_config: Config): IVerifySMS => {
  return {
    async sendCode() {
      return Ok(null)
    },
    async verifyCode() {
      return Ok(null)
    }
  }
}
