import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { GuestSessionMappingDb } from '../guest-session-mapping/guest-session-mapping-db'
import { IGuestSessionMappingDb } from '../guest-session-mapping/guest-session-mapping-db/interface'
import { IUserAccountDb, UserAccountDb } from '../user-account/user-account-db'
import { IUserSessionDb, UserSessionDb } from '../user-session/user-session-db'

export type AuthFrontendCtx = AppFrontendCtxBase & {
  guestSessionMappingDb: IGuestSessionMappingDb
  userSessionDb: IUserSessionDb
  userAccountDb: IUserAccountDb
}

const init = async (input: { ctx: AppFrontendCtxBase }): Promise<AuthFrontendCtx> => {
  return {
    ...input.ctx,
    guestSessionMappingDb: GuestSessionMappingDb({
      t: 'sql',
      dbConnSql: input.ctx.dbConnSql,
    }),
    userSessionDb: await UserSessionDb({
      t: 'sql',
      dbConnSql: input.ctx.dbConnSql,
      logger: input.ctx.logger,
    }),
    userAccountDb: UserAccountDb({
      t: 'sql',
      dbConnSql: input.ctx.dbConnSql,
    }),
  }
}

export const AuthFrontendCtx = {
  init,
}
