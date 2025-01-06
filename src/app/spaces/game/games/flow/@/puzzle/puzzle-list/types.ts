import { NotAsked } from '~/@/result'
import type { AppClientModule } from '~/app/@/architecture/app-client'
import type { AppServerModule } from '~/app/@/architecture/app-server'
import type { SpaceClientCmd } from '~/app/spaces/@/space-client/cmd'
import { SpaceClientEvt } from '~/app/spaces/@/space-client/evt'
import type { SpaceServerCmd } from '~/app/spaces/@/space-server/cmd'
import { FlowClientEvtIn } from '../../client/evt'
import { FlowServerCtx } from '../../server/ctx'
import type { Puzzle } from '../puzzle'
import type { ListPuzzlesInput, ListPuzzlesOutput } from '../puzzle-db'
import type { PuzzleId } from '../puzzle-id'
import { SpaceClientCtx } from '~/app/spaces/@/space-client/ctx'
import { SpaceServerEvt } from '~/app/spaces/@/space-server/evt'
import { RequestResponse } from '~/@/request-response/request-response'

//
//
//
//

export type ModelClient = {
  request: RequestResponse<string, null>
  puzzles: { [id: PuzzleId]: Puzzle }
}

export const initClient: ModelClient = {
  request: NotAsked,
  puzzles: {},
}

export type ModelServer = null

export type MsgClient = { t: 'user-observed-end-of-list' } | { t: 'time-passed' }

export type MsgServer = { t: 'noop' }

export type MsgToServer = {
  t: 'list-puzzles'
  input: ListPuzzlesInput
}

export type MsgToClient = {
  t: 'listed-puzzle'
  listed: ListPuzzlesOutput
}

export type MsgInCmdClient = {
  t: 'flow-cmd.puzzle-list'
  c: {
    t: 'load'
  }
}

//
//
//
//
//

export type ClientModule = AppClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Ctx: SpaceClientCtx
  MsgEvtIn: FlowClientEvtIn
  MsgCmdOut: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>
  MsgCmdIn: MsgInCmdClient
  MsgEvtOut: SpaceClientEvt
  ViewSlot: {
    fab: null
  }
  ViewEmit: {
    clickedPuzzleItem: Puzzle
  }
}>

export type ServerModule = AppServerModule<{
  Model: ModelServer
  Msg: MsgServer
  MsgCmdOut: SpaceServerCmd<MsgToClient>
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Ctx: FlowServerCtx
  MsgEvtIn: SpaceServerEvt
}>
