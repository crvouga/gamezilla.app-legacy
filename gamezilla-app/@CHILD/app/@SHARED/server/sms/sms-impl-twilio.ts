import { Err, Ok, PhoneNumber } from "gamezilla-app/@SHARED/core"
import twilio from "twilio"
import { Logger } from "../logger"
import { SMS } from "./sms"

const TWILLIO_ACCOUNT_SID = process.env["TWILLIO_ACCOUNT_SID"]

if (!TWILLIO_ACCOUNT_SID) {
  throw new Error("TWILLIO_ACCOUNT_SID is not set")
}

const TWILLIO_AUTH_TOKEN = process.env["TWILLIO_AUTH_TOKEN"]

if (!TWILLIO_AUTH_TOKEN) {
  throw new Error("TWILLIO_AUTH_TOKEN is not set")
}

const TWILLIO_MESSAGING_SERVICE_SID =
  process.env["TWILLIO_MESSAGING_SERVICE_SID"]

if (!TWILLIO_ACCOUNT_SID) {
  throw new Error("TWILLIO_ACCOUNT_SID is not set")
}

export const SMSTwilio = ({ logger }: { logger: Logger }): SMS => {
  const client = twilio(TWILLIO_ACCOUNT_SID, TWILLIO_AUTH_TOKEN)

  return {
    async sendMessage(input) {
      try {
        logger.info(
          `Sending SMS ${JSON.stringify({
            phoneNumber: input.phoneNumber,
            message: input.message,
          })}`,
        )
        await client.messages.create({
          messagingServiceSid: TWILLIO_MESSAGING_SERVICE_SID,
          to: PhoneNumber.toString(input.phoneNumber),
          body: input.message,
        })
        logger.info("SMS sent")
        return Ok(null)
      } catch (error) {
        logger.error(`Errored while sending SMS: ${error}`)
        return Err(String(error))
      }
    },
  }
}
