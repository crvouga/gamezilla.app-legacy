import type { AppBackendModule } from '~/app/@/architecture/app-backend'
import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import type { SpaceBackendCmd } from '~/app/spaces/@/backend/cmd'
import { SpaceBackendEvt } from '~/app/spaces/@/backend/evt'
import { SpaceFrontendCmd } from '~/app/spaces/@/frontend/cmd'
import { SpaceFrontendEvt } from '~/app/spaces/@/frontend/evt'
import { FlowBackendCtx } from '../../backend/ctx'
import { FlowFrontendCmdRoot } from '../../frontend/cmd-root'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import { FlowFrontendEvtIn } from '../../frontend/evt'
import { Solutions } from '../solutions'

export type ModelFrontend = {}

export const initFrontend: ModelFrontend = {}

export type ModelBackend = null

export type MsgFrontend = {
  t: 'got-solutions-db-solutions'
  solutions: Solutions
}

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = {
  t: 'noop'
}

export type MsgInCmdFrontend = {
  t: 'flow-cmd.got-solutions-loader-cmd'
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
  Ctx: FlowFrontendCtxBase
  MsgEvtIn: FlowFrontendEvtIn
  MsgCmdOut: FlowFrontendCmdRoot | SpaceFrontendCmd<{ MsgFrontend: MsgFrontend; MsgToBackend: MsgToBackend }>
  MsgCmdIn: MsgInCmdFrontend
  MsgEvtOut: SpaceFrontendEvt
  ViewSlot: {}
  ViewEmit: {}
}>

export type BackendModule = AppBackendModule<{
  Model: ModelBackend
  Msg: MsgBackend
  MsgCmdOut: SpaceBackendCmd<MsgToFrontend>
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Ctx: FlowBackendCtx
  MsgEvtIn: SpaceBackendEvt
}>
