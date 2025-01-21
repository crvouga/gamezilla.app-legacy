import { RequestResponse } from '~/@/request-response/request-response'
import { NotAsked, Result } from '~/@/result'
import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import type { AppBackendModule } from '~/app/@/architecture/app-backend'
import type { SpaceFrontendCmd } from '~/app/spaces/@/frontend/cmd'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { SpaceFrontendEvt } from '~/app/spaces/@/frontend/evt'
import type { SpaceBackendCmd } from '~/app/spaces/@/backend/cmd'
import { SpaceBackendEvt } from '~/app/spaces/@/backend/evt'
import { FlowFrontendEvtIn } from '../frontend/evt'
import { Variant } from '../variant'
import { FlowBackendCtx } from '../backend/ctx'

export type ModelFrontend = {
  request: RequestResponse<string, null>
}

export const initFrontend: ModelFrontend = {
  request: NotAsked,
}

export type ModelBackend = null

export type MsgFrontend = { t: 'solutions.noop' }

export type MsgBackend = { t: 'solutions.noop' }

export type MsgToBackend = {
  t: 'solutions.find-solutions'
  flow: Variant.Model
}

export type MsgToFrontend = {
  t: 'solutions.found-solutions'
  found: Result<string, Variant.Model[]>
}

export type MsgInCmdFrontend = {
  t: 'solutions'
  c: {
    t: 'find'
    flow: Variant.Model
  }
}

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Ctx: SpaceFrontendCtx
  MsgEvtIn: FlowFrontendEvtIn
  MsgCmdOut: SpaceFrontendCmd<{ MsgFrontend: MsgFrontend; MsgToBackend: MsgToBackend }>
  MsgCmdIn: MsgInCmdFrontend
  MsgEvtOut: SpaceFrontendEvt
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
