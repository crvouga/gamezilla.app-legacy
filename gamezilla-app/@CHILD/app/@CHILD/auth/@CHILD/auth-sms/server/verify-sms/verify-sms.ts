import { PhoneNumber, Task } from "gamezilla-app/@SHARED/core"

export type IVerifySMS = {
  sendCode: (input: { phoneNumber: PhoneNumber }) => Task<string, null>
  verifyCode: (input: {
    phoneNumber: PhoneNumber
    code: string
  }) => Task<string, null>
}
