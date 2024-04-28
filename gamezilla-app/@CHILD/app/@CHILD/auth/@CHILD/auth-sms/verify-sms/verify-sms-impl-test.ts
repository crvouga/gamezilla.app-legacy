import { ILogger } from "gamezilla-app/@CHILD/app/@SHARED/server/logger/logger"
import { Err, Ok, PhoneNumber } from "gamezilla-app/@SHARED/core"
import { Hash, IHashing } from "gamezilla-app/@SHARED/hashing"
import { VerificationId } from "./verification"
import { IVerifySMS } from "./verify-sms"

const CODE = "123"

export type VerifySMSDeps = {
  hashing: IHashing
  logger: ILogger
  delay: () => Promise<void>
}

const phoneNumberHashes = new Map<VerificationId, Hash>()
export const VerifySMS = (deps: VerifySMSDeps): IVerifySMS => {
  return {
    async sendCode(input) {
      await deps.delay()

      const verificationId = VerificationId.generate()

      const phoneNumberHash = await deps.hashing.hash({
        algo: {
          t: "bcrypt",
          cost: 10,
        },
        password: PhoneNumber.toString(input.phoneNumber),
      })

      phoneNumberHashes.set(verificationId, phoneNumberHash)

      const phoneNumberStr = PhoneNumber.toString(input.phoneNumber)

      deps.logger.info(
        `[verify-sms] [test] fake sent code to ${phoneNumberStr}. code: ${CODE}`,
      )

      return Ok({
        verificationId,
      })
    },
    async verifyCode(input) {
      await deps.delay()

      const phoneNumberHash = phoneNumberHashes.get(input.verificationId)

      if (!phoneNumberHash) {
        return Err({
          t: "verification-not-found",
        })
      }

      if (input.code === CODE) {
        return Ok({
          phoneNumberHash,
        })
      }

      return Err({
        t: "code-incorrect",
      })
    },
  }
}
