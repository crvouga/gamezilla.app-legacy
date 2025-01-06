import { Ok } from '~/@/result'
import type { ISMS } from './sms'

export const smsNoop: ISMS = {
  async sendMessage(_input) {
    return Ok(null)
  },
}
