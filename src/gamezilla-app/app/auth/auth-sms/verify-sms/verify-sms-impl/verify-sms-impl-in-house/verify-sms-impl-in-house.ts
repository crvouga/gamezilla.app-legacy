import type { IVerifySMS } from '../../verify-sms'
import type { Config } from './shared'
import { SendCode } from './verify-sms-impl-in-house-send-code'
import { VerifyCode } from './verify-sms-impl-in-house-verify-code'

export const VerifySMS = (deps: Config): IVerifySMS => {
  return {
    sendCode: SendCode(deps),
    verifyCode: VerifyCode(deps)
  }
}
