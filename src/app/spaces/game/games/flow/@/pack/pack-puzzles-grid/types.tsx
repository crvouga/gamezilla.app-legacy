import { NotAsked } from '~/@/result'
import type { RequestResponse } from '~/@/request-response/request-response'
import { AppClientModule } from '~/app/@/architecture/app-client'
import { AppServerModule } from '~/app/@/architecture/app-server'
import { SpaceClientCmd } from '~/app/spaces/@/space-client/cmd'
import { SpaceServerCmd } from '~/app/spaces/@/space-server/cmd'
import { FlowClientEvtIn } from '../../client/evt'
import type { Puzzle } from '../../puzzle/puzzle'
import { ListPuzzlesOutput } from '../../puzzle/puzzle-db'
import type { PuzzleId } from '../../puzzle/puzzle-id'
import { FlowServerCtx } from '../../server/ctx'
import type { Pack } from '../pack'
import { SpaceClientCtx } from '~/app/spaces/@/space-client/ctx'
import { SpaceServerEvt } from '~/app/spaces/@/space-server/evt'
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

export type ModelServer = Record<string, unknown>

export type MsgClient =
  | {
      t: 'user-observed-grid'
    }
  | {
      t: 'elapsed'
    }

export type MsgServer = {
  t: 'noop'
}

export type MsgToClient = {
  t: 'listed-puzzles-by-id'
  listed: ListPuzzlesOutput
  causedBy: unknown
}

export type MsgToServer = {
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
    MsgToServer: MsgToServer
  }>
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  ViewSlot: {
    grid: {
      request: RequestResponse<string, null>
    }
  }
  MsgCmdIn: MsgInCmdClient | null
}>

export type ServerModule = AppServerModule<{
  Ctx: FlowServerCtx
  Model: ModelServer
  Msg: MsgServer
  MsgEvtIn: SpaceServerEvt
  MsgCmdOut: SpaceServerCmd<MsgToClient>
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Deps: null
}>
