import { PhoneNumber, Task } from "gamezilla-app/@shared/core"
import { Hash } from "gamezilla-app/@shared/hashing"
import { Translator } from "gamezilla-app/@shared/l18n/generated"
import { VerificationId } from "./verification"

export type VerifyCodeProblem =
  | {
      t: "code-incorrect"
    }
  | {
      t: "verification-expired"
    }
  | {
      t: "verification-expired-too-many-failed-attempts"
    }
  | {
      t: "verification-not-found"
    }
  | {
      t: "verification-already-verified"
    }
  | {
      t: "database-error"
      error: string
    }

export const verifyCodeProblemToString = ({
  problem,
  t,
}: {
  problem: VerifyCodeProblem
  t: Translator
}): string => {
  switch (problem.t) {
    case "code-incorrect":
      return t("verify-sms-problem.code-incorrect")
    case "verification-expired":
      return t("verify-sms-problem.verification-expired")
    case "verification-not-found":
      return t("verify-sms-problem.verification-not-found")
    case "verification-already-verified":
      return t("verify-sms-problem.verification-already-verified")
    case "database-error":
      return t("verify-sms-problem.database-error")
    case "verification-expired-too-many-failed-attempts":
      return t(
        "verify-sms-problem.verification-expired-too-many-failed-attempts",
      )
  }
}

export type IVerifySMS = {
  sendCode: (input: {
    phoneNumber: PhoneNumber
  }) => Task<string, { verificationId: VerificationId }>
  verifyCode: (input: {
    verificationId: VerificationId
    code: string
  }) => Task<VerifyCodeProblem, { phoneNumberHash: Hash }>
}
