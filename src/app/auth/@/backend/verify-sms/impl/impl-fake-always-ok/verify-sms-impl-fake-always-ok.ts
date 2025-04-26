import { Ok } from '~/@/result'
import { ILogger } from '~/@/logger'
import type { IVerifySMS } from '../../interface'
import { PhoneNumber } from '~/@/phone-number'

export type Config = {
  t: 'fake-always-ok'
  phoneNumber?: PhoneNumber
  logger: ILogger
}

export const VerifySMS = (_config: Config): IVerifySMS => {
  return {
    async sendCode(input) {
      return Ok({ phoneNumber: input.phoneNumber })
    },
    async verifyCode(input) {
      return Ok({ phoneNumber: input.phoneNumber })
    },
  }
}
