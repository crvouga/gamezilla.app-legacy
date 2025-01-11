import { Ok } from '~/@/result'
import type { ISMS } from './interface'

export const smsNoop: ISMS = {
  async sendMessage(_input) {
    return Ok(null)
  },
}
