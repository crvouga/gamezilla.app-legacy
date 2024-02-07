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
import { isErr } from "gamezilla/@SHARED/core";
import { FlowGrid, FlowGridUIEdit, FlowGridUIPlay } from "../../@SHARED/flow";
import { FlowClientCtx } from "../../@SHARED/flow-ctx";
import { IFlowPuzzleDb } from "../../@SHARED/flow-puzzle-db/flow-puzzle-db";
import { FlowPuzzle } from "../../@SHARED/flow-puzzle/flow-puzzle";
import { FlowPuzzleId } from "../../@SHARED/flow-puzzle/flow-puzzle-id";
import { PackCreate } from "./pack-create";
import { PuzzleCreate } from "./puzzle-create";
import { PuzzleDeleteForever } from "./puzzle-delete-forever";
import { PuzzleEditName } from "./puzzle-edit";
import { PuzzleList } from "./puzzle-list";
import { PuzzleSaveChanges } from "./puzzle-save-changes";
import { FlowPuzzleName } from "../../@SHARED/flow-puzzle/flow-puzzle-name";
import { PuzzleEditor } from "./puzzle-editor";
import { PuzzleEditorGame } from "./puzzle-editor/puzzle-editor.game";

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
  PackCreate.ModelClient;

export const initClient: ClientModule["init"] = {
  //
  ...PackCreate.initClient,
  //
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
  | PuzzleEditor.MsgClient
  //
  | PuzzleCreate.MsgClient
  | PuzzleEditName.MsgClient
  | PuzzleDeleteForever.MsgClient
  | PuzzleList.MsgClient
  | PuzzleSaveChanges.MsgClient
  //
  | PackCreate.MsgClient;

export type MsgServer =
  | PuzzleCreate.MsgServer
  | PuzzleSaveChanges.MsgServer
  | PuzzleDeleteForever.MsgServer
  | PuzzleList.MsgServer
  | PuzzleEditName.MsgServer
  //
  | PackCreate.MsgServer;

export type MsgToServer =
  | PuzzleCreate.MsgToServer
  | PuzzleSaveChanges.MsgToServer
  | PuzzleDeleteForever.MsgToServer
  | PuzzleEditName.MsgToServer
  | PuzzleList.MsgToServer
  //
  | PackCreate.MsgToServer;

export type MsgToClient =
  | PuzzleCreate.MsgToClient
  | PuzzleSaveChanges.MsgToClient
  | PuzzleEditName.MsgToClient
  | PuzzleDeleteForever.MsgToClient
  | PuzzleList.MsgToClient
  //
  | PackCreate.MsgToClient;

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
  | PuzzleEditor.MsgGame
  //
  | PackCreate.MsgGame
  //
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

export type ModelGameBuild = {
  t: "build";
  puzzle: FlowPuzzle;
  mode: BuildState;
  gridPlay: FlowGridUIPlay.Model;
  gridEdit: FlowGridUIEdit.Model;
};

export type ModelGameList = {
  t: "list";
};

export type ModelGameBase = {
  tab: ListTab;
};

export type ModelGame = ModelGameBase & (ModelGameList | ModelGameBuild);

export const toCurrentGrid = (modelGame: ModelGameBuild): FlowGrid.Model => {
  switch (modelGame.mode.t) {
    case "edit": {
      return FlowGridUIEdit.toCurrentGrid({
        model: modelGame.gridEdit,
      });
    }

    case "play": {
      return FlowGridUIPlay.toCurrentGrid({
        grid: FlowGridUIEdit.toCurrentGrid({
          model: modelGame.gridEdit,
        }),
        model: modelGame.gridPlay,
      });
    }
  }
};

export const initGame = (_input: { ctx: SpaceCtx }): ModelGame => {
  return {
    t: "list",
    tab: "puzzles",
  };
};

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
    PuzzleEditorGame.reducer,
    reducerBuildState,
    //
  ].reduce(
    (acc, reducer) => reducer({ ctx, msgGame, modelGame: acc }),
    modelGame
  );
};

const reducerBuildState = ({
  modelGame,
  msgGame,
}: {
  ctx: SpaceCtx;
  msgGame: MsgGame;
  modelGame: ModelGame;
}): ModelGame => {
  if (modelGame.t !== "build") {
    return modelGame;
  }
  switch (msgGame.t) {
    case "user-edited-puzzle-name": {
      if (msgGame.flowPuzzleId !== modelGame.puzzle.id) {
        return modelGame;
      }
      if (msgGame.edited.t === "err") {
        return modelGame;
      }
      if (!FlowPuzzleName.is(msgGame.newName)) {
        return modelGame;
      }
      const puzzleNew: FlowPuzzle = {
        ...modelGame.puzzle,
        name: msgGame.newName,
      };
      return {
        ...modelGame,
        puzzle: puzzleNew,
      };
    }

    case "user-saved-changes": {
      if (isErr(msgGame.saved)) {
        return modelGame;
      }
      return { ...modelGame, puzzle: msgGame.saved.value };
    }

    default: {
      return modelGame;
    }
  }
};
