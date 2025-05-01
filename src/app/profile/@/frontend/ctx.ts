import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { IUserProfileDb } from '../user-profile/user-profile-db'

export type ProfileFrontendCtx = AppFrontendCtxBase & {
  profileDb: IUserProfileDb
}
