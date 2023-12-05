import { err, isErr, ok, Result } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { VsBotSetup } from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED/vs-bot";
import { Chess } from "../../@SHARED/chess";
import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";

//
//
//
// Model
//
//
//

export type ClientModel = {
  coreModel: CoreModel;
  openedMenuId: string | null;
  openedModal: null | "game-over";
  isFlipped: boolean;
  vsBotSetup: VsBotSetup.Model;
};

export type ServerModel = CoreModel;

export type CoreModel = SetupModel | GameModel | GameOverModel;

export type SetupModel = {
  type: "setup";
  userColor: Chess.Color;
  userId: UserId | null;
  botLevel: Chess.BotLevel;
};

export type GameModel = {
  type: "game";
  userColor: Chess.Color;
  userId: UserId;
  board: Chess.Model;
  botLevel: Chess.BotLevel;
};

export type GameOverModel = {
  type: "game-over";
  gameOver: GameOver;
  userColor: Chess.Color;
  userId: UserId;
  board: Chess.Model;
  botLevel: Chess.BotLevel;
};

export type GameOver = Chess.GameOver;

export const initCore: CoreModel = {
  type: "setup",
  userColor: "w",
  userId: null,
  botLevel: 1,
};

export const initServer = ({
  userId,
}: {
  userId: UserId | null;
}): ServerModel => {
  return {
    type: "setup",
    botLevel: initCore.botLevel,
    userColor: initCore.userColor,
    userId,
  };
};

export const isBotTurn = (model: CoreModel) => {
  return model.type === "game" && Chess.toTurn(model.board) !== model.userColor;
};

//
//
//
// Msg
//
//
//

export type ClientMsg =
  | Req
  | { t: "opened-menu"; menuId: string }
  | { t: "closed-menu" }
  | { t: "clicked-flip" }
  | { t: "closed-modal" }
  | { t: "vs-bot-setup"; c: VsBotSetup.Msg };

export type ServerMsg = {
  t: "bot-moved";
  moved: Chess.BestMoveInputResult;
};

export type ToServer = Req;

export type ToClient =
  | Res
  | {
      t: "bot-moved";
      result: Result<string, CoreModel & { didCapture: boolean }>;
    }
  | { t: "player-left"; model: CoreModel };

export type Req =
  | { t: "input-bot-level"; botLevel: Chess.BotLevel }
  | { t: "start-playing"; color: Chess.Color }
  | { t: "stop-playing" }
  | { t: "start-game" }
  | { t: "stop-game" }
  | { t: "input-move"; move: Chess.MoveInput };

export type Res = Req & {
  result: Result<string, CoreModel & { didCapture?: boolean }>;
};

//
//
//
//

export const updateCore = ({
  msg,
  model,
  ctx,
}: {
  ctx: SpaceCtx & { currentUserId: UserId };
  msg: Req;
  model: CoreModel;
}): Result<string, CoreModel & { didCapture?: boolean }> => {
  switch (model.type) {
    case "setup": {
      switch (msg.t) {
        case "start-game": {
          if (!model.userId) {
            return err("missing-user");
          }
          if (
            model.userId !== ctx.currentUserId ||
            model.userId !== ctx.space.hostId
          ) {
            return err("not-allowed");
          }
          return ok({
            type: "game",
            botLevel: model.botLevel,
            userColor: model.userColor,
            userId: model.userId,
            board: Chess.init(),
          });
        }

        case "input-bot-level": {
          if (
            model.userId !== ctx.currentUserId ||
            model.userId !== ctx.space.hostId
          ) {
            return err("not-allowed");
          }
          return ok({
            ...model,
            botLevel: msg.botLevel,
          });
        }

        case "stop-playing": {
          if (model.userId !== ctx.currentUserId) {
            return err("not-allowed");
          }
          return ok({
            ...model,
            userId: null,
          });
        }

        case "start-playing": {
          if (model.userId !== null && model.userId !== ctx.currentUserId) {
            return err("not-allowed");
          }
          return ok({
            ...model,
            userId: ctx.currentUserId,
            userColor: msg.color,
          });
        }

        default: {
          return err("unhandled");
        }
      }
    }

    case "game": {
      switch (msg.t) {
        case "input-move": {
          if (model.userId !== ctx.currentUserId) {
            return err("must-be-playing");
          }

          if (Chess.toTurn(model.board) !== model.userColor) {
            return err("must-be-turn");
          }

          const moved = Chess.move(msg.move, model.board);

          if (moved.t === "err") {
            return moved;
          }

          const boardNew = moved.value;

          const gameOver = Chess.toGameOver(boardNew);

          if (gameOver.type !== "none") {
            return ok({
              ...model,
              type: "game-over",
              board: boardNew,
              gameOver: gameOver,
              didCapture: boardNew.didCapture,
            });
          }

          const modelNew: CoreModel = {
            ...model,
            board: boardNew,
          };

          return Result.ok({
            ...modelNew,
            didCapture: boardNew.didCapture,
          });
        }

        case "stop-game": {
          if (
            model.userId !== ctx.currentUserId ||
            ctx.currentUserId !== ctx.space.hostId
          ) {
            return err("not-allowed");
          }
          return ok({
            type: "setup",
            botLevel: model.botLevel,
            userColor: model.userColor,
            userId: model.userId,
          });
        }

        default: {
          return err("unhandled");
        }
      }
    }

    case "game-over": {
      switch (msg.t) {
        case "stop-game": {
          if (
            model.userId !== ctx.currentUserId ||
            ctx.currentUserId !== ctx.space.hostId
          ) {
            return err("not-allowed");
          }
          return ok({
            type: "setup",
            botLevel: model.botLevel,
            userColor: model.userColor,
            userId: model.userId,
          });
        }
        default: {
          return err("unhandled");
        }
      }
    }

    default: {
      return err("unhandled");
    }
  }
};

//
//
//
// Bot Moved
//
//
//

export const botMoved = (
  botMoveResult: Chess.BestMoveInputResult,
  model: CoreModel
): Result<string, CoreModel & { didCapture: boolean }> => {
  if (model.type !== "game") {
    return err("must_be_started");
  }

  if (botMoveResult.t === "err") {
    return botMoveResult;
  }

  const botMoveInput = botMoveResult.value;

  const botColor = Chess.toOppositeColor(model.userColor);

  if (Chess.toTurn(model.board) !== botColor) {
    return err("must_be_turn");
  }

  const result = Chess.move(botMoveInput, model.board);

  if (isErr(result)) {
    return result;
  }

  const { didCapture, ...boardNew } = result.value;

  const gameOver = Chess.toGameOver(boardNew);

  if (gameOver.type !== "none") {
    const modelNew: CoreModel = {
      ...model,
      type: "game-over",
      gameOver: gameOver,
      board: boardNew,
    };
    return ok({ ...modelNew, didCapture });
  }

  return ok({
    ...model,
    board: boardNew,
    didCapture,
  });
};
