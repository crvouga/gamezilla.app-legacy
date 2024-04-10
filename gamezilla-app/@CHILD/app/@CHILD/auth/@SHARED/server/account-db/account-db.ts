import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { UserAccount } from "gamezilla-app/@CHILD/app/@SHARED/data/account"
import { Result } from "gamezilla-app/@SHARED/core"
import { Hash } from "gamezilla-app/@SHARED/hashing"

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
