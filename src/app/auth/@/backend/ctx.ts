import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { GuestSessionMappingDb, IGuestSessionMappingDb } from '../guest-session-mapping/guest-session-mapping-db'
import { IUserAccountDb, UserAccountDb } from '../user-account/user-account-db'
import { IUserSessionDb, UserSessionDb } from '../user-session/user-session-db'
import { IVerifySMS } from './verify-sms'
import { VerifySMSFactory } from './verify-sms/impl/factory'
import { Logger } from '~/@/logger'
import { uploadDataRegistry } from '~/@/upload-data/upload-data-registry'

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
  })

  const userSessionDb = await UserSessionDb({
    t: 'sql-with-cache',
    sqlDb: input.ctx.sqlDb,
    keyValueDb: input.ctx.keyValueDbDurable,
    logger: input.ctx.logger,
    pubSubTopicBased: input.ctx.pubSub,
  })

  const guestSessionMappingDb = GuestSessionMappingDb({
    t: 'sql',
    sqlDb: input.ctx.sqlDb,
  })

  uploadDataRegistry.add(UserAccountDb.UploadData({ userAccountDb }))
  uploadDataRegistry.add(UserSessionDb.UploadData({ userSessionDb }))
  uploadDataRegistry.add(GuestSessionMappingDb.UploadData({ guestSessionMappingDb }))

  const verifySMS = VerifySMSFactory.createForEnvironment({
    logger: Logger.prefix('verifySMS', input.ctx.logger),
    backendRole: input.ctx.backendRole,
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

export const AuthBackendCtx = {
  init,
  initUnitTest,
}
