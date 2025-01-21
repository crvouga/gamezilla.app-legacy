import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { SpaceFrontendCmd } from '~/app/spaces/@/frontend/cmd'
import { SpaceFrontendEvt } from '~/app/spaces/@/frontend/evt'
import { FlowFrontendCmdRoot } from '../../frontend/cmd-root'
import { FlowFrontendCtxRoot } from '../../frontend/ctx-root'
import { FlowFrontendEvtIn } from '../../frontend/evt'
import type { Pack } from '../pack'
import { PacksDbQuery } from '../pack-db/query'
import { PackId } from '../pack-id'

//
//
//
//

export type ModelFrontend = {
  results: {
    [queryKey: string]: PackId[]
  }
  queries: {
    [name: string]: PacksDbQuery
  }
}

export const initFrontend: ModelFrontend = {
  results: {},
  queries: {},
}

export type MsgFrontend = {
  t: 'got-pack-db-packs'
  query: PacksDbQuery
  packs: Pack[]
}

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

export type MsgOutCmdFrontend =
  | SpaceFrontendCmd<{
      MsgFrontend: MsgFrontend
      MsgToBackend: MsgToBackend
    }>
  | FlowFrontendCmdRoot

export type MsgInCmdFrontend = {
  t: 'pack-db-query'
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
