import { AppBackendCtx } from '~/app/@/backend/ctx'
import { GuestSessionMappingDb, IGuestSessionMappingDb } from '../guest-session-mapping/guest-session-mapping-db'
import { IUserAccountDb, UserAccountDb } from '../user-account-db'
import { IUserSessionDb, UserSessionDb } from '../user-session/user-session-db'
import { IVerifySMS } from './verify-sms'
import { VerifySMSFactory } from './verify-sms/impl/factory'

export type BackendCtx = AppBackendCtx & {
  userAccountDb: IUserAccountDb
  userSessionDb: IUserSessionDb
  userSessionDbCached: IUserSessionDb
  verifySMS: IVerifySMS
  guestSessionMappingDb: IGuestSessionMappingDb
}

const init = async (input: { ctx: AppBackendCtx }): Promise<BackendCtx> => {
  const userAccountDb = UserAccountDb({
    t: 'sql',
    dbConnSql: input.ctx.dbConnSql,
  })

  const userSessionDb = await UserSessionDb({
    t: 'sql',
    dbConnSql: input.ctx.dbConnSql,
    logger: input.ctx.logger,
  })

  const userSessionDbCached = await UserSessionDb({
    t: 'sql-with-cache',
    dbConnSql: input.ctx.dbConnSql,
    keyValueDb: input.ctx.keyValueDb,
    logger: input.ctx.logger,
    pubSubTopicBased: input.ctx.pubSub,
  })

  const verifySMS = VerifySMSFactory.createForEnvironment({
    logger: input.ctx.logger,
    env: input.ctx.env,
    dbConnSql: input.ctx.dbConnSql,
  })

  const guestSessionMappingDb = GuestSessionMappingDb({
    t: 'sql',
    dbConnSql: input.ctx.dbConnSql,
  })

  return {
    ...input.ctx,
    guestSessionMappingDb,
    userAccountDb,
    userSessionDb,
    userSessionDbCached,
    verifySMS,
  }
}

export const BackendCtx = {
  init,
}
