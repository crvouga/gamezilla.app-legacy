import { uploadDataRegistry } from '~/@/upload-data/upload-data-registry'
import { AppBackendCtxBase } from '../@/backend/ctx'
import { ProfileBackendCtx } from './@/backend/ctx'
import { ProfileDb } from './@/user-profile/user-profile-db/impl'

const initCtx = async (input: { ctx: AppBackendCtxBase }): Promise<ProfileBackendCtx> => {
  const profileDb = ProfileDb({
    t: 'sql',
    logger: input.ctx.logger,
    sqlDb: input.ctx.sqlDb,
  })

  uploadDataRegistry.add(ProfileDb.UploadData({ profileDb }))
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
