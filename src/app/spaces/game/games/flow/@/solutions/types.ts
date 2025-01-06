import { RequestResponse } from '~/@/request-response/request-response'
import { NotAsked, Result } from '~/@/result'
import type { AppClientModule } from '~/app/@/architecture/app-client'
import type { AppServerModule } from '~/app/@/architecture/app-server'
import type { SpaceClientCmd } from '~/app/spaces/@/space-client/cmd'
import { SpaceClientCtx } from '~/app/spaces/@/space-client/ctx'
import { SpaceClientEvt } from '~/app/spaces/@/space-client/evt'
import type { SpaceServerCmd } from '~/app/spaces/@/space-server/cmd'
import { SpaceServerEvt } from '~/app/spaces/@/space-server/evt'
import { FlowClientEvtIn } from '../client/evt'
import { Variant } from '../flow/variant'
import { FlowServerCtx } from '../server/ctx'

export type ModelClient = {
  request: RequestResponse<string, null>
}

export const initClient: ModelClient = {
  request: NotAsked,
}

export type ModelServer = null

export type MsgClient = { t: 'solutions.noop' }

export type MsgServer = { t: 'solutions.noop' }

export type MsgToServer = {
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
  MsgToServer: MsgToServer
  Ctx: SpaceClientCtx
  MsgEvtIn: FlowClientEvtIn
  MsgCmdOut: SpaceClientCmd<{ MsgClient: MsgClient; MsgToServer: MsgToServer }>
  MsgCmdIn: MsgInCmdClient
  MsgEvtOut: SpaceClientEvt
}>

export type ServerModule = AppServerModule<{
  Model: ModelServer
  Msg: MsgServer
  MsgCmdOut: SpaceServerCmd<MsgToClient>
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Ctx: FlowServerCtx
  MsgEvtIn: SpaceServerEvt
}>
