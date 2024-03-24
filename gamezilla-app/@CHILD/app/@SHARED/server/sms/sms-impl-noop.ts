import { ok } from "gamezilla-app/@SHARED/core"
import { SMS } from "./sms"

export const smsNoop: SMS = {
  async sendMessage(_input) {
    return ok(null)
  },
}
