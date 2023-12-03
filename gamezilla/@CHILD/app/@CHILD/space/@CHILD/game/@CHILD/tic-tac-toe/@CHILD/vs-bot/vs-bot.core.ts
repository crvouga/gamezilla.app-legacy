import { err, isErr, ok, Result } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data";
import { VsBotSetup } from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED/vs-bot";
import {
  BotLevel,
  Model,
  PlayerType,
  Position,
  emptyBoard,
  move,
  toOpposite,
  toStatus,
} from "../../@SHARED/tic-tic-toe/tic-tac-toe";
import { SpaceCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";

//
//
//
// Model
//
//
//

export type CoreModel = SetupModel | GameModel;

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

export type ClientModel = CoreModel & {
  vsBotSetup: VsBotSetup.Model;
};

export type ServerModel = CoreModel;

export const initCoreModel = ({
  userId,
}: {
  userId: SetupModel["player"];
}): CoreModel => {
  return {
    type: "setup",
    botLevel: "Medium",
    userPlayerType: "X",
    player: userId,
  };
};

export const isBotTurn = (model: CoreModel): model is GameModel => {
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

export type ClientMsg = Req | { t: "vs-bot-setup"; c: VsBotSetup.Msg };

export type ServerMsg = { t: "bot-moved" };

export type ToServer = Req;

export type ToClient =
  | Res
  | { t: "bot-moved"; result: Result<string, CoreModel> }
  | { t: "player-left"; result: Result<string, CoreModel> };

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
  result: Result<string, CoreModel>;
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
  ctx: SpaceCtx & { currentUserId: UserId };
  msg: Req;
  model: CoreModel;
}): Result<string, CoreModel> => {
  switch (msg.t) {
    case "input-bot-level": {
      if (model.type !== "setup") {
        return err("must-be-in-setup-mode");
      }

      if (model.player !== ctx.currentUserId) {
        return err("must-be-player");
      }

      return ok({
        ...model,
        botLevel: msg.botLevel,
      });
    }

    case "start-playing": {
      if (model.type !== "setup") {
        return err("must-be-in-setup-mode");
      }

      if (model.player && model.player !== ctx.currentUserId) {
        return err("not-allowed");
      }

      return ok({
        ...model,
        userPlayerType: msg.playerType,
        player: ctx.currentUserId,
      });
    }

    case "stop-playing": {
      if (model.type !== "setup") {
        return err("must-be-in-setup-mode");
      }

      if (model.player !== ctx.currentUserId) {
        return err("must-be-player");
      }

      return ok({
        ...model,
        player: null,
      });
    }

    case "start-game": {
      if (model.type !== "setup") {
        return err("must-be");
      }

      if (model.player === "none") {
        return err("missing_player");
      }

      if (model.player !== ctx.currentUserId) {
        return err("must-be-player");
      }

      return ok({
        type: "game",
        board: emptyBoard,
        botLevel: model.botLevel,
        player: model.player,
        userPlayerType: model.userPlayerType,
      });
    }

    case "stop-game": {
      if (model.type !== "game") {
        return err("must-be-in-game-mode");
      }

      if (model.player !== ctx.currentUserId) {
        return err("must-be-player");
      }

      return ok({
        type: "setup",
        botLevel: model.botLevel,
        player: model.player,
        userPlayerType: model.userPlayerType,
      });
    }

    case "input-move": {
      if (model.type !== "game") {
        return err("must-be-in-game-mode");
      }

      if (model.player !== ctx.currentUserId) {
        return err("must-be-player");
      }

      const result = move({
        board: model.board,
        player: model.userPlayerType,
        position: msg.position,
      });

      if (isErr(result)) {
        return result;
      }

      const modelNext: CoreModel = {
        ...model,
        board: result.value,
      };

      return ok(modelNext);
    }

    case "swap-sides": {
      if (model.type !== "game") {
        return err("must-be-in-game-mode");
      }

      if (model.player !== ctx.currentUserId) {
        return err("must-be-player");
      }

      const modelNext: CoreModel = {
        ...model,
        board: emptyBoard,
        userPlayerType: toOpposite(model.userPlayerType),
      };

      return ok(modelNext);
    }

    case "restart": {
      if (model.type !== "game") {
        return err("must-be-in-game-mode");
      }

      if (model.player !== ctx.currentUserId) {
        return err("must-be-player");
      }

      return ok({
        ...model,
        board: emptyBoard,
      });
    }
  }
};
