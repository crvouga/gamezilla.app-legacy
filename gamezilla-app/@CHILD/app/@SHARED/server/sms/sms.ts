import { PhoneNumber, Result } from "gamezilla-app/@SHARED/core"

export type SMS = {
  sendMessage: (input: {
    phoneNumber: PhoneNumber
    message: string
  }) => Promise<Result<string, null>>
}
