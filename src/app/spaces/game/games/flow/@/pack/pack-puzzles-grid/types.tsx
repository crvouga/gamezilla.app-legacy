import { NotAsked } from '~/@/result'
import type { RequestResponse } from '~/@/request-response/request-response'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { AppBackendModule } from '~/app/@/architecture/app-backend'
import { SpaceFrontendCmd } from '~/app/spaces/@/frontend/cmd'
import { SpaceBackendCmd } from '~/app/spaces/@/backend/cmd'
import { FlowFrontendEvtIn } from '../../frontend/evt'
import type { Puzzle } from '../../puzzle/puzzle'
import { ListPuzzlesOutput } from '../../puzzle/puzzle-db'
import type { PuzzleId } from '../../puzzle/puzzle-id'
import { FlowBackendCtx } from '../../backend/ctx'
import type { Pack } from '../pack'
import { SpaceFrontendCtx } from '~/app/spaces/@/frontend/ctx'
import { SpaceBackendEvt } from '~/app/spaces/@/backend/evt'
import { PackId } from '../pack-id'

export type ModelFrontend = {
  request: RequestResponse<string, null>
  requests: {
    [packId: PackId]: RequestResponse<string, null>
  }
  puzzles: {
    [puzzleId: PuzzleId]: Puzzle
  }
}

export const initFrontend: ModelFrontend = {
  request: NotAsked,
  requests: {},
  puzzles: {},
}

export type ModelBackend = Record<string, unknown>

export type MsgFrontend =
  | {
      t: 'user-observed-grid'
    }
  | {
      t: 'elapsed'
    }

export type MsgBackend = {
  t: 'noop'
}

export type MsgToFrontend = {
  t: 'listed-puzzles-by-id'
  listed: ListPuzzlesOutput
  causedBy: unknown
}

export type MsgToBackend = {
  t: 'list-puzzles-by-id'
  puzzleIds: PuzzleId[]
  causedBy: unknown
}

export type MsgInCmdFrontend = {
  t: 'pack-puzzles-grid'
  c: {
    t: 'load'
    pack: Pack
  }
}

export type PackGridFrontendCtx = SpaceFrontendCtx & {
  pack: Pack
}

export type FrontendModule = AppFrontendModule<{
  Ctx: PackGridFrontendCtx
  Model: ModelFrontend
  Msg: MsgFrontend
  MsgEvtIn: FlowFrontendEvtIn
  MsgCmdOut: SpaceFrontendCmd<{
    MsgFrontend: MsgFrontend
    MsgToBackend: MsgToBackend
  }>
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  ViewSlot: {
    grid: {
      request: RequestResponse<string, null>
    }
  }
  MsgCmdIn: MsgInCmdFrontend | null
}>

export type BackendModule = AppBackendModule<{
  Ctx: FlowBackendCtx
  Model: ModelBackend
  Msg: MsgBackend
  MsgEvtIn: SpaceBackendEvt
  MsgCmdOut: SpaceBackendCmd<MsgToFrontend>
  MsgToFrontend: MsgToFrontend
  MsgToBackend: MsgToBackend
  Deps: null
}>
