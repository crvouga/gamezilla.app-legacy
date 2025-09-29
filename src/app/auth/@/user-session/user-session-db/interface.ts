import { IDb } from '~/@/db/interface'
import { s } from '~/@/schema'
import { UserSession } from '../user-session'

export const IUserSessionDb = IDb.schema({
  Entity: UserSession,
  Related: s.partialObj({}),
})

export type IUserSessionDb = IDb.Infer<typeof IUserSessionDb>
