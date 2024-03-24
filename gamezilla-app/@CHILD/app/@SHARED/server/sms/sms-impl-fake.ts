import { PhoneNumber, ok } from "gamezilla-app/@SHARED/core"
import { SMS } from "./sms"

export const SMSFake = (): SMS & {
  sent: { phoneNumber: PhoneNumber; message: string }[]
} => {
  const sent: { phoneNumber: PhoneNumber; message: string }[] = []
  return {
    sent,
    async sendMessage(_input) {
      sent.push({
        phoneNumber: _input.phoneNumber,
        message: _input.message,
      })
      return ok(null)
    },
  }
}
