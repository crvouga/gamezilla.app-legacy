import { BaseFrontendCtx } from '~/app/@/frontend/ctx'
import { GuestSessionMappingDb } from '../guest-session-mapping-db'
import { IGuestSessionMappingDb } from '../guest-session-mapping-db/interface'
import { IUserAccountDb, UserAccountDb } from '../user-account-db'
import { IUserSessionDb, UserSessionDb } from '../user-session-db'

export type FrontendCtx = BaseFrontendCtx & {
  guestSessionMappingDb: IGuestSessionMappingDb
  userSessionDb: IUserSessionDb
  userAccountDb: IUserAccountDb
}

const init = async (input: { ctx: BaseFrontendCtx }): Promise<FrontendCtx> => {
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

export const FrontendCtx = {
  init,
}
