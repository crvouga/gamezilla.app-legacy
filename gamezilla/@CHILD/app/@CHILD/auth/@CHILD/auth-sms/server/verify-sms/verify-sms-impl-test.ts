import { PhoneNumber, err, ok } from "gamezilla/@SHARED/core"
import { IVerifySMS } from "./verify-sms"
import { Logger } from "gamezilla/@CHILD/app/@SHARED/server/logger"

const CODE = "123"

export const VerifySMS = ({ logger }: { logger: Logger }): IVerifySMS => {
    return {
        async sendCode(input) {
            await new Promise((resolve) => setTimeout(resolve, 1000))

            const phoneNumberStr = PhoneNumber.toString(input.phoneNumber)

            logger.info(
                `[verify-sms] [test] fake sent code to ${phoneNumberStr}. code: ${CODE}`,
            )

            return ok(null)
        },
        async verifyCode(input) {
            await new Promise((resolve) => setTimeout(resolve, 1000))

            if (input.code === CODE) {
                return ok(null)
            }

            return err("Code does not match the code sent")
        },
    }
}
