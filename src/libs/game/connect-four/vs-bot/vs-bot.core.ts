import { Err, Ok, Result } from "@gamezilla/core";
import { UserId } from "@gamezilla/shared/app";
import { VsBotSetup } from "@gamezilla/shared/game-space";
import {
  BestMoveResult,
  ColumnIndex,
  Columns,
  PlayerType,
  emptyColumns,
  move,
  opposite,
  toStatus,
} from "../connect-four";

//
//
// Model
//
//

export type CoreModel = SetupModel | GameModel;

export type SetupModel = {
  type: "setup";
  userPlayerType: PlayerType;
  botLevel: BotLevel;
  player: UserId | null;
};

export type GameModel = {
  type: "game";
  gameId: number;
  userPlayerType: PlayerType;
  botLevel: BotLevel;
  player: UserId;
  columns: Columns;
};

export const isBotTurn = (model: CoreModel): boolean => {
  if (model.type !== "game") {
    return false;
  }
  const status = toStatus(model.columns);
  return (
    status.type === "Playing" && status.turn === opposite[model.userPlayerType]
  );
};

export const toBotPlayer = (model: CoreModel): PlayerType => {
  return opposite[model.userPlayerType];
};

export type ServerModel = CoreModel;

export type ClientModel = CoreModel & {
  ghostIndex: ColumnIndex | null;
  vsBotSetup: VsBotSetup.Model;
};

export const initShared = ({
  player,
}: {
  player: UserId | null;
}): CoreModel => {
  return {
    type: "setup",
    botLevel: "Medium",
    player: player,
    userPlayerType: "player-one",
  };
};

//
//
//
//

export type GameOver = { type: "Tie" } | { type: "Winner"; winner: PlayerType };

export const toGameOver = (model: CoreModel): GameOver | { type: null } => {
  switch (model.type) {
    case "game": {
      const status = toStatus(model.columns);
      switch (status.type) {
        case "Playing": {
          return { type: null };
        }
        case "Tie": {
          return { type: "Tie" };
        }

        case "Winner": {
          return { type: "Winner", winner: status.winner };
        }

        default: {
          return { type: null };
        }
      }
    }

    case "setup": {
      return { type: null };
    }
  }
};

export type BotLevel = "Easy" | "Medium" | "Hard";

export const botLevel: { [botLevel in BotLevel]: BotLevel } = {
  Easy: "Easy",
  Medium: "Medium",
  Hard: "Hard",
};

export const allBotLevels: BotLevel[] = ["Easy", "Medium", "Hard"];

//
//
// Msg
//
//

export type ClientMsg =
  | Req
  | { t: "hovered"; columnIndex: ColumnIndex }
  | { t: "vs-bot-setup"; c: VsBotSetup.Msg };

export type ServerMsg = { t: "bot-moved"; result: BestMoveResult };

export type ToClient =
  | Res
  | { t: "player-left"; model: CoreModel }
  | { t: "bot-move"; result: Result<string, CoreModel> };

export type ToServer = Req;

export type Req =
  | { t: "start-playing"; playerType: PlayerType }
  | { t: "stop-playing" }
  | { t: "input-bot-level"; botLevel: BotLevel }
  | { t: "start-game" }
  | { t: "input-move"; columnIndex: ColumnIndex }
  | { t: "stop-game" }
  | { t: "swap-sides" }
  | { t: "restart" };

export type Res = Req & { result: Result<string, CoreModel> };

//
//
//
//

export const handle = ({
  ctx,
  msg,
  model,
}: {
  ctx: { currentUserId: UserId; hostId: UserId };
  msg: Req;
  model: CoreModel;
}): Result<string, CoreModel> => {
  if (model.type === "setup") {
    if (msg.t === "start-playing") {
      // if (model.player !== null) {
      //   return Err("already-playing");
      // }

      return Ok({
        ...model,
        userPlayerType: msg.playerType,
        player: ctx.currentUserId,
      });
    }

    if (msg.t === "stop-playing") {
      if (model.player !== ctx.currentUserId) {
        return Err("not-allowed");
      }

      return Ok({
        ...model,
        player: null,
      });
    }

    if (msg.t === "input-bot-level") {
      if (
        model.player !== ctx.currentUserId ||
        ctx.currentUserId !== ctx.hostId
      ) {
        return Err("not-allowed");
      }

      const modelNew: CoreModel = {
        ...model,
        botLevel: msg.botLevel,
      };

      return Ok(modelNew);
    }

    if (msg.t === "start-game") {
      if (
        model.player !== ctx.currentUserId ||
        ctx.currentUserId !== ctx.hostId
      ) {
        return Err("not-allowed");
      }

      if (model.player === null) {
        return Err("missing-player");
      }

      const modelNew: CoreModel = {
        type: "game",
        gameId: 0,
        botLevel: model.botLevel,
        player: model.player,
        userPlayerType: model.userPlayerType,
        columns: emptyColumns,
      };

      return Ok(modelNew);
    }

    return Err("unhandled-request");
  }

  if (model.type === "game") {
    if (msg.t === "stop-game") {
      if (
        model.player !== ctx.currentUserId ||
        ctx.currentUserId !== ctx.hostId
      ) {
        return Err("not-playing");
      }

      const modelNew: CoreModel = {
        type: "setup",
        botLevel: model.botLevel,
        player: model.player,
        userPlayerType: model.userPlayerType,
      };

      return Ok(modelNew);
    }

    if (msg.t === "swap-sides") {
      if (model.player !== ctx.currentUserId) {
        return Err("not-playing");
      }

      const modelNew: CoreModel = {
        ...model,
        columns: emptyColumns,
        gameId: model.gameId + 1,
        userPlayerType: opposite[model.userPlayerType],
      };

      return Ok(modelNew);
    }

    if (msg.t === "input-move") {
      if (model.player !== ctx.currentUserId) {
        return Err("not-playing");
      }

      const result = move(model.columns, msg.columnIndex, model.userPlayerType);

      if (result.t === "err") {
        return result;
      }

      const modelNew: CoreModel = {
        ...model,
        columns: result.value,
      };

      return Ok(modelNew);
    }

    if (msg.t === "restart") {
      if (model.player !== ctx.currentUserId) {
        return Err("not-playing");
      }

      const modelNew: GameModel = {
        ...model,
        columns: emptyColumns,
        gameId: model.gameId + 1,
      };

      return Ok(modelNew);
    }

    return Err("unhandled-request");
  }

  return Err("unhandled-request");
};

export const handleBotMove = (
  bestMoveResult: BestMoveResult,
  model: CoreModel
): Result<string, CoreModel> => {
  if (model.type !== "game") {
    return Err("not-game");
  }

  if (bestMoveResult.t === "err") {
    return bestMoveResult;
  }

  const columnIndex = bestMoveResult.value;

  if (typeof columnIndex !== "number") {
    return Err("no-move-available");
  }

  const moveResult = move(
    model.columns,
    columnIndex,
    opposite[model.userPlayerType]
  );

  if (moveResult.t === "err") {
    return moveResult;
  }

  const modelNew: CoreModel = {
    ...model,
    columns: moveResult.value,
  };

  return Ok(modelNew);
};
