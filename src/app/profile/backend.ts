import { AppBackendCtxBase } from '../@/backend/ctx'
import { ProfileBackendCtx } from './@/backend/ctx'
import { ProfileDb } from './@/user-profile/user-profile-db/impl'

const initCtx = async (input: { ctx: AppBackendCtxBase }): Promise<ProfileBackendCtx> => {
  return {
    ...input.ctx,
    profileDb: ProfileDb({
      t: 'sql',
      logger: input.ctx.logger,
      dbConnSql: input.ctx.dbConnSql,
    }),
  }
}

const saga = function* (_input: { ctx: ProfileBackendCtx }) {}

export const ProfileBackend = {
  initCtx,
  saga,
}
