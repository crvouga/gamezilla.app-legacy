import type { AppBackendModule } from '~/app/@/architecture/app-backend'
import type { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import type { SpaceBackendCmd } from '~/app/spaces/@/backend/cmd'
import { FlowBackendCtx } from '../../backend/ctx'
import { FlowFrontendCtxBase } from '../../frontend/ctx-base'
import type { Puzzle } from '../puzzle'
import { PuzzleQuery } from '../puzzle-db/query'
import { PuzzleId } from '../puzzle-id'

export type ModelFrontend = {
  results: {
    [queryKey: string]: PuzzleId[]
  }
  queries: {
    [name: string]: PuzzleQuery
  }
}

export const initFrontend: ModelFrontend = {
  results: {},
  queries: {},
}

export type ModelBackend = null

export type MsgFrontend = {
  t: 'got-puzzle-db-puzzles'
  query: PuzzleQuery
  puzzles: Puzzle[]
}

export type MsgBackend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = {
  t: 'noop'
}

export type MsgInCmdFrontend = {
  t: 'flow-cmd.got-puzzle-loader-cmd'
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
  Ctx: FlowFrontendCtxBase
  MsgCmdIn: MsgInCmdFrontend
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
}>
