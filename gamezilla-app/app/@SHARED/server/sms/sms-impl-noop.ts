import { Ok } from "gamezilla-app/@SHARED/core"
import { ISMS } from "./sms"

export const smsNoop: ISMS = {
  async sendMessage(_input) {
    return Ok(null)
  },
}
