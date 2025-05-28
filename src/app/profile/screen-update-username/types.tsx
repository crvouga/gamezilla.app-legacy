import { RequestResponse } from '~/@/request-response/request-response'
import { Posix } from '~/@/time/posix'
import { AppBackendModule } from '~/app/@/architecture/app-backend'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { AppBackendCtx } from '~/app/@/backend/ctx'
import { Username } from '~/app/@/data/username'
import { AppFrontendCmd } from '~/app/@/frontend/cmd'
import { AnonymousFrontendCtx, AppFrontendCtx } from '~/app/@/frontend/ctx'
import { AppFrontendEvt } from '~/app/@/frontend/evt'

export type ModelFrontend = {
  'profile.update-username.username'?: string
  'profile-update-username.request'?: RequestResponse<string, null>
}

export type MsgFrontend =
  | {
      t: 'profile.update-username.inputted-username'
      username: string
    }
  | {
      t: 'profile.update-username.clicked-back'
    }
  | {
      t: 'profile.update-username.clicked-save'
    }

export type MsgBackend = {
  t: 'profile.update-username.noop'
}

export type MsgToBackend = {
  t: 'profile.update-username.clicked-save'
  username: string
}

export type MsgToFrontend = {
  t: 'profile.update-username.updated-username'
  username: Username
  lastUpdatedAt: Posix
}

export type FrontendCtx = AppFrontendCtx | AnonymousFrontendCtx

export type FrontendModule = AppFrontendModule<{
  Ctx: FrontendCtx
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToBackend: MsgToBackend
  MsgToFrontend: MsgToFrontend
  MsgEvtIn: AppFrontendEvt
  MsgEvtOut: AppFrontendEvt
  MsgCmdOut: AppFrontendCmd<{
    MsgFrontend: MsgFrontend
    MsgToBackend: MsgToBackend
  }>
}>

export type BackendModule = AppBackendModule<{
  Ctx: AppBackendCtx
  Msg: MsgBackend
  MsgToFrontend: MsgToFrontend
}>
