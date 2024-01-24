import { GameClientModule } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/architecture/game-client-v2";
import {
  SpaceClientEvent,
  SpaceCtx,
} from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/space";
import { ClientCmd } from "gamezilla/@CHILD/app/@SHARED/client";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { RemoteResult, Result } from "gamezilla/@SHARED/core";
import { FlowGrid, FlowGridUIEdit, FlowGridUIPlay } from "../../@SHARED/flow";
import { FlowClientCtx } from "../../@SHARED/flow-ctx";
import { IFlowPuzzleDb } from "../../@SHARED/flow-puzzle-db/flow-puzzle-db";
import { FlowPuzzle } from "../../@SHARED/flow-puzzle/flow-puzzle";
import { FlowPuzzleId } from "../../@SHARED/flow-puzzle/flow-puzzle-id";

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
  GameEvent: GameEvent;
  GameState: GameState;
  Ctx: FlowClientCtx;
  OutCmd: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>;
  InEvent: SpaceClientEvent;
  InCmd: null;
  OutEvent: null;
}>;

//
//
//
// Model
//
//
//

export type ClientModel = {
  listed: RemoteResult<string, null>;
  puzzles: {
    [puzzleId: FlowPuzzleId]: FlowPuzzle;
  };
};

export type ServerModel = {
  hasListedPuzzles: boolean;
};

//
//
//
// Msg
//
//
//

export type ClientMsg =
  | { t: "time-passed" }
  | GameEvent
  | { t: "user-observed-end-of-list" };

export type ServerMsg = { t: "time-passed" };

export type ListPuzzlesInput = Parameters<IFlowPuzzleDb["list"]>[0];

export type ListPuzzlesOutput = Awaited<ReturnType<IFlowPuzzleDb["list"]>>;

export type ToServer = { t: "list-puzzles"; input: ListPuzzlesInput };

export type ToClient =
  | { t: "listed-puzzle"; listed: ListPuzzlesOutput }
  | { t: "put-puzzle"; put: Result<string, null> };

//
//
//
//
//
//
//

export type GameEvent =
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
      t: "listed-puzzles";
      input: ListPuzzlesInput;
      output: ListPuzzlesOutput;
    }
  | {
      t: "user-created-new-puzzle";
      puzzle: FlowPuzzle;
    }
  | {
      t: "time-passed";
    }
  | {
      t: "user-exited-builder";
      userId: UserId;
    }
  | {
      t: "user-saved-changes";
      userId: UserId;
      puzzleId: FlowPuzzleId;
      puzzle: FlowPuzzle["puzzle"];
    };

type BuildState =
  | {
      t: "play";
    }
  | {
      t: "edit";
    };

export type GameStateBuild = {
  t: "build";
  puzzleId: FlowPuzzleId;
  mode: BuildState;
  gridPlay: FlowGridUIPlay.Model;
  gridEdit: FlowGridUIEdit.Model;
};

export type GameStateList = {
  t: "list";
};

export type BaseGameState = {
  puzzles: {
    [id: FlowPuzzleId]: FlowPuzzle;
  };
};

export type GameState = GameStateList | GameStateBuild;

export const toCurrentGrid = (state: GameStateBuild): FlowGrid.Model => {
  switch (state.mode.t) {
    case "edit": {
      return state.gridEdit.grid;
    }

    case "play": {
      return state.gridPlay.grid;
    }
  }
};

export const initState = (_input: { ctx: SpaceCtx }): GameState => {
  // const _grid = EMPTY_GRID;
  return {
    t: "list",
    // mode: { t: "edit" },
    // play: FlowGridUIPlay.init({ grid }),
    // edit: FlowGridUIEdit.init({ grid }),
  };
};
export const reducer = ({
  state,
  event,
  ctx,
}: {
  ctx: SpaceCtx;
  event: GameEvent;
  state: GameState;
}): GameState => {
  switch (state.t) {
    case "build": {
      return reducerBuildState({ ctx, event, state: state });
    }

    case "list": {
      return reducerListState({ ctx, event, state: state });
    }
  }
};

const reducerListState = ({
  state,
  event,
}: {
  ctx: SpaceCtx;
  event: GameEvent;
  state: GameStateList;
}): GameState => {
  switch (event.t) {
    case "listed-puzzles": {
      return state;
    }

    case "user-created-new-puzzle": {
      return {
        t: "build",
        gridEdit: FlowGridUIEdit.init({ grid: event.puzzle.puzzle.c }),
        mode: { t: "edit" },
        gridPlay: FlowGridUIPlay.init({ grid: event.puzzle.puzzle.c }),
        puzzleId: event.puzzle.id,
      };
    }

    case "user-saved-changes":
    case "user-exited-builder":
    case "time-passed":
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
  event,
  ctx,
}: {
  ctx: SpaceCtx;
  event: GameEvent;
  state: GameStateBuild;
}): GameState => {
  switch (event.t) {
    case "grid-ui-play": {
      return {
        ...state,
        gridPlay: FlowGridUIPlay.update({
          model: state.gridPlay,
          msg: event.c,
        }),
      };
    }

    case "grid-ui-edit": {
      const updated = FlowGridUIEdit.update({
        model: state.gridEdit,
        msg: event.c,
      });
      return {
        ...state,
        gridEdit: updated.model,
      };
    }

    case "user-changed-to-edit-mode": {
      if (event.userId !== ctx.space.hostId) {
        return state;
      }

      return { ...state, mode: { t: "edit" } };
    }

    case "user-changed-to-play-mode": {
      return {
        ...state,
        gridPlay: {
          ...state.gridPlay,
          grid: FlowGridUIEdit.toGrid(state.gridEdit),
        },
        mode: { t: "play" },
      };
    }

    case "user-exited-builder": {
      if (event.userId !== ctx.space.hostId) {
        return state;
      }

      return {
        t: "list",
      };
    }

    case "user-saved-changes": {
      return state;
    }

    case "time-passed":
    case "listed-puzzles":
    case "user-created-new-puzzle": {
      return state;
    }
  }
};
