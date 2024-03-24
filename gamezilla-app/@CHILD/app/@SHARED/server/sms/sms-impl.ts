import { Logger } from "../logger"
import { SMS } from "./sms"
import { SMSTwilio } from "./sms-impl-twilio"

export type SMSImpl = {
  t: "twilio"
  logger: Logger
}

export const createSMS = (impl: SMSImpl): SMS => {
  return SMSTwilio(impl)
}
