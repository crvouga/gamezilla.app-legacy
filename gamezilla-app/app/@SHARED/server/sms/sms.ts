import { PhoneNumber, Result } from "gamezilla-app/@shared/core"

export type ISMS = {
  sendMessage: (input: {
    phoneNumber: PhoneNumber
    message: string
  }) => Promise<Result<string, null>>
}
