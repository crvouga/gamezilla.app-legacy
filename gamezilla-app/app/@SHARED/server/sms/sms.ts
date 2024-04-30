import { PhoneNumber, Result } from "gamezilla-app/@SHARED/core"

export type ISMS = {
  sendMessage: (input: {
    phoneNumber: PhoneNumber
    message: string
  }) => Promise<Result<string, null>>
}
