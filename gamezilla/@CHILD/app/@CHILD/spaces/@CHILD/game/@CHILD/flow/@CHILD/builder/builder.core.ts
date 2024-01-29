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
  Model: ClientModel;
  Msg: ClientMsg;
  ToClient: ToClient;
  ToServer: ToServer;
  GameMsg: GameMsg;
  GameModel: GameModel;
  Ctx: FlowClientCtx;
  OutCmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
  InEvent: SpaceClientEvent;
  InCmd: null;
  OutEvent: null;
}>;

export type ServerModule = GameServerModule<{
  ToClient: ToClient;
  ToServer: ToServer;
  GameMsg: GameMsg;
  GameModel: GameModel;
  Ctx: SpaceServerCtx;
  InCmd: null;
  InEvent: SpaceServerEvent;
  Model: ServerModel;
  Msg: ServerMsg;
  OutCmd: SpaceServerCmd<ToClient>;
  OutEvent: null;
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

type BaseClientModel = {
  listTab: ListTab;
  puzzles: {
    [puzzleId: FlowPuzzleId]: FlowPuzzle;
  };
  opened?: "more" | "edit-name" | "delete-forever" | "unsaved-changes" | null;
};

export type ClientModel = BaseClientModel &
  PuzzleCreate.ClientModel &
  PuzzleList.ClientModel &
  PuzzleSaveChanges.ClientModel &
  PuzzleEditName.ClientModel &
  PuzzleDeleteForever.ClientModel;

export type ServerModel = {};

//
//
//
// Msg
//
//
//

export type ClientMsg =
  // | { t: "game-event"; c: GameMsg }
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
  | PuzzleCreate.ClientMsg
  | PuzzleEditName.ClientMsg
  | PuzzleDeleteForever.ClientMsg
  | PuzzleList.ClientMsg
  | PuzzleSaveChanges.ClientMsg;

export type ServerMsg =
  | PuzzleCreate.ServerMsg
  | PuzzleSaveChanges.ServerMsg
  | PuzzleDeleteForever.ServerMsg
  | PuzzleList.ServerMsg
  | PuzzleEditName.ServerMsg;

export type ToServer =
  | PuzzleCreate.ToServer
  | PuzzleSaveChanges.ToServer
  | PuzzleDeleteForever.ToServer
  | PuzzleEditName.ToServer
  | PuzzleList.ToServer;

export type ToClient =
  | PuzzleCreate.ToClient
  | PuzzleSaveChanges.ToClient
  | PuzzleEditName.ToClient
  | PuzzleDeleteForever.ToClient
  | PuzzleList.ToClient;

//
//
//
//
//
//
//

export type GameMsg =
  | PuzzleList.GameMsg
  | PuzzleCreate.GameMsg
  | PuzzleEditName.GameMsg
  | PuzzleDeleteForever.GameMsg
  | PuzzleSaveChanges.GameMsg
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

export type GameModelBuild = {
  t: "build";
  puzzle: FlowPuzzle;
  mode: BuildState;
  gridPlay: FlowGridUIPlay.Model;
  gridEdit: FlowGridUIEdit.Model;
};

export type GameModelList = {
  t: "list";
};

export type GameModel = GameModelList | GameModelBuild;

export const toCurrentGrid = (state: GameModelBuild): FlowGrid.Model => {
  switch (state.mode.t) {
    case "edit": {
      return FlowGridUIEdit.toCurrentGrid({
        model: state.gridEdit,
      });
    }

    case "play": {
      return FlowGridUIPlay.toCurrentGrid({
        grid: FlowGridUIEdit.toCurrentGrid({
          model: state.gridEdit,
        }),
        model: state.gridPlay,
      });
    }
  }
};

export const initGame = (_input: { ctx: SpaceCtx }): GameModel => {
  return {
    t: "list",
  };
};
export const reducer = ({
  state,
  msgEvent,
  ctx,
}: {
  ctx: SpaceCtx;
  msgEvent: GameMsg;
  state: GameModel;
}): GameModel => {
  switch (state.t) {
    case "build": {
      return reducerBuildState({ ctx, msgEvent, state: state });
    }

    case "list": {
      return reducerListState({ ctx, msgEvent, state: state });
    }
  }
};

const reducerListState = ({
  state,
  msgEvent,
}: {
  ctx: SpaceCtx;
  msgEvent: GameMsg;
  state: GameModelList;
}): GameModel => {
  switch (msgEvent.t) {
    case "user-created-puzzle": {
      if (isErr(msgEvent.created)) {
        return state;
      }
      const puzzleNew = msgEvent.created.value;
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
        gridEdit: FlowGridUIEdit.init({ grid: msgEvent.puzzle.puzzle.c }),
        gridPlay: FlowGridUIPlay.init({ grid: msgEvent.puzzle.puzzle.c }),
        mode: { t: "edit" },
        puzzle: msgEvent.puzzle,
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
      return state;
    }
  }
};

const reducerBuildState = ({
  state,
  msgEvent,
  ctx,
}: {
  ctx: SpaceCtx;
  msgEvent: GameMsg;
  state: GameModelBuild;
}): GameModel => {
  switch (msgEvent.t) {
    case "grid-ui-play": {
      const currentGrid = FlowGridUIEdit.toCurrentGrid({
        model: state.gridEdit,
      });

      const updated = FlowGridUIPlay.update({
        model: state.gridPlay,
        msg: msgEvent.c,
        grid: currentGrid,
      });

      return {
        ...state,
        gridPlay: updated,
      };
    }

    case "grid-ui-edit": {
      const updated = FlowGridUIEdit.update({
        model: state.gridEdit,
        msg: msgEvent.c,
        grid: state.puzzle.puzzle.c,
      });

      return {
        ...state,
        gridEdit: updated.model,
      };
    }

    case "user-changed-to-edit-mode": {
      if (msgEvent.userId !== ctx.space.hostId) {
        return state;
      }

      return { ...state, mode: { t: "edit" } };
    }

    case "user-changed-to-play-mode": {
      const initial = FlowGridUIPlay.init({
        grid: FlowGridUIEdit.toCurrentGrid({
          model: state.gridEdit,
        }),
      });
      return {
        ...state,
        gridPlay: initial,
        mode: { t: "play" },
      };
    }

    case "user-exited-builder": {
      if (msgEvent.userId !== ctx.space.hostId) {
        return state;
      }

      return {
        t: "list",
      };
    }

    case "user-deleted-puzzle": {
      return { t: "list" };
    }

    case "user-edited-puzzle-name": {
      if (msgEvent.flowPuzzleId !== state.puzzle.id) {
        return state;
      }
      if (msgEvent.edited.t === "err") {
        return state;
      }
      const puzzleNew: FlowPuzzle = {
        ...state.puzzle,
        name: msgEvent.newName,
      };
      return {
        ...state,
        puzzle: puzzleNew,
      };
    }

    case "user-saved-changes": {
      if (isErr(msgEvent.saved)) {
        return state;
      }
      return { ...state, puzzle: msgEvent.saved.value };
    }
    case "user-opened-puzzle":
    case "user-created-puzzle":
    case "listed-puzzles": {
      return state;
    }
  }
};
