import { p } from '~/@/parser'
import { RequestResponse } from '~/@/request-response/request-response'
import { RemoteResult } from '~/@/result'
import type { AppBackendModule } from '~/app/@/architecture/app-backend'
import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import type { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { SpaceBackendEvt } from '~/app/spaces/@/space-backend/evt'
import { SpaceFrontendCmd } from '~/app/spaces/@/space-frontend/cmd'
import { SpaceFrontendEvt } from '~/app/spaces/@/space-frontend/evt'
import { FlowBackendCtx } from '../../backend/ctx'
import { FlowFrontendCmdRoot } from '../../frontend/cmd-root'
import { FlowFrontendCtxRoot } from '../../frontend/ctx-root'
import { FlowFrontendEvtIn } from '../../frontend/evt'
import type { Pack } from '../pack'
import type { IPackDb } from '../pack-db'

//
//
//
//

export type ModelFrontend = {
  request: RequestResponse<string, null>
}

export const initFrontend: ModelFrontend = {
  request: RemoteResult.NotAsked,
}

export const ModelBackend = p.l(null)
export type ModelBackend = p.Infer<typeof ModelBackend>

export const initBackend: ModelBackend = null

export const MsgFrontend = p.or(p.obj({ t: p.l('user-observed-end-of-list') }), p.obj({ t: p.l('elapsed') }))
export type MsgFrontend = p.Infer<typeof MsgFrontend>

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = {
  t: 'list-packs'
  input: ListPackInput
}

export const MsgToFrontend = p.obj({
  t: p.l('listed-packs'),
  listed: p.custom((x: unknown): x is ListPackOutput => Boolean(x), 'ListPackOutput'),
})

export type MsgToFrontend = {
  t: 'listed-packs'
  listed: ListPackOutput
}

export type ListPackInput = Parameters<IPackDb['list']>[0]

export type ListPackOutput = Awaited<ReturnType<IPackDb['list']>>

export type MsgInCmdFrontend = {
  t: 'pack-list'
  c: {
    t: 'load'
  }
}

//
//
//
//
//

export type MsgOutCmdFrontend =
  | SpaceFrontendCmd<{
      MsgFrontend: MsgFrontend
      MsgToBackend: MsgToBackend
    }>
  | FlowFrontendCmdRoot

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Ctx: FlowFrontendCtxRoot
  MsgEvtIn: FlowFrontendEvtIn
  MsgCmdOut: MsgOutCmdFrontend
  MsgCmdIn: MsgInCmdFrontend
  MsgEvtOut: SpaceFrontendEvt
  ViewSlot: {
    fab: null
  }
  ViewEmit: {
    clickedPackItem: Pack
  }
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
