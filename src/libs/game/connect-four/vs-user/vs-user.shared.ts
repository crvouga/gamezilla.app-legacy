import { exhaustive, Result } from "@gamezilla/shared/core";
import { UserId } from "@gamezilla/shared/app";
import {
  allColumnIndexes,
  ColumnIndex,
  Columns,
  emptyColumns,
  move,
  MoveResult,
  opposite,
  PlayerType,
  toStatus,
  toTurn,
} from "../connect-four/connect-four";
const { Err, Ok } = Result;
//
//
//
// Model
//
//
//

export type SharedModel = SetupModel | GameModel | GameOverModel;

export type SetupModel = {
  type: "setup";
  moveTimeLimit: MoveTimeLimit;
  PlayerOne: UserId | "none";
  PlayerTwo: UserId | "none";
};

export type GameModel = {
  type: "game";
  PlayerOne: UserId;
  PlayerTwo: UserId;
  moveTimeLimit: MoveTimeLimit;
  moveCountDown: number;
  columns: Columns;
};

export type GameOverModel = {
  type: "game-over";
  PlayerOne: UserId;
  PlayerTwo: UserId;
  moveTimeLimit: MoveTimeLimit;
  columns: Columns;
  gameOver: GameOver;
  rematch: Rematch;
};

type Rematch =
  | {
      type: "NotAsking";
    }
  | {
      type: "Asking";
      asker: PlayerType;
    };

type GameOver =
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

export const toGameOver = (model: SharedModel): GameOver | { type: "none" } => {
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
  PlayerOne,
  PlayerTwo,
}: Pick<SharedModel, "PlayerOne" | "PlayerTwo">): SharedModel => {
  return {
    type: "setup",
    moveTimeLimit: 7,
    PlayerOne,
    PlayerTwo,
  };
};

export type ClientModel = SharedModel & {
  openedModal: "ConfirmResign" | "none";
  ghostIndex: ColumnIndex | "none";
};

export type ServerModel = SharedModel;

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

export type ToClient =
  | Res
  | TickDone
  | { t: "player-left"; model: SharedModel };

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

export type Res = Req & { result: Result<string, SharedModel> };

export const handle = ({
  ctx,
  req,
  model,
}: {
  ctx: { currentUserId: UserId };
  req: Req;
  model: SharedModel;
}): Result<string, SharedModel> => {
  switch (req.t) {
    case "input-move": {
      if (model.type !== "game") {
        return Err("not-in-game");
      }
      const { columnIndex } = req;

      const playerType = toPlayerType(ctx.currentUserId, model);

      if (playerType === "none") {
        return Err("not-playing");
      }

      const result = move(model.columns, columnIndex, playerType);

      if (result.t === "err") {
        return result;
      }

      const modelNew = handleMoveResult(result, model);

      return Ok(modelNew);
    }

    case "start-playing": {
      if (model.type !== "setup") {
        return Err("not-in-setup");
      }

      const { playerType } = req;

      if (model[playerType] !== "none") {
        return Err("player-taken");
      }

      const modelNew: SharedModel = {
        ...model,
        [opposite[playerType]]:
          model[opposite[playerType]] === ctx.currentUserId
            ? "none"
            : model[opposite[playerType]],
        [playerType]: ctx.currentUserId,
      };

      return Ok(modelNew);
    }

    case "input-move-time-limit": {
      if (model.type !== "setup") {
        return Err("not-in-setup");
      }

      const { moveTimeLimit } = req;

      const playerType = toPlayerType(ctx.currentUserId, model);

      if (playerType === "none") {
        return Err("not-playing");
      }

      const modelNew: SharedModel = {
        ...model,
        moveTimeLimit,
      };

      return Ok(modelNew);
    }

    case "stop-playing": {
      if (model.type !== "setup") {
        return Err("not-in-setup");
      }

      const playerType = toPlayerType(ctx.currentUserId, model);

      if (playerType === "none") {
        return Err("not-playing");
      }

      const modelNew: SharedModel = {
        ...model,
        [playerType]: "none",
      };

      return Ok(modelNew);
    }

    case "start-game": {
      if (model.type !== "setup") {
        return Err("not-in-setup");
      }

      if (model.PlayerOne === "none" || model.PlayerTwo === "none") {
        return Err("missing-player");
      }

      const modelNew: SharedModel = {
        type: "game",
        columns: emptyColumns,
        moveTimeLimit: model.moveTimeLimit,
        moveCountDown: model.moveTimeLimit,
        PlayerOne: model.PlayerOne,
        PlayerTwo: model.PlayerTwo,
      };

      return Ok(modelNew);
    }

    case "rematch-request": {
      if (model.type !== "game-over") {
        return Err("not-game-over");
      }

      if (model.rematch.type === "Asking") {
        return Err("already-asking");
      }

      const playerType = toPlayerType(ctx.currentUserId, model);

      if (playerType === "none") {
        return Err("not-playing");
      }

      const modelNew: SharedModel = {
        ...model,
        rematch: { type: "Asking", asker: playerType },
      };

      return Ok(modelNew);
    }

    case "rematch-respond": {
      if (model.type !== "game-over") {
        return Err("not-game-over");
      }

      if (model.rematch.type === "NotAsking") {
        return Err("not-asking");
      }

      const { response } = req;

      if (response === "Decline") {
        const modelNew: SharedModel = {
          ...model,
          rematch: { type: "NotAsking" },
        };

        return Ok(modelNew);
      }

      const modelNew: SharedModel = {
        type: "game",
        columns: emptyColumns,
        moveCountDown: model.moveTimeLimit,
        moveTimeLimit: model.moveTimeLimit,
        PlayerOne: model.PlayerOne,
        PlayerTwo: model.PlayerTwo,
      };

      return Ok(modelNew);
    }

    case "new-game": {
      if (model.type !== "game-over") {
        return Err("not-game-over");
      }

      const playerType = toPlayerType(ctx.currentUserId, model);

      if (playerType === "none") {
        return Err("not-playing");
      }

      const modelNew: SharedModel = {
        type: "setup",
        moveTimeLimit: model.moveTimeLimit,
        PlayerOne: model.PlayerOne,
        PlayerTwo: model.PlayerTwo,
      };

      return Ok(modelNew);
    }

    case "rematch-cancel": {
      if (model.type !== "game-over") {
        return Err("not-game-over");
      }

      const playerType = toPlayerType(ctx.currentUserId, model);

      if (playerType === "none") {
        return Err("not-playing");
      }

      if (model.rematch.type !== "Asking") {
        return Err("not-asking");
      }

      if (model.rematch.asker !== playerType) {
        return Err("not-asking");
      }

      const modelNew: SharedModel = {
        ...model,
        rematch: { type: "NotAsking" },
      };

      return Ok(modelNew);
    }

    case "resign": {
      if (model.type !== "game") {
        return Err("not-in-game");
      }

      const playerType = toPlayerType(ctx.currentUserId, model);

      if (playerType === "none") {
        return Err("not-playing");
      }

      const modelNew: SharedModel = {
        type: "game-over",
        columns: model.columns,
        PlayerOne: model.PlayerOne,
        PlayerTwo: model.PlayerTwo,
        rematch: { type: "NotAsking" },
        moveTimeLimit: model.moveTimeLimit,
        gameOver: { type: "resignation", resigner: playerType },
      };

      return Ok(modelNew);
    }

    default: {
      return exhaustive(req[0]);
    }
  }
};

export const toPlayerType = (
  userId: UserId,
  model: SharedModel
): PlayerType | "none" => {
  if (model.PlayerOne === userId) {
    return "PlayerOne";
  }

  if (model.PlayerTwo === userId) {
    return "PlayerTwo";
  }

  return "none";
};

//
//
//
//
//

type Tick = { t: "tick" };
type TickDone = { t: "tick-done"; model: SharedModel };

export const tick = (model: SharedModel): SharedModel => {
  if (model.type !== "game") {
    return model;
  }

  const moveCountDownNew = Math.floor(Math.max(0, model.moveCountDown - 1));

  if (moveCountDownNew > 0) {
    const modelNew: SharedModel = {
      ...model,
      moveCountDown: moveCountDownNew,
    };

    return modelNew;
  }

  const turn = toTurn(model.columns);

  for (const columnIndex of shuffle(allColumnIndexes)) {
    const result = move(model.columns, columnIndex, turn);

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
    const modelNew: SharedModel = {
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

  const modelNew: SharedModel = {
    type: "game-over",
    moveTimeLimit: model.moveTimeLimit,
    PlayerOne: model.PlayerOne,
    PlayerTwo: model.PlayerTwo,
    columns: columnsNew,
    gameOver: gameOver,
    rematch: { type: "NotAsking" },
  };

  return modelNew;
};

const shuffle = <X>(xs: X[]): X[] => {
  return [...xs].sort(() => (Math.random() > 0.5 ? -1 : 1));
};
