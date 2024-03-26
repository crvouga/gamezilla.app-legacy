import { Logger } from "gamezilla-app/@CHILD/app/@SHARED/server/logger"
import { Err, Ok, PhoneNumber } from "gamezilla-app/@SHARED/core"
import { IVerifySMS } from "./verify-sms"

const CODE = "123"

export const VerifySMS = ({
  logger,
  delay,
}: {
  logger: Logger
  delay: () => Promise<void>
}): IVerifySMS => {
  return {
    async sendCode(input) {
      await delay()

      const phoneNumberStr = PhoneNumber.toString(input.phoneNumber)

      logger.info(
        `[verify-sms] [test] fake sent code to ${phoneNumberStr}. code: ${CODE}`,
      )

      return Ok(null)
    },
    async verifyCode(input) {
      await delay()

      if (input.code === CODE) {
        return Ok(null)
      }

      return Err("Code does not match the code sent")
    },
  }
}
