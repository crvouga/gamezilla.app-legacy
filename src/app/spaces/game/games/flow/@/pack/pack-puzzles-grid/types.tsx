import { NotAsked } from '~/@/result'
import type { RequestResponse } from '~/@/request-response/request-response'
import { AppClientModule } from '~/app/@/architecture/app-client'
import { AppBackendModule } from '~/app/@/architecture/app-backend'
import { SpaceClientCmd } from '~/app/spaces/@/space-client/cmd'
import { SpaceBackendCmd } from '~/app/spaces/@/space-backend/cmd'
import { FlowClientEvtIn } from '../../client/evt'
import type { Puzzle } from '../../puzzle/puzzle'
import { ListPuzzlesOutput } from '../../puzzle/puzzle-db'
import type { PuzzleId } from '../../puzzle/puzzle-id'
import { FlowBackendCtx } from '../../backend/ctx'
import type { Pack } from '../pack'
import { SpaceClientCtx } from '~/app/spaces/@/space-client/ctx'
import { SpaceBackendEvt } from '~/app/spaces/@/space-backend/evt'
import { PackId } from '../pack-id'

export type ModelClient = {
  request: RequestResponse<string, null>
  requests: {
    [packId: PackId]: RequestResponse<string, null>
  }
  puzzles: {
    [puzzleId: PuzzleId]: Puzzle
  }
}

export const initClient: ModelClient = {
  request: NotAsked,
  requests: {},
  puzzles: {},
}

export type ModelBackend = Record<string, unknown>

export type MsgClient =
  | {
      t: 'user-observed-grid'
    }
  | {
      t: 'elapsed'
    }

export type MsgBackend = {
  t: 'noop'
}

export type MsgToClient = {
  t: 'listed-puzzles-by-id'
  listed: ListPuzzlesOutput
  causedBy: unknown
}

export type MsgToBackend = {
  t: 'list-puzzles-by-id'
  puzzleIds: PuzzleId[]
  causedBy: unknown
}

export type MsgInCmdClient = {
  t: 'pack-puzzles-grid'
  c: {
    t: 'load'
    pack: Pack
  }
}

export type PackGridClientCtx = SpaceClientCtx & {
  pack: Pack
}

export type ClientModule = AppClientModule<{
  Ctx: PackGridClientCtx
  Model: ModelClient
  Msg: MsgClient
  MsgEvtIn: FlowClientEvtIn
  MsgCmdOut: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToBackend: MsgToBackend
  }>
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
  ViewSlot: {
    grid: {
      request: RequestResponse<string, null>
    }
  }
  MsgCmdIn: MsgInCmdClient | null
}>

export type BackendModule = AppBackendModule<{
  Ctx: FlowBackendCtx
  Model: ModelBackend
  Msg: MsgBackend
  MsgEvtIn: SpaceBackendEvt
  MsgCmdOut: SpaceBackendCmd<MsgToClient>
  MsgToClient: MsgToClient
  MsgToBackend: MsgToBackend
  Deps: null
}>
