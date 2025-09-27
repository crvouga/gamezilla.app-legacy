import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { GuestSessionMappingDb, IGuestSessionMappingDb } from '../guest-session-mapping/guest-session-mapping-db'
import { GuestSessionMappingSync } from '../guest-session-mapping/guest-session-mapping-sync'
import { IUserAccountDb, UserAccountDb } from '../user-account/user-account-db'
import { UserAccountDbSync } from '../user-account/user-account-db-sync'
import { IUserSessionDb, UserSessionDb } from '../user-session/user-session-db'
import { UserSessionDbSync } from '../user-session/user-session-db-sync'
import { IVerifySMS } from './verify-sms'
import { VerifySMSFactory } from './verify-sms/impl/factory'

export type AuthBackendCtx = AppBackendCtxBase & {
  userAccountDb: IUserAccountDb
  userSessionDb: IUserSessionDb
  verifySMS: IVerifySMS
  guestSessionMappingDb: IGuestSessionMappingDb
}

const init = async (input: { ctx: AppBackendCtxBase }): Promise<AuthBackendCtx> => {
  const userAccountDb = UserAccountDb({
    t: 'sql',
    sqlDb: input.ctx.sqlDb,
    logger: input.ctx.logger,
    migrationPolicy: input.ctx.migrationPolicy,
  })

  const userSessionDb = await UserSessionDb({
    t: 'sql',
    sqlDb: input.ctx.sqlDb,
    logger: input.ctx.logger,
    migrationPolicy: input.ctx.migrationPolicy,
  })

  const guestSessionMappingDb = GuestSessionMappingDb({
    t: 'sql',
    sqlDb: input.ctx.sqlDb,
    migrationPolicy: input.ctx.migrationPolicy,
    logger: input.ctx.logger,
  })

  input.ctx.syncEngine.registerSync(UserAccountDbSync({ userAccountDb, logger: input.ctx.logger }))

  input.ctx.syncEngine.registerSync(UserSessionDbSync({ userSessionDb, logger: input.ctx.logger }))

  input.ctx.syncEngine.registerSync(GuestSessionMappingSync({ guestSessionMappingDb, logger: input.ctx.logger }))

  const verifySMS = await VerifySMSFactory.createForEnvironment({
    logger: input.ctx.logger.child(['verifySMS']),
    env: input.ctx.env,
    sqlDb: input.ctx.sqlDb,
  })

  return {
    ...input.ctx,
    guestSessionMappingDb,
    userAccountDb,
    userSessionDb,
    verifySMS,
  }
}

const initUnitTest = async (input: { ctx: AppBackendCtxBase }): Promise<AuthBackendCtx> => {
  const userAccountDb = UserAccountDb({
    t: 'in-memory',
    async simulateLatency() {},
  })

  const userSessionDb = await UserSessionDb({
    t: 'in-memory',
    async simulateLatency() {},
    logger: input.ctx.logger,
  })

  const verifySMS = await VerifySMSFactory.createInHouseUnitTest({
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

export const AuthBackendCtx = {
  init,
  initUnitTest,
}
