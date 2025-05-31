import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { IUserProfileDb } from '../user-profile/user-profile-db'

export type ProfileBackendCtx = AppBackendCtxBase & {
  profileDb: IUserProfileDb
}
