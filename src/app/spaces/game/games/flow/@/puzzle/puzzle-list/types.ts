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
import type { Puzzle } from '../puzzle'
import { QueryPuzzlesInput } from '../puzzle-db/query'
import { PuzzleId } from '../puzzle-id'

//
//
//
//

export type ModelFrontend = {
  results: {
    [queryKey: string]: PuzzleId[]
  }
  queries: {
    [name: string]: QueryPuzzlesInput
  }
}

export const initFrontend: ModelFrontend = {
  results: {},
  queries: {},
}

export type ModelBackend = null

export type MsgFrontend = {
  t: 'got-puzzle-db-puzzles'
  query: QueryPuzzlesInput
  puzzles: Puzzle[]
}

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = {
  t: 'noop'
}

export type MsgInCmdFrontend = {
  t: 'puzzle-list'
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
