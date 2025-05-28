import { AppBackendCtx } from '~/app/@/backend/ctx'
import { IUserProfileDb } from '../user-profile/user-profile-db'

export type ProfileBackendCtx = AppBackendCtx & {
  profileDb: IUserProfileDb
}
