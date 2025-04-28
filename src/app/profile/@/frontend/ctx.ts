import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { IProfileDb } from '../user-profile/user-profile-db'

export type ProfileFrontendCtx = AppFrontendCtxBase & {
  profileDb: IProfileDb
}
