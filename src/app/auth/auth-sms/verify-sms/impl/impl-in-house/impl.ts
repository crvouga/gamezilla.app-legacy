import type { IVerifySMS } from '../../interface'
import type { Config } from './shared'
import { SendCode } from './send-code'
import { VerifyCode } from './verify-code'

export const VerifySMS = (deps: Config): IVerifySMS => {
  return {
    sendCode: SendCode(deps),
    verifyCode: VerifyCode(deps)
  }
}
