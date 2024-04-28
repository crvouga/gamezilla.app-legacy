import { ILogger } from "../logger/logger"
import { ISMS } from "./sms"
import { SMSTwilio } from "./sms-impl-twilio"

export type SMSImpl = {
  t: "twilio"
  logger: ILogger
}

export const SMS = (impl: SMSImpl): ISMS => {
  return SMSTwilio(impl)
}
