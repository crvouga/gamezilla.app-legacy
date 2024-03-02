import { PhoneNumber, Result } from "gamezilla/@SHARED/core"

export type IVerifySMS = {
  sendCode: (input: {
    phoneNumber: PhoneNumber
  }) => Promise<Result<string, null>>
  verifyCode: (input: {
    phoneNumber: PhoneNumber
    code: string
  }) => Promise<Result<string, null>>
}
