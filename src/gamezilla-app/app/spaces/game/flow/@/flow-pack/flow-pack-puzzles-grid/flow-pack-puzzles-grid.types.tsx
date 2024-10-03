import { NotAsked } from 'gamezilla-app/@/core'
import type { RequestResponse } from 'gamezilla-app/@/core/request-response'
import { AppClientModule } from 'gamezilla-app/app/@/architecture/app-client'
import { AppServerModule } from 'gamezilla-app/app/@/architecture/app-server'
import { SpaceClientCtx, SpaceServerEvt } from 'gamezilla-app/app/spaces/@/space'
import { SpaceClientCmd } from 'gamezilla-app/app/spaces/@/space-client-cmd'
import { SpaceServerCmd } from 'gamezilla-app/app/spaces/@/space-server-cmd'
import { FlowClientEvtIn } from '../../flow-client-evt'
import type { FlowPuzzle } from '../../flow-puzzle/flow-puzzle'
import { ListPuzzlesOutput } from '../../flow-puzzle/flow-puzzle-db'
import type { FlowPuzzleId } from '../../flow-puzzle/flow-puzzle-id'
import { FlowServerCtx } from '../../flow-server-ctx'
import type { FlowPack } from '../flow-pack'

export type ModelClient = {
  request: RequestResponse<string, null>
  puzzles: {
    [puzzleId: FlowPuzzleId]: FlowPuzzle
  }
}

export const initClient: ModelClient = {
  request: NotAsked,
  puzzles: {}
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
  puzzleIds: FlowPuzzleId[]
  causedBy: unknown
}

export type MsgInCmdClient = {
  t: 'flow-pack-puzzles-grid'
  c: {
    t: 'load'
    pack: FlowPack
  }
}

export type FlowPackGridClientCtx = SpaceClientCtx & {
  pack: FlowPack
}

export type ClientModule = AppClientModule<{
  Ctx: FlowPackGridClientCtx
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
