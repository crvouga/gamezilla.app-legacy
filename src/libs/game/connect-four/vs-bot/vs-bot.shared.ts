import { UserId } from "@gamezilla/shared/app";
import { Err, Ok, Result } from "@gamezilla/shared/core";
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
import { VsBotSetup } from "@gamezilla/shared/client";

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
  player: UserId | null;
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

export type ClientModel = SharedModel & {
  ghostIndex: ColumnIndex | null;
  vsBotSetup: VsBotSetup.Model;
};

export const initShared = ({
  player,
}: {
  player: UserId | null;
}): SharedModel => {
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

export const toGameOver = (model: SharedModel): GameOver | { type: null } => {
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
  | { t: "player-left"; model: SharedModel }
  | { t: "bot-move"; result: Result<string, SharedModel> };

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
  ctx: { currentUserId: UserId; hostId: UserId };
  msg: Req;
  model: SharedModel;
}): Result<string, SharedModel> => {
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

      const modelNew: SharedModel = {
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

      const modelNew: SharedModel = {
        type: "game",
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

      const modelNew: SharedModel = {
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

      const modelNew: SharedModel = {
        ...model,
        columns: emptyColumns,
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

      const modelNew: SharedModel = {
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
      };

      return Ok(modelNew);
    }

    return Err("unhandled-request");
  }

  return Err("unhandled-request");
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
