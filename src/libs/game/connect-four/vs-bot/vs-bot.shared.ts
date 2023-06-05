import { UserId } from "@gamezilla/shared/app";
import { Err, Ok, Result, exhaustive } from "@gamezilla/shared/core";
import {
  BestMoveResult,
  ColumnIndex,
  Columns,
  PlayerType,
  emptyColumns,
  move,
  opposite,
  toStatus,
} from "../connect-four/connect-four";

//
//
// Model
//
//

export type SharedModel = SetupModel | GameModel;

export type SetupModel = {
  type: "setup";
  userPlayerType: PlayerType;
  botLevel: BotLevel;
  player: UserId | "none";
};

export type GameModel = {
  type: "game";
  userPlayerType: PlayerType;
  botLevel: BotLevel;
  player: UserId;
  columns: Columns;
};

export const isBotTurn = (model: SharedModel): boolean => {
  if (model.type !== "game") {
    return false;
  }
  const status = toStatus(model.columns);
  return (
    status.type === "Playing" && status.turn === opposite[model.userPlayerType]
  );
};

export const toBotPlayer = (model: SharedModel): PlayerType => {
  return opposite[model.userPlayerType];
};

export type ServerModel = SharedModel;

export type ClientGameModel = GameModel & {
  ghostIndex: ColumnIndex | "none";
};

export type ClientModel = SetupModel | ClientGameModel;

export const initShared = ({
  player,
}: {
  player: UserId | "none";
}): SharedModel => {
  return {
    type: "setup",
    botLevel: "Medium",
    player: player,
    userPlayerType: "PlayerOne",
  };
};

//
//
//
//

export type GameOver = { type: "Tie" } | { type: "Winner"; winner: PlayerType };

export const toGameOver = (model: SharedModel): GameOver | { type: "none" } => {
  switch (model.type) {
    case "game": {
      const status = toStatus(model.columns);
      switch (status.type) {
        case "Playing": {
          return { type: "none" };
        }
        case "Tie": {
          return { type: "Tie" };
        }

        case "Winner": {
          return { type: "Winner", winner: status.winner };
        }

        default: {
          return { type: "none" };
        }
      }
    }

    case "setup": {
      return { type: "none" };
    }
  }
};

export type BotLevel = "Easy" | "Medium" | "Hard";

export const botLevel: { [botLevel in BotLevel]: BotLevel } = {
  Easy: "Easy",
  Medium: "Medium",
  Hard: "Hard",
};

//
//
// Msg
//
//

export type ClientMsg = Req | { t: "hovered"; columnIndex: ColumnIndex };

export type ServerMsg = { t: "bot-moved"; result: BestMoveResult };

export type ToClient =
  | Res
  | { t: "player-left"; model: SharedModel }
  | { t: "bot-move"; result: Result<string, SharedModel> };

export type ToServer = Req;

export type Req =
  | { t: "start-playing" }
  | { t: "stop-playing" }
  | { t: "input-player-type"; playerType: PlayerType }
  | { t: "input-bot-level"; botLevel: BotLevel }
  | { t: "start-game" }
  | { t: "input-move"; columnIndex: ColumnIndex }
  | { t: "stop-game" }
  | { t: "swap-sides" }
  | { t: "restart" };

export type Res = Req & { result: Result<String, SharedModel> };

//
//
//
//

export const handle = ({
  ctx,
  msg,
  model,
}: {
  ctx: { currentUserId: UserId };
  msg: Req;
  model: SharedModel;
}): Result<String, SharedModel> => {
  const { currentUserId } = ctx;
  switch (msg.t) {
    case "start-playing": {
      if (model.type !== "setup") {
        return Err("not-setup");
      }

      if (model.player !== "none") {
        return Err("player-taken");
      }

      const modelNew: SharedModel = {
        ...model,
        player: currentUserId,
      };

      return Ok(modelNew);
    }

    case "stop-playing": {
      if (model.type !== "setup") {
        return Err("not-setup");
      }

      if (model.player === "none") {
        return Err("not-playing");
      }

      if (model.player !== currentUserId) {
        return Err("not-playing");
      }

      const modelNew: SharedModel = {
        ...model,
        player: "none",
      };

      return Ok(modelNew);
    }

    case "input-player-type": {
      if (model.type !== "setup") {
        return Err("not-setup");
      }

      if (model.player !== currentUserId) {
        return Err("not-playing");
      }

      const modelNew: SharedModel = {
        ...model,
        userPlayerType: msg.playerType,
      };

      return Ok(modelNew);
    }

    case "input-bot-level": {
      if (model.type !== "setup") {
        return Err("not-setup");
      }

      if (model.player !== currentUserId) {
        return Err("not-playing");
      }

      const modelNew: SharedModel = {
        ...model,
        botLevel: msg.botLevel,
      };

      return Ok(modelNew);
    }

    case "start-game": {
      if (model.type !== "setup") {
        return Err("not-setup");
      }

      if (model.player !== currentUserId) {
        return Err("not-playing");
      }

      if (model.player === "none") {
        return Err("missing-player");
      }

      const modelNew: SharedModel = {
        type: "game",
        botLevel: model.botLevel,
        player: model.player,
        userPlayerType: model.userPlayerType,
        columns: emptyColumns,
      };

      return Ok(modelNew);
    }

    case "stop-game": {
      if (model.type !== "game") {
        return Err("not-game");
      }

      if (model.player !== currentUserId) {
        return Err("not-playing");
      }

      const modelNew: SharedModel = {
        type: "setup",
        botLevel: model.botLevel,
        player: model.player,
        userPlayerType: model.userPlayerType,
      };

      return Ok(modelNew);
    }

    case "swap-sides": {
      if (model.type !== "game") {
        return Err("not-game");
      }

      if (model.player !== currentUserId) {
        return Err("not-playing");
      }

      const modelNew: SharedModel = {
        ...model,
        columns: emptyColumns,
        userPlayerType: opposite[model.userPlayerType],
      };

      return Ok(modelNew);
    }

    case "input-move": {
      if (model.type !== "game") {
        return Err("not-game");
      }

      if (model.player !== currentUserId) {
        return Err("not-playing");
      }

      const result = move(model.columns, msg.columnIndex, model.userPlayerType);

      if (result.t === "err") {
        return result;
      }

      const modelNew: SharedModel = {
        ...model,
        columns: result.value,
      };

      return Ok(modelNew);
    }

    case "restart": {
      if (model.type !== "game") {
        return Err("not-game");
      }

      if (model.player !== currentUserId) {
        return Err("not-playing");
      }

      const modelNew: GameModel = {
        ...model,
        columns: emptyColumns,
      };

      return Ok(modelNew);
    }

    default: {
      return exhaustive(msg[0]);
    }
  }
};

export const botMove = (
  bestMoveResult: BestMoveResult,
  model: SharedModel
): Result<string, SharedModel> => {
  if (model.type !== "game") {
    return Err("not-game");
  }

  if (bestMoveResult.t === "err") {
    return bestMoveResult;
  }

  const moveResult = move(
    model.columns,
    bestMoveResult.value,
    opposite[model.userPlayerType]
  );

  if (moveResult.t === "err") {
    return moveResult;
  }

  const modelNew: SharedModel = {
    ...model,
    columns: moveResult.value,
  };

  return Ok(modelNew);
};
