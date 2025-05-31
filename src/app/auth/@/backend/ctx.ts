import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { GuestSessionMappingDb, IGuestSessionMappingDb } from '../guest-session-mapping/guest-session-mapping-db'
import { IUserAccountDb, UserAccountDb } from '../user-account/user-account-db'
import { IUserSessionDb, UserSessionDb } from '../user-session/user-session-db'
import { IVerifySMS } from './verify-sms'
import { VerifySMSFactory } from './verify-sms/impl/factory'

export type BackendCtx = AppBackendCtxBase & {
  userAccountDb: IUserAccountDb
  userSessionDb: IUserSessionDb
  verifySMS: IVerifySMS
  guestSessionMappingDb: IGuestSessionMappingDb
}

const init = async (input: { ctx: AppBackendCtxBase }): Promise<BackendCtx> => {
  const userAccountDb = UserAccountDb({
    t: 'sql',
    dbConnSql: input.ctx.dbConnSql,
  })

  const userSessionDb = await UserSessionDb({
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
    verifySMS,
  }
}

const initUnitTest = async (input: { ctx: AppBackendCtxBase }): Promise<BackendCtx> => {
  const userAccountDb = UserAccountDb({
    t: 'in-memory',
    async simulateLatency() {},
  })

  const userSessionDb = await UserSessionDb({
    t: 'in-memory',
    async simulateLatency() {},
  })

  const verifySMS = VerifySMSFactory.createInHouseUnitTest({
    logger: input.ctx.logger,
  })

  const guestSessionMappingDb = GuestSessionMappingDb({
    t: 'hash-map',
  })

  return {
    ...input.ctx,
    guestSessionMappingDb,
    userAccountDb,
    userSessionDb,
    verifySMS,
  }
}

export const BackendCtx = {
  init,
  initUnitTest,
}
