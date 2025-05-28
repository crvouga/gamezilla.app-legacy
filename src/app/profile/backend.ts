import { AppBackendModule } from '../@/architecture/app-backend'
import { AppBackendCtx } from '../@/backend/ctx'
import { ProfileBackendCtx } from './@/backend/ctx'
import { ProfileDb } from './@/user-profile/user-profile-db/impl'
import { BackendModule } from './types'

const initCtx = async (input: { ctx: AppBackendCtx }): Promise<ProfileBackendCtx> => {
  return {
    ...input.ctx,
    profileDb: ProfileDb({
      t: 'sql',
      logger: input.ctx.logger,
      dbConnSql: input.ctx.dbConnSql,
    }),
  }
}

const update: BackendModule['update'] = async (input) => {
  return AppBackendModule.andThen({}, () => updateFromMsg(input))
}

const updateFromMsg: BackendModule['update'] = async (_input) => {
  return {}
}

export const ProfileBackend = {
  initCtx,
  update,
}
