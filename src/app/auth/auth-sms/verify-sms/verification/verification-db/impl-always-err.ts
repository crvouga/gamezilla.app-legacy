import { Err } from '~/@/result'
import type { IVerificationDb } from './interface'

export type Config = {
  t: 'always-err'
  error: string
}

export const VerificationDb = (config: Config): IVerificationDb => {
  return {
    async find() {
      return Err(config.error)
    },
    async put() {
      return Err(config.error)
    },
    async zap() {
      return Err(config.error)
    }
  }
}
