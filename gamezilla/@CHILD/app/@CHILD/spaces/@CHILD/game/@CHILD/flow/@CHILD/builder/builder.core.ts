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
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { FlowGridUIEdit, FlowGridUIPlay } from "../../@SHARED/flow";
import { FlowClientCtx } from "../../@SHARED/flow-ctx";
import { IFlowPuzzleDb } from "../../@SHARED/flow-puzzle-db/flow-puzzle-db";
import { FlowPuzzle } from "../../@SHARED/flow-puzzle/flow-puzzle";
import { FlowPuzzleId } from "../../@SHARED/flow-puzzle/flow-puzzle-id";
import { PackCreate } from "./pack/create";
import { PuzzleCreate } from "./puzzle/create";
import { PuzzleCreateGame } from "./puzzle/create/puzzle-create.game";
import { PuzzleDeleteForever } from "./puzzle/delete-forever";
import { PuzzleEditName } from "./puzzle/edit";
import { PuzzleEditGame } from "./puzzle/edit/puzzle-edit.game";
import { PuzzleBuilder } from "./puzzle/builder";
import { PuzzleBuilderGame } from "./puzzle/builder/puzzle-builder.game";
import { PuzzleList } from "./puzzle/list";
import { PuzzeListGame } from "./puzzle/list/puzzle-list.game";
import { PuzzleSaveChanges } from "./puzzle/save-changes";
import { PuzzleSaveChangesGame } from "./puzzle/save-changes/puzzle-save-changes.game";
import { PuzzleDeleteForeverGame } from "./puzzle/delete-forever/puzzle-delete-forever.game";
import { IFlowPackDb } from "../../@SHARED/flow-pack-db";
import { FlowPack } from "../../@SHARED/flow-pack/flow-pack";
import { PackCreateGame } from "./pack/create/pack-create.game";
import { PackBuilder } from "./pack/builder";

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
  listTab: ListTab;
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
  listTab: "puzzles",
};

export type ModelServer = {};

//
//
//
// Msg
//
//
//

type BaseMsgClient = { t: "user-selected-list-tab"; listTab: ListTab };
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

type MsgGameBase =
  | {
      t: "user-opened-puzzle";
      userId: UserId;
      puzzle: FlowPuzzle;
    }
  | {
      t: "user-changed-tab";
      tab: ListTab;
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
  tab: ListTab;
};

export type ModelGame = ModelGameBase &
  (ModelGameList | ModelGamePuzzleBuilder | ModelGamePackBuilder);

export const initGame = (_input: { ctx: SpaceCtx }): ModelGame => {
  return {
    t: "list",
    tab: "puzzles",
  };
};

export type GameReducer = (input: {
  ctx: SpaceCtx;
  msgGame: MsgGame;
  modelGame: ModelGame;
}) => ModelGame;

export const reducer = ({
  modelGame,
  msgGame,
  ctx,
}: {
  ctx: SpaceCtx;
  msgGame: MsgGame;
  modelGame: ModelGame;
}): ModelGame => {
  return [
    PuzzleDeleteForeverGame.reducer,
    PuzzleBuilderGame.reducer,
    PuzzleCreateGame.reducer,
    PuzzeListGame.reducer,
    PuzzleEditGame.reducer,
    PuzzleSaveChangesGame.reducer,
    //
    PackCreateGame.reducer,
  ].reduce(
    (acc, reducer) => reducer({ ctx, msgGame, modelGame: acc }),
    modelGame
  );
};
