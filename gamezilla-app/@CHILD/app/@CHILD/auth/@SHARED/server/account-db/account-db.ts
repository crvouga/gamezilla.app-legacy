import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { Account } from "gamezilla-app/@CHILD/app/@SHARED/data/account"
import { EmailAddress, PhoneNumber, Result } from "gamezilla-app/@SHARED/core"

export type IAccountDb = {
  findOneByEmailAddress: (input: {
    emailAddress: EmailAddress
  }) => Promise<Result<string, Account | null>>
  findOneByPhoneNumber: (input: {
    phoneNumber: PhoneNumber
  }) => Promise<Result<string, Account | null>>
  findOneByUserId: (input: {
    userId: UserId | null
  }) => Promise<Result<string, Account | null>>
  insert: (input: Account) => Promise<Result<string, null>>
}
