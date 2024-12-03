import { Err } from '@/core'
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
    }
  }
}
