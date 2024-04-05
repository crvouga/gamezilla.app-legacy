import { PhoneNumber, Task } from "gamezilla-app/@SHARED/core"

export type VerifyCodeProblem =
  | {
      t: "code-incorrect"
    }
  | {
      t: "verification-expired"
    }
  | {
      t: "verification-not-found"
    }
  | {
      t: "verification-already-verified"
    }

export type IVerifySMS = {
  sendCode: (input: { phoneNumber: PhoneNumber }) => Task<string, null>
  verifyCode: (input: {
    phoneNumber: PhoneNumber
    code: string
  }) => Task<VerifyCodeProblem, null>
}
