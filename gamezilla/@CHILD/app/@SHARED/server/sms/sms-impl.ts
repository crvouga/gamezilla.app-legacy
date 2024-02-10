import { SMS } from "./sms"
import { createSMSTwilio } from "./sms-impl-twilio"

export const createSMS = (_impl: "twilio"): SMS => {
    return createSMSTwilio()
}
