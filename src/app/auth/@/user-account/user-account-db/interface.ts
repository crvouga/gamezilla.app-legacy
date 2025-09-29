import { IDb } from '~/@/db/interface'
import { s } from '~/@/schema'
import { UserAccount } from '~/app/@/data/user-account'

export const IUserAccountDb = IDb.schema({
  Entity: UserAccount,
  Related: s.partialObj({}),
})

export type IUserAccountDb = IDb.Infer<typeof IUserAccountDb>
