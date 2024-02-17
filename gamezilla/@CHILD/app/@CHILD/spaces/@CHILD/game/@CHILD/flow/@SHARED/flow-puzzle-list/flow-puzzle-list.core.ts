import { RemoteResult } from "gamezilla/@SHARED/core"
import { IFlowPuzzleDb } from "../flow-puzzle-db"
import { FlowPuzzle } from "../flow-puzzle/flow-puzzle"
import { FlowPuzzleId } from "../flow-puzzle/flow-puzzle-id"
import { AppClientModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-client"
import {
  SpaceClientCtx,
  SpaceClientEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { SpaceClientCmd } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-client-cmd"
import { AppServerModule } from "gamezilla/@CHILD/app/@SHARED/architecture/app-server"
import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd"

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
  MsgInCmd: never
  MsgInEvent: SpaceClientEvent
  MsgOutCmd: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>
  MsgOutEvent: SpaceClientEvent
  ViewSlot: {
    fab: null
  }
}>

export type ServerModule = AppServerModule<{
  Deps: {
    FlowPuzzleDb: IFlowPuzzleDb
  }
  Model: ModelServer
  Msg: MsgServer
  MsgOutCmd: SpaceServerCmd<MsgToClient>
  MsgOutEvent: never
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Ctx: SpaceClientCtx
  MsgInCmd: never
  MsgInEvent: SpaceClientEvent
}>

//
//
//
//

export type ModelClient = {
  request: RemoteResult<string, null>
  puzzles: { [id: FlowPuzzleId]: FlowPuzzle }
}

export const initClient: ModelClient = {
  request: RemoteResult.notAsked,
  puzzles: {},
}

export type ModelServer = {}

export type MsgClient = { t: "flow-puzzle-list.user-observed-end-of-list" }

export type MsgServer = { t: "flow-puzzle-list.noop" }

export type MsgToServer = {
  t: "flow-puzzle-list.list-puzzles"
  input: ListPuzzlesInput
}

export type MsgToClient = {
  t: "flow-puzzle-list.listed-puzzle"
  listed: ListPuzzlesOutput
}

export type ListPuzzlesInput = Parameters<IFlowPuzzleDb["list"]>[0]

export type ListPuzzlesOutput = Awaited<ReturnType<IFlowPuzzleDb["list"]>>
