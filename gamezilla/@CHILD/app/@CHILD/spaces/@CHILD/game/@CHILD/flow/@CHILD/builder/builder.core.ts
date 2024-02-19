import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2"
import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2"
import {
  SpaceClientEvent,
  SpaceCtx,
  SpaceServerCtx,
  SpaceServerEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { SpaceClientCmd } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-client-cmd"
import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd"
import { FlowGridUIEdit, FlowGridUIPlay } from "../../@SHARED/flow"
import { FlowClientCtx } from "../../@SHARED/flow-ctx"
import { IFlowPackDb } from "../../@SHARED/flow-pack-db"
import { FlowPack } from "../../@SHARED/flow-pack/flow-pack"
import { IFlowPuzzleDb } from "../../@SHARED/flow-puzzle-db/flow-puzzle-db"
import { FlowPuzzleList } from "../../@SHARED/flow-puzzle-list"
import { FlowPuzzle } from "../../@SHARED/flow-puzzle/flow-puzzle"
import { FlowPuzzleId } from "../../@SHARED/flow-puzzle/flow-puzzle-id"
import { Pack, PackGame } from "./pack"
import { PuzzleBuilder, PuzzleBuilderGame } from "./puzzle/builder"
import { PuzzleCreate, PuzzleCreateGame } from "./puzzle/create"
import {
  PuzzleDeleteForever,
  PuzzleDeleteForeverGame,
} from "./puzzle/delete-forever"
import { PuzzleEditGame, PuzzleEditName } from "./puzzle/edit"
import { PuzzeListGame, PuzzleList } from "./puzzle/list"
import { PuzzleSaveChanges, PuzzleSaveChangesGame } from "./puzzle/save-changes"
import { FlowPackList } from "../../@SHARED/flow-pack-list"

//
//
//
//
//
//
//
//

export type ClientModule = GameClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  MsgGame: MsgGame
  ModelGame: ModelGame
  Ctx: FlowClientCtx
  MsgOutCmd: SpaceClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>
  MsgInEvent: SpaceClientEvent
  MsgInCmd: null
  MsgOutEvent: null
}>

export type ServerModule = GameServerModule<{
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  MsgGame: MsgGame
  ModelGame: ModelGame
  Ctx: SpaceServerCtx
  MsgInCmd: null
  MsgInEvent: SpaceServerEvent
  Model: ModelServer
  Msg: MsgServer
  MsgOutCmd: SpaceServerCmd<MsgToClient>
  MsgOutEvent: null
  Deps: {
    FlowPuzzleDb: IFlowPuzzleDb
    FlowPackDb: IFlowPackDb
  }
}>

//
//
//
// Model
//
//
//

export const LIST_TABS = ["puzzles", "packs"] as const

type ListTab = (typeof LIST_TABS)[number]

type BaseModelClient = {
  puzzles: {
    [puzzleId: FlowPuzzleId]: FlowPuzzle
  }
  packs: {
    [packId: string]: FlowPack
  }
  flowPuzzleList: FlowPuzzleList.ModelClient
  flowPackList: FlowPackList.ModelClient
  opened?: "more" | "edit-name" | "delete-forever" | "unsaved-changes" | null
}

export type ModelClient = BaseModelClient &
  //
  PuzzleCreate.ModelClient &
  PuzzleList.ModelClient &
  PuzzleSaveChanges.ModelClient &
  PuzzleEditName.ModelClient &
  PuzzleDeleteForever.ModelClient &
  //
  Pack.ModelClient

export const initClient: ClientModule["init"] = {
  flowPuzzleList: FlowPuzzleList.initClient,
  flowPackList: FlowPackList.initClient,
  //
  packs: {},
  puzzles: {},
  //
  ...Pack.initClient,
  //
  ...PuzzleBuilder.initClient,
  ...PuzzleCreate.initClient,
  ...PuzzleList.initClient,
  ...PuzzleEditName.initClient,
  ...PuzzleDeleteForever.initClient,
}

export type ModelServer = {
  flowPackList: FlowPackList.ModelServer
}

export const initServer: ServerModule["init"] = {
  flowPackList: FlowPackList.initServer,
}

//
//
//
// Msg
//
//
//

type BaseMsgClient =
  | { t: "time-passed" }
  | { t: "user-changed-list-tab"; listTab: ListTab }
//

export type MsgClient =
  | BaseMsgClient
  //
  | { t: "flow-pack-list"; c: FlowPackList.MsgClient }
  | { t: "flow-puzzle-list"; c: FlowPuzzleList.MsgClient }
  //
  | PuzzleBuilder.MsgClient
  | PuzzleCreate.MsgClient
  | PuzzleEditName.MsgClient
  | PuzzleDeleteForever.MsgClient
  | PuzzleList.MsgClient
  | PuzzleSaveChanges.MsgClient
  //
  | Pack.MsgClient

export type MsgServer =
  //
  | { t: "flow-pack-list"; c: FlowPackList.MsgServer }
  | { t: "flow-puzzle-list"; c: FlowPuzzleList.MsgServer }
  //
  | PuzzleCreate.MsgServer
  | PuzzleSaveChanges.MsgServer
  | PuzzleDeleteForever.MsgServer
  | PuzzleList.MsgServer
  | PuzzleEditName.MsgServer
  //
  | Pack.MsgServer

export type MsgToServer =
  //
  | { t: "flow-pack-list"; c: FlowPackList.MsgToServer }
  | { t: "flow-puzzle-list"; c: FlowPuzzleList.MsgToServer }
  //
  | PuzzleCreate.MsgToServer
  | PuzzleSaveChanges.MsgToServer
  | PuzzleDeleteForever.MsgToServer
  | PuzzleEditName.MsgToServer
  | PuzzleList.MsgToServer
  //
  | Pack.MsgToServer

export type MsgToClient =
  //
  | { t: "flow-pack-list"; c: FlowPackList.MsgToClient }
  | { t: "flow-puzzle-list"; c: FlowPuzzleList.MsgToClient }
  //
  | PuzzleCreate.MsgToClient
  | PuzzleSaveChanges.MsgToClient
  | PuzzleEditName.MsgToClient
  | PuzzleDeleteForever.MsgToClient
  | PuzzleList.MsgToClient
  //
  | Pack.MsgToClient

//
//
//
//
//
//
//

type MsgGameBase = {
  t: "user-changed-list-tab"
  listTab: ListTab
}

export type MsgGame =
  | MsgGameBase
  //
  | Pack.MsgGame
  //
  | PuzzleBuilder.MsgGame
  | PuzzleList.MsgGame
  | PuzzleCreate.MsgGame
  | PuzzleEditName.MsgGame
  | PuzzleDeleteForever.MsgGame
  | PuzzleSaveChanges.MsgGame

type BuildState =
  | {
      t: "play"
    }
  | {
      t: "edit"
    }

export type ModelGamePuzzleBuilder = {
  t: "puzzle-builder"
  puzzle: FlowPuzzle
  mode: BuildState
  gridPlay: FlowGridUIPlay.Model
  gridEdit: FlowGridUIEdit.Model
}

export type ModelGamePackBuilder = {
  t: "pack-builder"
  pack: FlowPack
  opened:
    | { t: "puzzle-picker" }
    | { t: "puzzle"; index: number }
    | { t: "puzzle-grid"; pageIndex: number }
}

export type ModelGame = {
  opened: { t: "list" } | { t: "puzzle-builder" } | { t: "pack-builder" }
  listTab: ListTab
  //
  packBuilder: ModelGamePackBuilder | null
  //
  puzzleBuilder: ModelGamePuzzleBuilder | null
}

export const initGame = (_input: { ctx: SpaceCtx }): ModelGame => {
  return {
    opened: { t: "list" },
    listTab: "puzzles",
    packBuilder: null,
    puzzleBuilder: null,
  }
}

export type GameReducer = (input: {
  ctx: SpaceCtx
  msgGame: MsgGame
  modelGame: ModelGame
}) => ModelGame

export const reducer: GameReducer = ({ modelGame, msgGame, ctx }) => {
  return [
    PuzzleDeleteForeverGame.reducer,
    PuzzleBuilderGame.reducer,
    PuzzleCreateGame.reducer,
    PuzzeListGame.reducer,
    PuzzleEditGame.reducer,
    PuzzleSaveChangesGame.reducer,
    //
    PackGame.reducer,
    //
    listTabReducer,
  ].reduce(
    (acc, reducer) => reducer({ ctx, msgGame, modelGame: acc }),
    modelGame,
  )
}

const listTabReducer: GameReducer = ({ modelGame, msgGame }) => {
  switch (msgGame.t) {
    case "user-changed-list-tab": {
      return {
        ...modelGame,
        listTab: msgGame.listTab,
      }
    }
    default: {
      return modelGame
    }
  }
}
