import { AppBackendCtxBase } from '../@/backend/ctx'
import { ProfileBackendCtx } from './@/backend/ctx'
import { ProfileDb } from './@/user-profile/user-profile-db/impl'
import { UserProfileSync } from './@/user-profile/user-profile-sync'

const initCtx = async (input: { ctx: AppBackendCtxBase }): Promise<ProfileBackendCtx> => {
  const profileDb = ProfileDb({
    t: 'sql',
    logger: input.ctx.logger,
    sqlDb: input.ctx.sqlDb,
    migrationPolicy: input.ctx.migrationPolicy,
  })

  input.ctx.syncEngine.registerSync(UserProfileSync({ profileDb }))

  return {
    ...input.ctx,
    profileDb,
  }
}

const worker = async (_s: AbortSignal, _input: { ctx: ProfileBackendCtx }) => {}

export const ProfileBackend = {
  initCtx,
  worker,
}
