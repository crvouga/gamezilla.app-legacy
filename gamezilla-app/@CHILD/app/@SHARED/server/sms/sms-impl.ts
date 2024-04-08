import { Logger } from "../logger"
import { ISMS } from "./sms"
import { SMSTwilio } from "./sms-impl-twilio"

export type SMSImpl = {
  t: "twilio"
  logger: Logger
}

export const SMS = (impl: SMSImpl): ISMS => {
  return SMSTwilio(impl)
}
