import { EmailAddress, PhoneNumber, Result } from "gamezilla-app/@SHARED/core"
import { Account } from "../../../auth.core"

export type IAccountDb = {
  findOneByEmail: (input: {
    emailAddress: EmailAddress
  }) => Promise<Result<string, Account | null>>
  findOneByPhoneNumber: (input: {
    phoneNumber: PhoneNumber
  }) => Promise<Result<string, Account | null>>
  insert: (input: Account) => Promise<Result<string, null>>
}
