import { RequestResponse } from '~/@/request-response/request-response'
import { NotAsked, Result } from '~/@/result'
import type { AppClientModule } from '~/app/@/architecture/app-client'
import type { AppBackendModule } from '~/app/@/architecture/app-server'
import type { SpaceClientCmd } from '~/app/spaces/@/space-client/cmd'
import { SpaceClientCtx } from '~/app/spaces/@/space-client/ctx'
import { SpaceClientEvt } from '~/app/spaces/@/space-client/evt'
import type { SpaceBackendCmd } from '~/app/spaces/@/space-server/cmd'
import { SpaceBackendEvt } from '~/app/spaces/@/space-server/evt'
import { FlowClientEvtIn } from '../client/evt'
import { Variant } from '../variant'
import { FlowBackendCtx } from '../server/ctx'

export type ModelClient = {
  request: RequestResponse<string, null>
}

export const initClient: ModelClient = {
  request: NotAsked,
}

export type ModelBackend = null

export type MsgClient = { t: 'solutions.noop' }

export type MsgBackend = { t: 'solutions.noop' }

export type MsgToBackend = {
  t: 'solutions.find-solutions'
  flow: Variant.Model
}

export type MsgToClient = {
  t: 'solutions.found-solutions'
  found: Result<string, Variant.Model[]>
}

export type MsgInCmdClient = {
  t: 'solutions'
  c: {
    t: 'find'
    flow: Variant.Model
  }
}

export type ClientModule = AppClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
  Ctx: SpaceClientCtx
  MsgEvtIn: FlowClientEvtIn
  MsgCmdOut: SpaceClientCmd<{ MsgClient: MsgClient; MsgToBackend: MsgToBackend }>
  MsgCmdIn: MsgInCmdClient
  MsgEvtOut: SpaceClientEvt
}>

export type BackendModule = AppBackendModule<{
  Model: ModelBackend
  Msg: MsgBackend
  MsgCmdOut: SpaceBackendCmd<MsgToClient>
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
  Ctx: FlowBackendCtx
  MsgEvtIn: SpaceBackendEvt
}>
