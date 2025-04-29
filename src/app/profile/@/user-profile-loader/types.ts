import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { UserProfile } from '~/app/@/data/user-profile'
import { UserId } from '~/app/@/data/user-id'
import { AppFrontendCmd } from '~/app/@/frontend/cmd'
import { AppFrontendEvt } from '~/app/@/frontend/evt'
import { ProfileFrontendCtx } from '../frontend/ctx'
import { ProfileDbQuery } from '../user-profile/user-profile-db/query'

export type ModelFrontend = {
  results: {
    [queryKey: string]: UserId[]
  }
  queries: {
    [name: string]: ProfileDbQuery
  }
}

export const initFrontend: ModelFrontend = {
  results: {},
  queries: {},
}

export type MsgFrontend = {
  t: 'got-profile-db-profiles'
  query: ProfileDbQuery
  profiles: UserProfile[]
}

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

export type MsgInCmdFrontend = {
  t: 'profile-cmd.got-profile-loader-cmd'
  c: {
    t: 'got-msg'
    msg: MsgFrontend
  }
}

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Ctx: ProfileFrontendCtx
  MsgEvtIn: AppFrontendEvt
  MsgCmdOut: AppFrontendCmd<{ MsgFrontend: MsgFrontend; MsgToBackend: MsgToBackend }>
  MsgCmdIn: MsgInCmdFrontend
  MsgEvtOut: null
}>
