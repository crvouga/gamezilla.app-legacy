import { err, ok, Result, exhaustive, Posix } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";
import {
  ColumnIndex,
  Columns,
  MoveResult,
  PlayerType,
  allColumnIndexes,
  EMPTY_COLUMNS,
  dropDisc,
  opposite,
  toStatus,
  toTurn,
  MoveProblem,
} from "../connect-four/connect-four";
import { EvtMeta } from "gamezilla/app/space/@SHARED/evt";

//
//
//
// Model
//
//
//

export type CoreModel = SetupModel | GameModel | GameOverModel;

export type SetupModel = {
  type: "setup";
  moveTimeLimit: MoveTimeLimit;
  players: {
    [playerType in PlayerType]: UserId | null;
  };
};

export type GameModel = {
  type: "game";
  moveTimeLimit: MoveTimeLimit;
  moveCountDown: number;
  columns: Columns;
  gameId: number;
  players: {
    [playerType in PlayerType]: UserId;
  };
};

export type GameOverModel = {
  type: "game-over";
  moveTimeLimit: MoveTimeLimit;
  columns: Columns;
  gameId: number;
  gameOver: GameOver;
  rematch: Rematch;
  players: {
    [playerType in PlayerType]: UserId;
  };
};

export type Rematch =
  | {
      type: "NotAsking";
    }
  | {
      type: "Asking";
      asker: PlayerType;
    };

export type GameOver =
  | {
      type: "Draw";
    }
  | {
      type: "Winner";
      winner: PlayerType;
    }
  | {
      type: "resignation";
      resigner: PlayerType;
    };

export const toGameOver = (model: CoreModel): GameOver | { type: "none" } => {
  if (model.type === "setup") {
    return { type: "none" };
  }

  const status = toStatus(model.columns);

  if (status.type === "Tie") {
    return { type: "Draw" };
  }

  if (status.type === "Winner") {
    return { type: "Winner", winner: status.winner };
  }

  return { type: "none" };
};

export type MoveTimeLimit = 5 | 7 | 9;

export const allMoveTimeLimit: {
  [moveTimeLimit in MoveTimeLimit]: MoveTimeLimit;
} = {
  "5": 5,
  "7": 7,
  "9": 9,
};

export const initShared = ({
  players,
}: {
  players: CoreModel["players"];
}): CoreModel => {
  return {
    type: "setup",
    moveTimeLimit: 7,
    players,
  };
};

export type ClientModel = CoreModel & {
  openedModal: "ConfirmResign" | "none";
  ghostIndex: ColumnIndex | "none";
};

export type ServerModel = CoreModel;

//
//
//
// Msg
//
//
//

export type ServerMsg = Tick;

export type ClientMsg =
  | Req
  | { t: "hovered-over-columns"; columnIndex: ColumnIndex }
  | { t: "clicked-resign"; userId: UserId }
  | { t: "close-modal" };

export type ToServer = Req;

export type ToClient = Res | TickDone | { t: "player-left"; model: CoreModel };

export type Req =
  //
  | { t: "stop-playing" }
  | { t: "start-playing"; playerType: PlayerType }
  | { t: "input-move-time-limit"; moveTimeLimit: MoveTimeLimit }
  | { t: "input-move"; columnIndex: ColumnIndex; userId: UserId }
  | { t: "start-game" }
  //
  | { t: "rematch-request" }
  | { t: "rematch-respond"; response: "Accept" | "Decline" }
  | { t: "rematch-cancel" }
  //
  | { t: "new-game" }
  | { t: "resign" };

export type Res = Req & { result: Result<string, CoreModel> };

export const handle = ({
  ctx,
  req,
  model,
}: {
  ctx: { currentUserId: UserId };
  req: Req;
  model: CoreModel;
}): Result<string, CoreModel> => {
  switch (req.t) {
    case "input-move": {
      if (model.type !== "game") {
        return err("not-in-game");
      }
      const { columnIndex } = req;

      const playerType = toPlayerType(ctx.currentUserId, model);

      if (!playerType) {
        return err("not-playing");
      }

      const result = dropDisc(model.columns, columnIndex, playerType);

      if (result.t === "err") {
        return result;
      }

      const modelNew = handleMoveResult(result, model);

      return ok(modelNew);
    }

    case "start-playing": {
      if (model.type !== "setup") {
        return err("not-in-setup");
      }

      const { playerType } = req;

      if (model.players[playerType] !== null) {
        return err("player-taken");
      }

      const playersNew = {
        [opposite[playerType]]:
          model.players[opposite[playerType]] === ctx.currentUserId
            ? null
            : model.players[opposite[playerType]],
        [playerType]: ctx.currentUserId,
      } as CoreModel["players"];

      const modelNew: CoreModel = { ...model, players: playersNew };

      return ok(modelNew);
    }

    case "input-move-time-limit": {
      if (model.type !== "setup") {
        return err("not-in-setup");
      }

      const { moveTimeLimit } = req;

      const playerType = toPlayerType(ctx.currentUserId, model);

      if (!playerType) {
        return err("not-playing");
      }

      const modelNew: CoreModel = {
        ...model,
        moveTimeLimit,
      };

      return ok(modelNew);
    }

    case "stop-playing": {
      if (model.type !== "setup") {
        return err("not-in-setup");
      }

      const playerType = toPlayerType(ctx.currentUserId, model);

      if (!playerType) {
        return err("not-playing");
      }

      const modelNew: CoreModel = {
        ...model,
        players: {
          ...model.players,
          [playerType]: null,
        },
      };

      return ok(modelNew);
    }

    case "start-game": {
      if (model.type !== "setup") {
        return err("not-in-setup");
      }

      const playerOne = model.players["player-one"];
      const playerTwo = model.players["player-two"];

      if (!playerOne || !playerTwo) {
        return err("missing-player");
      }

      const modelNew: CoreModel = {
        type: "game",
        columns: EMPTY_COLUMNS,
        moveTimeLimit: model.moveTimeLimit,
        moveCountDown: model.moveTimeLimit,
        gameId: 0,
        players: {
          "player-one": playerOne,
          "player-two": playerTwo,
        },
      };

      return ok(modelNew);
    }

    case "rematch-request": {
      if (model.type !== "game-over") {
        return err("not-game-over");
      }

      if (model.rematch.type === "Asking") {
        return err("already-asking");
      }

      const playerType = toPlayerType(ctx.currentUserId, model);

      if (!playerType) {
        return err("not-playing");
      }

      const modelNew: CoreModel = {
        ...model,
        rematch: { type: "Asking", asker: playerType },
      };

      return ok(modelNew);
    }

    case "rematch-respond": {
      if (model.type !== "game-over") {
        return err("not-game-over");
      }

      if (model.rematch.type === "NotAsking") {
        return err("not-asking");
      }

      const { response } = req;

      if (response === "Decline") {
        const modelNew: CoreModel = {
          ...model,
          rematch: { type: "NotAsking" },
        };

        return ok(modelNew);
      }

      const modelNew: CoreModel = {
        type: "game",
        columns: EMPTY_COLUMNS,
        moveCountDown: model.moveTimeLimit,
        gameId: model.gameId + 1,
        moveTimeLimit: model.moveTimeLimit,
        players: model.players,
      };

      return ok(modelNew);
    }

    case "new-game": {
      if (model.type !== "game-over") {
        return err("not-game-over");
      }

      const playerType = toPlayerType(ctx.currentUserId, model);

      if (!playerType) {
        return err("not-playing");
      }

      const modelNew: CoreModel = {
        type: "setup",
        moveTimeLimit: model.moveTimeLimit,
        players: model.players,
      };

      return ok(modelNew);
    }

    case "rematch-cancel": {
      if (model.type !== "game-over") {
        return err("not-game-over");
      }

      const playerType = toPlayerType(ctx.currentUserId, model);

      if (!playerType) {
        return err("not-playing");
      }

      if (model.rematch.type !== "Asking") {
        return err("not-asking");
      }

      if (model.rematch.asker !== playerType) {
        return err("not-asking");
      }

      const modelNew: CoreModel = {
        ...model,
        rematch: { type: "NotAsking" },
      };

      return ok(modelNew);
    }

    case "resign": {
      if (model.type !== "game") {
        return err("not-in-game");
      }

      const playerType = toPlayerType(ctx.currentUserId, model);

      if (!playerType) {
        return err("not-playing");
      }

      const modelNew: CoreModel = {
        type: "game-over",
        columns: model.columns,
        players: model.players,
        gameId: model.gameId,
        rematch: { type: "NotAsking" },
        moveTimeLimit: model.moveTimeLimit,
        gameOver: { type: "resignation", resigner: playerType },
      };

      return ok(modelNew);
    }

    default: {
      return exhaustive(req[0]);
    }
  }
};

export const toPlayerType = (
  userId: UserId,
  model: CoreModel
): PlayerType | null => {
  if (model.players["player-one"] === userId) {
    return "player-one";
  }

  if (model.players["player-two"] === userId) {
    return "player-two";
  }

  return null;
};

//
//
//
//
//

type Tick = { t: "tick" };
type TickDone = { t: "tick-done"; model: CoreModel };

export const tick = (model: CoreModel): CoreModel => {
  if (model.type !== "game") {
    return model;
  }

  const moveCountDownNew = Math.floor(Math.max(0, model.moveCountDown - 1));

  if (moveCountDownNew > 0) {
    const modelNew: CoreModel = {
      ...model,
      moveCountDown: moveCountDownNew,
    };

    return modelNew;
  }

  const turn = toTurn(model.columns);

  for (const columnIndex of shuffle(allColumnIndexes)) {
    const result = dropDisc(model.columns, columnIndex, turn);

    if (result.t === "err") {
      continue;
    }

    const modelNew = handleMoveResult(result, model);

    return modelNew;
  }

  return model;
};

const handleMoveResult = (
  result: MoveResult,
  model: GameModel
): GameModel | GameOverModel => {
  if (result.t === "err") {
    return model;
  }

  const columnsNew = result.value;

  const status = toStatus(columnsNew);

  if (status.type === "Playing") {
    const modelNew: CoreModel = {
      ...model,
      columns: columnsNew,
      moveCountDown: model.moveTimeLimit,
    };

    return modelNew;
  }

  const gameOver: GameOver =
    status.type === "Winner"
      ? { type: "Winner", winner: status.winner }
      : { type: "Draw" };

  const modelNew: CoreModel = {
    type: "game-over",
    moveTimeLimit: model.moveTimeLimit,
    players: model.players,
    columns: columnsNew,
    gameId: model.gameId,
    gameOver: gameOver,
    rematch: { type: "NotAsking" },
  };

  return modelNew;
};

const shuffle = <X>(xs: X[]): X[] => {
  return [...xs].sort(() => (Math.random() > 0.5 ? -1 : 1));
};

export type Evt =
  //
  | { t: "user-stopped-playing"; userId: UserId }
  | { t: "user-started-playing"; userId: UserId; playerType: PlayerType }
  | {
      t: "user-inputted-move-time-limit";
      userId: UserId;
      moveTimeLimit: MoveTimeLimit;
    }
  | { t: "user-dropped-disc"; columnIndex: ColumnIndex; userId: UserId }
  | { t: "user-started-game"; userId: UserId }
  //
  | { t: "user-requested-rematch"; userId: UserId }
  | {
      t: "user-responded-to-rematch-request";
      userId: UserId;
      response: "Accept" | "Decline";
    }
  | {
      t: "user-cancelled-rematch";
    }
  //
  | { t: "user-resigned" };

type EventError = { t: "not-playing" } | { t: "move"; c: MoveProblem };

export type State = (StateSetup | StateGame | StateGameOver) & {
  errors: {
    [eventId: string]: Evt & EvtMeta & { error: EventError };
  };
};

const addError = (
  state: State,
  event: Evt & EvtMeta,
  error: EventError
): State => {
  return {
    ...state,
    errors: {
      ...state.errors,
      [event.eventId]: { ...event, error },
    },
  };
};

export type StateSetup = {
  type: "setup";
  moveTimeLimit: MoveTimeLimit;
  players: {
    [playerType in PlayerType]: UserId | null;
  };
};

export type StateGame = {
  type: "game";
  moveTimeLimit: MoveTimeLimit;
  moveCountDown: number;
  columns: Columns;
  gameId: number;
  players: {
    [playerType in PlayerType]: UserId;
  };
};

export type StateGameOver = {
  type: "game-over";
  moveTimeLimit: MoveTimeLimit;
  columns: Columns;
  gameId: number;
  gameOver: GameOver;
  rematch: Rematch;
  players: {
    [playerType in PlayerType]: UserId;
  };
};

export const reducer = (state: State, event: Evt & EvtMeta): State => {
  switch (state.type) {
    case "setup": {
      switch (event.t) {
        case "user-started-playing": {
          if (state.players[event.playerType] !== null) {
            return addError(state, event, { t: "not-playing" });
          }

          return {
            ...state,
            players: {
              ...state.players,
              [event.playerType]: event.userId,
            },
          };
        }

        case "user-stopped-playing": {
          const playerType = toPlayerType(event.userId, state);

          if (!playerType) {
            return addError(state, event, { t: "not-playing" });
          }

          return {
            ...state,
            players: {
              ...state.players,
              [playerType]: null,
            },
          };
        }

        default: {
          return state;
        }
      }

      return state;
    }

    case "game-over": {
      return state;
    }

    case "setup": {
      return state;
    }
  }
  return state;
};
