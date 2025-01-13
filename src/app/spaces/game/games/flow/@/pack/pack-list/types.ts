import { RemoteResult } from '~/@/result'
import { p } from '~/@/parser'
import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import type { AppBackendModule } from '~/app/@/architecture/app-backend'
import type { SpaceFrontendCmd } from '~/app/spaces/@/space-frontend/cmd'
import type { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { FlowFrontendEvtIn } from '../../frontend/evt'
import { FlowBackendCtx } from '../../backend/ctx'
import type { Pack } from '../pack'
import type { IPackDb } from '../pack-db'
import type { PackId } from '../pack-id'
import { SpaceFrontendEvt } from '~/app/spaces/@/space-frontend/evt'
import { SpaceFrontendCtx } from '~/app/spaces/@/space-frontend/ctx'
import { SpaceBackendEvt } from '~/app/spaces/@/space-backend/evt'
import { RequestResponse } from '~/@/request-response/request-response'

//
//
//
//
//

export type FrontendModule = AppFrontendModule<{
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Ctx: SpaceFrontendCtx
  MsgEvtIn: FlowFrontendEvtIn
  MsgCmdOut: SpaceFrontendCmd<{
    MsgFrontend: MsgFrontend
    MsgToBackend: MsgToBackend
  }>
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

//
//
//
//

export type ModelFrontend = {
  request: RequestResponse<string, null>
  packs: { [id: PackId]: Pack }
}

export const initFrontend: ModelFrontend = {
  request: RemoteResult.NotAsked,
  packs: {},
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
