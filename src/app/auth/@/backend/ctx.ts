import { Logger } from '~/@/logger'
import { uploadDataRegistry } from '~/@/upload-data/registry'
import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { GuestSessionMappingDb, IGuestSessionMappingDb } from '../guest-session-mapping/guest-session-mapping-db'
import { UploadDataGuestSessionMapping } from '../guest-session-mapping/upload-data'
import { UploadDataUserAccount } from '../user-account/upload-data'
import { IUserAccountDb, UserAccountDb } from '../user-account/user-account-db'
import { UploadDataUserSession } from '../user-session/upload-data'
import { IUserSessionDb, UserSessionDb } from '../user-session/user-session-db'
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

  uploadDataRegistry.add(UploadDataUserAccount({ userAccountDb }))
  uploadDataRegistry.add(UploadDataUserSession({ userSessionDb }))
  uploadDataRegistry.add(UploadDataGuestSessionMapping({ guestSessionMappingDb }))

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
