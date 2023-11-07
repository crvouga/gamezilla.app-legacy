import { err, ok, Result } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  Board,
  BotLevel,
  MoveProblem,
  Stone,
  initBoard,
  move,
  toBestMove,
  toOppositeStone,
  toTurn,
} from "../../@SHARED/gomoku/gomoku";
import { Position } from "../../@SHARED/gomoku/gomoku-position";

//
//
//
// Model
//
//
//

export type Model = SetupModel | GameModel;

export type SetupModel = {
  type: "setup";
  userId: UserId | null;
  userStone: Stone;
  botLevel: BotLevel;
};

export type GameModel = {
  type: "game";
  userId: UserId;
  userStone: Stone;
  botLevel: BotLevel;
  board: Board;
};

export type ClientModel = Model;

export type ServerModel = Model;

export const initShared = ({ userId }: { userId: UserId | null }): Model => {
  return {
    type: "setup",
    userId,
    userStone: "white",
    botLevel: "Medium",
  };
};

//
//
//
// Msg
//
//
//

export type ClientMsg = Req;

export type ServerMsg = { t: "none" };

export type ToServer = Req;

export type ToClient = Res | { t: "bot-moved"; result: Result<string, Model> };

//
//
//
//
//

export type Req =
  // setup
  | { t: "start-playing" }
  | { t: "stop-playing" }
  | { t: "inputted-user-stone"; userStone: Stone }
  | { t: "input-bot-level"; botLevel: BotLevel }
  | { t: "start-game" }
  // game
  | { t: "input-move"; position: Position }
  | { t: "stop-game" }
  | { t: "restart" }
  | { t: "swap-sides" };

export type Res = Req & { result: Result<Problem, Model> };

export type Problem =
  | "not-bot-turn"
  | "must-be-player"
  | "must-be-setup"
  | "must-be-no-player"
  | "must-be-game"
  | "no-position"
  | MoveProblem;

export const handle = ({
  ctx,
  msg,
  model,
}: {
  ctx: { currentUserId: UserId };
  msg: Req;
  model: Model;
}): Result<Problem, Model> => {
  switch (msg.t) {
    case "input-bot-level": {
      if (model.type !== "setup") {
        return err("must-be-setup");
      }
      if (model.userId !== ctx.currentUserId) {
        return err("must-be-player");
      }
      return ok({
        ...model,
        botLevel: msg.botLevel,
      });
    }

    case "inputted-user-stone": {
      if (model.type !== "setup") {
        return err("must-be-setup");
      }
      if (model.userId !== ctx.currentUserId) {
        return err("must-be-player");
      }
      return ok({
        ...model,
        userStone: msg.userStone,
      });
    }

    case "start-playing": {
      if (model.type !== "setup") {
        return err("must-be-setup");
      }
      if (model.userId) {
        return err("must-be-no-player");
      }
      return ok({
        ...model,
        userId: ctx.currentUserId,
      });
    }

    case "stop-playing": {
      if (model.type !== "setup") {
        return err("must-be-setup");
      }
      if (model.userId !== ctx.currentUserId) {
        return err("must-be-player");
      }
      return ok({
        ...model,
        userId: null,
      });
    }

    case "start-game": {
      if (model.type !== "setup") {
        return err("must-be-setup");
      }
      if (model.userId !== ctx.currentUserId) {
        return err("must-be-player");
      }
      return ok({
        type: "game",
        board: initBoard,
        botLevel: model.botLevel,
        userId: model.userId,
        userStone: model.userStone,
        visual: {},
      });
    }

    case "input-move": {
      if (model.type !== "game") {
        return err("must-be-game");
      }

      if (model.userId !== ctx.currentUserId) {
        return err("must-be-player");
      }

      const moved = move({
        position: msg.position,
        stone: model.userStone,
        board: model.board,
      });

      if (moved.t === "err") {
        return moved;
      }

      return ok({ ...model, board: moved.value });
    }

    case "stop-game": {
      if (model.type !== "game") {
        return err("must-be-game");
      }
      if (model.userId !== ctx.currentUserId) {
        return err("must-be-player");
      }
      return ok({
        type: "setup",
        botLevel: model.botLevel,
        userId: model.userId,
        userStone: model.userStone,
      });
    }

    case "restart": {
      if (model.type !== "game") {
        return err("must-be-game");
      }
      if (model.userId !== ctx.currentUserId) {
        return err("must-be-player");
      }
      return ok({
        ...model,
        board: initBoard,
      });
    }

    case "swap-sides": {
      if (model.type !== "game") {
        return err("must-be-game");
      }
      if (model.userId !== ctx.currentUserId) {
        return err("must-be-player");
      }
      return ok({
        ...model,
        board: initBoard,
        userStone: toOppositeStone(model.userStone),
      });
    }
  }
};

export const handleBotMove = (model: Model): Result<Problem, Model> => {
  if (model.type !== "game") {
    return err("must-be-game");
  }

  const isBotTurn = toTurn(model.board) === toOppositeStone(model.userStone);

  if (!isBotTurn) {
    return err("not-bot-turn");
  }

  const botStone = toOppositeStone(model.userStone);

  const position = toBestMove({ stone: botStone, board: model.board });

  if (!position) {
    return err("no-position");
  }

  const moved = move({ stone: botStone, position, board: model.board });

  if (moved.t === "err") {
    return moved;
  }

  const modelNew: Model = { ...model, board: moved.value };

  return ok(modelNew);
};
