import { UserId } from "@gamezilla/shared/app";
import { Err, Ok, Result } from "@gamezilla/shared/core";
import { GetBestMoveResult } from "../tic-tic-toe/best-move";
import {
  Model,
  BotLevel,
  PlayerType,
  Position,
  emptyBoard,
  move,
  toOpposite,
  toStatus,
} from "../tic-tic-toe/tic-tac-toe";

//
//
//
// Model
//
//
//

export type SharedModel = SetupModel | GameModel;

export type SetupModel = {
  type: "setup";
  player?: UserId | null;
  userPlayerType: PlayerType;
  botLevel: BotLevel;
};

export type GameModel = {
  type: "game";
  player: UserId;
  userPlayerType: PlayerType;
  botLevel: BotLevel;
  board: Model;
};

export type ClientModel = SharedModel;

export type ServerModel = SharedModel;

export const initSharedModel = ({
  userId,
}: {
  userId: SetupModel["player"];
}): SharedModel => {
  return {
    type: "setup",
    botLevel: "Medium",
    userPlayerType: "X",
    player: userId,
  };
};

export const isBotTurn = (model: SharedModel): model is GameModel => {
  if (model.type !== "game") {
    return false;
  }

  const status = toStatus(model.board);

  return (
    status.type === "Turn" && status.turn === toOpposite(model.userPlayerType)
  );
};

//
//
//
// Msg
//
//
//

export type ClientMsg = Req;

export type ServerMsg = { t: "bot-moved"; result: GetBestMoveResult };

export type ToServer = Req;

export type ToClient =
  | Res
  | { t: "bot-moved"; result: Result<string, SharedModel> }
  | { t: "player-left"; result: Result<string, SharedModel> };

export type Req =
  | { t: "input-bot-level"; botLevel: BotLevel }
  | { t: "start-playing"; playerType: PlayerType }
  | { t: "stop-playing" }
  | { t: "start-game" }
  | { t: "stop-game" }
  | { t: "input-move"; position: Position }
  | { t: "swap-sides" }
  | { t: "restart" };

export type Res = Req & {
  result: Result<string, SharedModel>;
};

//
//
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
  switch (msg.t) {
    case "input-bot-level": {
      if (model.type !== "setup") {
        return Err("must-be-in-setup-mode");
      }

      if (model.player !== ctx.currentUserId) {
        return Err("must-be-player");
      }

      return Ok({
        ...model,
        botLevel: msg.botLevel,
      });
    }

    case "start-playing": {
      if (model.type !== "setup") {
        return Err("must-be-in-setup-mode");
      }

      if (model.player && model.player !== ctx.currentUserId) {
        return Err("not-allowed");
      }

      return Ok({
        ...model,
        userPlayerType: msg.playerType,
        player: ctx.currentUserId,
      });
    }

    case "stop-playing": {
      if (model.type !== "setup") {
        return Err("must-be-in-setup-mode");
      }

      if (model.player !== ctx.currentUserId) {
        return Err("must-be-player");
      }

      return Ok({
        ...model,
        player: null,
      });
    }

    case "start-game": {
      if (model.type !== "setup") {
        return Err("must-be");
      }

      if (model.player === "none") {
        return Err("missing_player");
      }

      if (model.player !== ctx.currentUserId) {
        return Err("must-be-player");
      }

      return Ok({
        type: "game",
        board: emptyBoard,
        botLevel: model.botLevel,
        player: model.player,
        userPlayerType: model.userPlayerType,
      });
    }

    case "stop-game": {
      if (model.type !== "game") {
        return Err("must-be-in-game-mode");
      }

      if (model.player !== ctx.currentUserId) {
        return Err("must-be-player");
      }

      return Ok({
        type: "setup",
        botLevel: model.botLevel,
        player: model.player,
        userPlayerType: model.userPlayerType,
      });
    }

    case "input-move": {
      if (model.type !== "game") {
        return Err("must-be-in-game-mode");
      }

      if (model.player !== ctx.currentUserId) {
        return Err("must-be-player");
      }

      const result = move({
        board: model.board,
        player: model.userPlayerType,
        position: msg.position,
      });

      if (result.t === "err") {
        return result;
      }

      const modelNext: SharedModel = {
        ...model,
        board: result.value,
      };

      return Ok(modelNext);
    }

    case "swap-sides": {
      if (model.type !== "game") {
        return Err("must-be-in-game-mode");
      }

      if (model.player !== ctx.currentUserId) {
        return Err("must-be-player");
      }

      const modelNext: SharedModel = {
        ...model,
        board: emptyBoard,
        userPlayerType: toOpposite(model.userPlayerType),
      };

      return Ok(modelNext);
    }

    case "restart": {
      if (model.type !== "game") {
        return Err("must-be-in-game-mode");
      }

      if (model.player !== ctx.currentUserId) {
        return Err("must-be-player");
      }

      return Ok({
        ...model,
        board: emptyBoard,
      });
    }
  }
};
