import { Result } from "gamezilla-app/@shared/core"
import { Hash } from "gamezilla-app/@shared/hashing"
import { UserId } from "gamezilla-app/app/@shared/data"
import { UserAccount } from "gamezilla-app/app/@shared/data/account"

export type IAccountDb = {
  findOneByPhoneNumberHash: (input: {
    phoneNumberHash: Hash
  }) => Promise<Result<string, UserAccount | null>>
  findOneByUserId: (input: {
    userId: UserId | null
  }) => Promise<Result<string, UserAccount | null>>
  insert: (input: {
    account: UserAccount
    phoneNumberHash?: Hash
  }) => Promise<Result<string, null>>
}
