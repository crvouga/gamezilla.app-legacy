import { RemoteResult, type RequestResponse } from '@/core'
import { p } from '@/core/parser'
import type { AppClientModule } from 'gamezilla-app/app/@/architecture/app-client'
import type { AppServerModule } from 'gamezilla-app/app/@/architecture/app-server'
import type { SpaceClientCmd } from 'gamezilla-app/app/spaces/@/space-client-cmd'
import type { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import { FlowClientEvtIn } from '../../flow-client-evt'
import { FlowServerCtx } from '../../flow-server-ctx'
import type { FlowPack } from '../pack'
import type { IFlowPackDb } from '../pack-db'
import type { FlowPackId } from '../pack-id'
import { SpaceClientEvt } from 'gamezilla-app/app/spaces/@/space-client-evt'
import { SpaceClientCtx } from 'gamezilla-app/app/spaces/@/space-client-ctx'
import { SpaceServerEvt } from 'gamezilla-app/app/spaces/@/space-server-evt'

//
//
//
//
//

export type ClientModule = AppClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Ctx: SpaceClientCtx
  MsgEvtIn: FlowClientEvtIn
  MsgCmdOut: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>
  MsgCmdIn: MsgInCmdClient
  MsgEvtOut: SpaceClientEvt
  ViewSlot: {
    fab: null
  }
  ViewEmit: {
    clickedPackItem: FlowPack
  }
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

//
//
//
//

export type ModelClient = {
  request: RequestResponse<string, null>
  packs: { [id: FlowPackId]: FlowPack }
}

export const initClient: ModelClient = {
  request: RemoteResult.NotAsked,
  packs: {}
}

export const ModelServer = p.l(null)
export type ModelServer = p.Infer<typeof ModelServer>

export const initServer: ModelServer = null

export const MsgClient = p.or(p.obj({ t: p.l('user-observed-end-of-list') }), p.obj({ t: p.l('elapsed') }))
export type MsgClient = p.Infer<typeof MsgClient>

export type MsgServer = { t: 'noop' }

export type MsgToServer = {
  t: 'list-packs'
  input: ListPackInput
}

export const MsgToClient = p.obj({
  t: p.l('listed-packs'),
  listed: p.custom((x: unknown): x is ListPackOutput => Boolean(x), 'ListPackOutput')
})

export type MsgToClient = {
  t: 'listed-packs'
  listed: ListPackOutput
}

export type ListPackInput = Parameters<IFlowPackDb['list']>[0]

export type ListPackOutput = Awaited<ReturnType<IFlowPackDb['list']>>

export type MsgInCmdClient = {
  t: 'flow-pack-list'
  c: {
    t: 'load'
  }
}
