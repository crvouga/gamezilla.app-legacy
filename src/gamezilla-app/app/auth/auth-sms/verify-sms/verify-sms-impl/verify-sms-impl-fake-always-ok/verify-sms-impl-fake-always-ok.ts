import { Ok, PhoneNumber } from 'gamezilla-app/@/core'
import type { IVerifySMS } from '../../verify-sms'

export type Config = {
  t: 'fake-always-ok'
  phoneNumber?: PhoneNumber
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
