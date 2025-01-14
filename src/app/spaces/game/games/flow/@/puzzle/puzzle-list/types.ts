import { RequestResponse } from '~/@/request-response/request-response'
import { NotAsked } from '~/@/result'
import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import type { AppBackendModule } from '~/app/@/architecture/app-backend'
import { SpaceFrontendCmd } from '~/app/spaces/@/space-frontend/cmd'
import { SpaceFrontendEvt } from '~/app/spaces/@/space-frontend/evt'
import type { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { SpaceBackendEvt } from '~/app/spaces/@/space-backend/evt'
import { FlowFrontendCmdRoot } from '../../frontend/cmd-root'
import { FlowFrontendCtxRoot } from '../../frontend/ctx-root'
import { FlowFrontendEvtIn } from '../../frontend/evt'
import { FlowBackendCtx } from '../../backend/ctx'
import type { Puzzle } from '../puzzle'
import type { QueryPuzzlesInput, ListPuzzlesOutput } from '../puzzle-db'

//
//
//
//

export type ModelFrontend = {
  request: RequestResponse<string, null>
}

export const initFrontend: ModelFrontend = {
  request: NotAsked,
}

export type ModelBackend = null

export type MsgFrontend = { t: 'user-observed-end-of-list' } | { t: 'time-passed' }

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = {
  t: 'list-puzzles'
  input: QueryPuzzlesInput
}

export type MsgToFrontend = {
  t: 'listed-puzzle'
  listed: ListPuzzlesOutput
}

export type MsgInCmdFrontend = {
  t: 'puzzle-list'
  c: {
    t: 'load'
  }
}

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
  Ctx: FlowFrontendCtxRoot
  MsgEvtIn: FlowFrontendEvtIn
  MsgCmdOut: FlowFrontendCmdRoot | SpaceFrontendCmd<{ MsgFrontend: MsgFrontend; MsgToBackend: MsgToBackend }>
  MsgCmdIn: MsgInCmdFrontend
  MsgEvtOut: SpaceFrontendEvt
  ViewSlot: { fab: null }
  ViewEmit: { clickedPuzzleItem: Puzzle }
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
