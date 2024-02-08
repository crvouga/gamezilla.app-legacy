import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import { GameServerModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-server-v2";
import {
  SpaceClientEvent,
  SpaceCtx,
  SpaceServerCtx,
  SpaceServerEvent,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { SpaceServerCmd } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd";
import { ClientCmd } from "gamezilla/@CHILD/app/@SHARED/client";
import { FlowGridUIEdit, FlowGridUIPlay } from "../../@SHARED/flow";
import { FlowClientCtx } from "../../@SHARED/flow-ctx";
import { IFlowPackDb } from "../../@SHARED/flow-pack-db";
import { FlowPack } from "../../@SHARED/flow-pack/flow-pack";
import { IFlowPuzzleDb } from "../../@SHARED/flow-puzzle-db/flow-puzzle-db";
import { FlowPuzzle } from "../../@SHARED/flow-puzzle/flow-puzzle";
import { FlowPuzzleId } from "../../@SHARED/flow-puzzle/flow-puzzle-id";
import { PackBuilder, PackBuilderGame } from "./pack/builder";
import { PackCreate, PackCreateGame } from "./pack/create";
import { PuzzleBuilder, PuzzleBuilderGame } from "./puzzle/builder";
import { PuzzleCreate, PuzzleCreateGame } from "./puzzle/create";
import {
  PuzzleDeleteForever,
  PuzzleDeleteForeverGame,
} from "./puzzle/delete-forever";
import { PuzzleEditGame, PuzzleEditName } from "./puzzle/edit";
import { PuzzeListGame, PuzzleList } from "./puzzle/list";
import {
  PuzzleSaveChanges,
  PuzzleSaveChangesGame,
} from "./puzzle/save-changes";

//
//
//
//
//
//
//
//

export type ClientModule = GameClientModule<{
  Model: ModelClient;
  Msg: MsgClient;
  MsgToClient: MsgToClient;
  MsgToServer: MsgToServer;
  MsgGame: MsgGame;
  ModelGame: ModelGame;
  Ctx: FlowClientCtx;
  MsgOutCmd: ClientCmd<{ MsgToServer: MsgToServer; MsgClient: MsgClient }>;
  MsgInEvent: SpaceClientEvent;
  MsgInCmd: null;
  MsgOutEvent: null;
}>;

export type ServerModule = GameServerModule<{
  MsgToClient: MsgToClient;
  MsgToServer: MsgToServer;
  MsgGame: MsgGame;
  ModelGame: ModelGame;
  Ctx: SpaceServerCtx;
  MsgInCmd: null;
  MsgInEvent: SpaceServerEvent;
  Model: ModelServer;
  Msg: MsgServer;
  MsgOutCmd: SpaceServerCmd<MsgToClient>;
  MsgOutEvent: null;
  Deps: {
    FlowPuzzleDb: IFlowPuzzleDb;
    FlowPackDb: IFlowPackDb;
  };
}>;

//
//
//
// Model
//
//
//

export const LIST_TABS = ["puzzles", "packs"] as const;

type ListTab = (typeof LIST_TABS)[number];

type BaseModelClient = {
  puzzles: {
    [puzzleId: FlowPuzzleId]: FlowPuzzle;
  };
  opened?: "more" | "edit-name" | "delete-forever" | "unsaved-changes" | null;
};

export type ModelClient = BaseModelClient &
  //
  PuzzleCreate.ModelClient &
  PuzzleList.ModelClient &
  PuzzleSaveChanges.ModelClient &
  PuzzleEditName.ModelClient &
  PuzzleDeleteForever.ModelClient &
  //
  PackCreate.ModelClient &
  PackBuilder.ModelClient;

export const initClient: ClientModule["init"] = {
  //
  ...PackBuilder.initClient,
  ...PackCreate.initClient,
  //
  ...PuzzleBuilder.initClient,
  ...PuzzleCreate.initClient,
  ...PuzzleList.initClient,
  ...PuzzleEditName.initClient,
  ...PuzzleDeleteForever.initClient,
  //
  puzzles: {},
};

export type ModelServer = {};

//
//
//
// Msg
//
//
//

type BaseMsgClient =
  | { t: "time-passed" }
  | { t: "user-changed-list-tab"; listTab: ListTab };
//

export type MsgClient =
  | BaseMsgClient
  //
  | PuzzleBuilder.MsgClient
  | PuzzleCreate.MsgClient
  | PuzzleEditName.MsgClient
  | PuzzleDeleteForever.MsgClient
  | PuzzleList.MsgClient
  | PuzzleSaveChanges.MsgClient
  //
  | PackCreate.MsgClient
  | PackBuilder.MsgClient;

export type MsgServer =
  | PuzzleCreate.MsgServer
  | PuzzleSaveChanges.MsgServer
  | PuzzleDeleteForever.MsgServer
  | PuzzleList.MsgServer
  | PuzzleEditName.MsgServer
  //
  | PackCreate.MsgServer
  | PackBuilder.MsgServer;

export type MsgToServer =
  | PuzzleCreate.MsgToServer
  | PuzzleSaveChanges.MsgToServer
  | PuzzleDeleteForever.MsgToServer
  | PuzzleEditName.MsgToServer
  | PuzzleList.MsgToServer
  //
  | PackCreate.MsgToServer
  | PackBuilder.MsgToServer;

export type MsgToClient =
  | PuzzleCreate.MsgToClient
  | PuzzleSaveChanges.MsgToClient
  | PuzzleEditName.MsgToClient
  | PuzzleDeleteForever.MsgToClient
  | PuzzleList.MsgToClient
  //
  | PackCreate.MsgToClient
  | PackBuilder.MsgToClient;

//
//
//
//
//
//
//

type MsgGameBase = {
  t: "user-changed-list-tab";
  listTab: ListTab;
};

export type MsgGame =
  | MsgGameBase
  //
  | PackCreate.MsgGame
  | PackBuilder.MsgGame
  //
  | PuzzleBuilder.MsgGame
  | PuzzleList.MsgGame
  | PuzzleCreate.MsgGame
  | PuzzleEditName.MsgGame
  | PuzzleDeleteForever.MsgGame
  | PuzzleSaveChanges.MsgGame;

type BuildState =
  | {
      t: "play";
    }
  | {
      t: "edit";
    };

export type ModelGamePuzzleBuilder = {
  t: "puzzle-builder";
  puzzle: FlowPuzzle;
  mode: BuildState;
  gridPlay: FlowGridUIPlay.Model;
  gridEdit: FlowGridUIEdit.Model;
};

export type ModelGamePackBuilder = {
  t: "pack-builder";
  pack: FlowPack;
};

export type ModelGameList = {
  t: "list";
};

export type ModelGameBase = {
  listTab: ListTab;
};

export type ModelGame = ModelGameBase &
  (ModelGameList | ModelGamePuzzleBuilder | ModelGamePackBuilder);

export const initGame = (_input: { ctx: SpaceCtx }): ModelGame => {
  return {
    t: "list",
    listTab: "puzzles",
  };
};

export type GameReducer = (input: {
  ctx: SpaceCtx;
  msgGame: MsgGame;
  modelGame: ModelGame;
}) => ModelGame;

export const reducer: GameReducer = ({ modelGame, msgGame, ctx }) => {
  return [
    PuzzleDeleteForeverGame.reducer,
    PuzzleBuilderGame.reducer,
    PuzzleCreateGame.reducer,
    PuzzeListGame.reducer,
    PuzzleEditGame.reducer,
    PuzzleSaveChangesGame.reducer,
    //
    PackCreateGame.reducer,
    PackBuilderGame.reducer,
    //
    listTabReducer,
  ].reduce(
    (acc, reducer) => reducer({ ctx, msgGame, modelGame: acc }),
    modelGame
  );
};

const listTabReducer: GameReducer = ({ modelGame, msgGame }) => {
  switch (msgGame.t) {
    case "user-changed-list-tab": {
      return {
        ...modelGame,
        listTab: msgGame.listTab,
      };
    }
    default: {
      return modelGame;
    }
  }
};
