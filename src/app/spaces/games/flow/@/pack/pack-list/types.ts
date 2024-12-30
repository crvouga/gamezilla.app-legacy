import { RemoteResult } from '~/@/result'
import { p } from '~/@/parser'
import type { AppClientModule } from '~/app/@/architecture/app-client'
import type { AppServerModule } from '~/app/@/architecture/app-server'
import type { SpaceClientCmd } from '~/app/spaces/@/space-client-cmd'
import type { SpaceServerCmd } from '~/app/spaces/@/space-server-cmd'
import { FlowClientEvtIn } from '../../client/evt'
import { FlowServerCtx } from '../../server/ctx'
import type { Pack } from '../pack'
import type { IPackDb } from '../pack-db'
import type { PackId } from '../pack-id'
import { SpaceClientEvt } from '~/app/spaces/@/space-client-evt'
import { SpaceClientCtx } from '~/app/spaces/@/space-client-ctx'
import { SpaceServerEvt } from '~/app/spaces/@/space-server-evt'
import { RequestResponse } from '~/@/request-response/request-response'

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
    clickedPackItem: Pack
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
  packs: { [id: PackId]: Pack }
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

export type ListPackInput = Parameters<IPackDb['list']>[0]

export type ListPackOutput = Awaited<ReturnType<IPackDb['list']>>

export type MsgInCmdClient = {
  t: 'flow-pack-list'
  c: {
    t: 'load'
  }
}
