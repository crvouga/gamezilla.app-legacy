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
import { PuzzleCreate } from "./puzzle-create";
import { PuzzleDeleteForever } from "./puzzle-delete-forever";
import { PuzzleEditName } from "./puzzle-edit-name";
import { PuzzleList } from "./puzzle-list";
import { PuzzleSaveChanges } from "./puzzle-save-changes";

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
  PuzzleCreate.ModelClient &
  PuzzleList.ModelClient &
  PuzzleSaveChanges.ModelClient &
  PuzzleEditName.ModelClient &
  PuzzleDeleteForever.ModelClient;

export type ModelServer = {};

//
//
//
// Msg
//
//
//

export type MsgClient =
  // | { t: "game-event"; c: MsgGame }
  | { t: "user-selected-list-tab"; listTab: ListTab }
  //
  | { t: "puzzle.editor.user-clicked-more-button" }
  | { t: "puzzle.editor.user-closed-more-drawer" }
  | { t: "puzzle.editor.user-clicked-exit-button" }
  | { t: "puzzle.editor.flow-grid-ui-edit"; c: FlowGridUIEdit.Msg }
  | { t: "puzzle.editor.flow-grid-ui-play"; c: FlowGridUIPlay.Msg }
  | { t: "puzzle.editor.user-clicked-edit-mode-button" }
  | { t: "puzzle.editor.user-clicked-play-mode-button" }
  //
  | PuzzleCreate.MsgClient
  | PuzzleEditName.MsgClient
  | PuzzleDeleteForever.MsgClient
  | PuzzleList.MsgClient
  | PuzzleSaveChanges.MsgClient;

export type MsgServer =
  | PuzzleCreate.MsgServer
  | PuzzleSaveChanges.MsgServer
  | PuzzleDeleteForever.MsgServer
  | PuzzleList.MsgServer
  | PuzzleEditName.MsgServer;

export type MsgToServer =
  | PuzzleCreate.MsgToServer
  | PuzzleSaveChanges.MsgToServer
  | PuzzleDeleteForever.MsgToServer
  | PuzzleEditName.MsgToServer
  | PuzzleList.MsgToServer;

export type MsgToClient =
  | PuzzleCreate.MsgToClient
  | PuzzleSaveChanges.MsgToClient
  | PuzzleEditName.MsgToClient
  | PuzzleDeleteForever.MsgToClient
  | PuzzleList.MsgToClient;

//
//
//
//
//
//
//

export type MsgGame =
  | PuzzleList.MsgGame
  | PuzzleCreate.MsgGame
  | PuzzleEditName.MsgGame
  | PuzzleDeleteForever.MsgGame
  | PuzzleSaveChanges.MsgGame
  | {
      t: "grid-ui-play";
      c: FlowGridUIPlay.Msg;
    }
  | {
      t: "grid-ui-edit";
      c: FlowGridUIEdit.Msg;
    }
  | {
      t: "user-changed-to-edit-mode";
      userId: UserId;
    }
  | {
      t: "user-changed-to-play-mode";
      userId: UserId;
    }
  | {
      t: "user-exited-builder";
      userId: UserId;
    }
  | {
      t: "user-opened-puzzle";
      userId: UserId;
      puzzle: FlowPuzzle;
    };

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

export type ModelGame = ModelGameList | ModelGameBuild;

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
  switch (modelGame.t) {
    case "build": {
      return reducerBuildState({ ctx, msgGame, modelGame: modelGame });
    }

    case "list": {
      return reducerListState({ ctx, msgGame, modelGame: modelGame });
    }
  }
};

const reducerListState = ({
  modelGame,
  msgGame,
}: {
  ctx: SpaceCtx;
  msgGame: MsgGame;
  modelGame: ModelGameList;
}): ModelGame => {
  switch (msgGame.t) {
    case "user-created-puzzle": {
      if (isErr(msgGame.created)) {
        return modelGame;
      }
      const puzzleNew = msgGame.created.value;
      return {
        t: "build",
        mode: { t: "edit" },
        gridEdit: FlowGridUIEdit.init({ grid: puzzleNew.puzzle.c }),
        gridPlay: FlowGridUIPlay.init({ grid: puzzleNew.puzzle.c }),
        puzzle: puzzleNew,
      };
    }

    case "user-opened-puzzle": {
      return {
        t: "build",
        gridEdit: FlowGridUIEdit.init({ grid: msgGame.puzzle.puzzle.c }),
        gridPlay: FlowGridUIPlay.init({ grid: msgGame.puzzle.puzzle.c }),
        mode: { t: "edit" },
        puzzle: msgGame.puzzle,
      };
    }

    case "user-edited-puzzle-name":
    case "user-deleted-puzzle":
    case "listed-puzzles":
    case "user-saved-changes":
    case "user-exited-builder":
    case "user-changed-to-edit-mode":
    case "user-changed-to-play-mode":
    case "grid-ui-play":
    case "grid-ui-edit": {
      return modelGame;
    }
  }
};

const reducerBuildState = ({
  modelGame,
  msgGame,
  ctx,
}: {
  ctx: SpaceCtx;
  msgGame: MsgGame;
  modelGame: ModelGameBuild;
}): ModelGame => {
  switch (msgGame.t) {
    case "grid-ui-play": {
      const currentGrid = FlowGridUIEdit.toCurrentGrid({
        model: modelGame.gridEdit,
      });

      const updated = FlowGridUIPlay.update({
        model: modelGame.gridPlay,
        msg: msgGame.c,
        grid: currentGrid,
      });

      return {
        ...modelGame,
        gridPlay: updated,
      };
    }

    case "grid-ui-edit": {
      const updated = FlowGridUIEdit.update({
        model: modelGame.gridEdit,
        msg: msgGame.c,
        grid: modelGame.puzzle.puzzle.c,
      });

      return {
        ...modelGame,
        gridEdit: updated.model,
      };
    }

    case "user-changed-to-edit-mode": {
      if (msgGame.userId !== ctx.space.hostId) {
        return modelGame;
      }

      return { ...modelGame, mode: { t: "edit" } };
    }

    case "user-changed-to-play-mode": {
      const initial = FlowGridUIPlay.init({
        grid: FlowGridUIEdit.toCurrentGrid({
          model: modelGame.gridEdit,
        }),
      });
      return {
        ...modelGame,
        gridPlay: initial,
        mode: { t: "play" },
      };
    }

    case "user-exited-builder": {
      if (msgGame.userId !== ctx.space.hostId) {
        return modelGame;
      }

      return {
        t: "list",
      };
    }

    case "user-deleted-puzzle": {
      return { t: "list" };
    }

    case "user-edited-puzzle-name": {
      if (msgGame.flowPuzzleId !== modelGame.puzzle.id) {
        return modelGame;
      }
      if (msgGame.edited.t === "err") {
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
    case "user-opened-puzzle":
    case "user-created-puzzle":
    case "listed-puzzles": {
      return modelGame;
    }
  }
};
