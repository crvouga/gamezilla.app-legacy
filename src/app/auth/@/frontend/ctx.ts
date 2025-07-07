import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { IGuestSessionMappingDb } from '../guest-session-mapping/guest-session-mapping-db/interface'
import { IUserAccountDb } from '../user-account/user-account-db'
import { IUserSessionDb } from '../user-session/user-session-db'

export type AuthFrontendCtx = AppFrontendCtxBase & {
  guestSessionMappingDb: IGuestSessionMappingDb
  userSessionDb: IUserSessionDb
  userAccountDb: IUserAccountDb
}
export const AuthFrontendCtx = {}
