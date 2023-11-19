import { Sub, Time, isErr } from "gamezilla/@SHARED/core";
import { sendBack } from "gamezilla/@CHILD/app/@SHARED/server";
import {
  SpaceServerEvt,
  SpaceReqCtx,
  SpaceServerCmd,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import {
  PlayerType,
  toOpposite,
  toTurn,
} from "../../@SHARED/tic-tic-toe/tic-tac-toe";
import * as Round from "./vs-user-round";
import {
  NewGame,
  Res,
  ServerModel,
  ServerMsg,
  ToClient,
  ToServer,
  initCoreModel,
  inputBestOutOf,
  inputMove,
  inputPlayer,
  moveCountDown,
  rematchAccept,
  rematchAsk,
  rematchCancel,
  rematchDecline,
  resign,
  roundCountDown,
  startGame,
  stopPlaying,
} from "./vs-user.core";
import { TimeSpan } from "gamezilla/@SHARED/core/time-span";

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init = initCoreModel;

//
//
//
// Update
//
//
//

export type Msg = ServerMsg;

export const update = (
  msg: Msg,
  model: Model
): {
  model: Model;
  cmd: SpaceServerCmd<ToClient>[];
} => {
  switch (msg[0]) {
    case "RoundCountDown": {
      const result = roundCountDown(model);

      const modelNew = isErr(result) ? model : result.value;

      return {
        model: modelNew,
        cmd: [{ t: "send-to-space", msg: ["RoundCountDown_Done", result] }],
      };
    }

    case "MoveCountDown": {
      const result = moveCountDown(model);

      const modelNew = isErr(result) ? model : result.value;

      return {
        model: modelNew,
        cmd: [{ t: "send-to-space", msg: ["MoveCountDown_Done", result] }],
      };
    }
  }
};

export const updateFromClient = (
  ctx: SpaceReqCtx,
  msg: ToServer,
  model: Model
): {
  model: Model;
  cmd: SpaceServerCmd<ToClient>[];
} => {
  switch (msg[0]) {
    case "InputPlayer": {
      const result = inputPlayer(msg[1], model);

      if (isErr(result)) {
        return {
          model,
          cmd: [sendBack(ctx, ["InputPlayer_Done", result])],
        };
      }

      const modelNew = result.value;

      return {
        model: modelNew,
        cmd: [{ t: "send-to-space", msg: ["InputPlayer_Done", result] }],
      };
    }

    case "stop-playing": {
      const result = stopPlaying(msg[1], model);

      if (isErr(result)) {
        return {
          model,
          cmd: [sendBack(ctx, ["StopPlaying_Done", result])],
        };
      }

      const modelNew = result.value;
      return {
        model: modelNew,
        cmd: [{ t: "send-to-space", msg: ["StopPlaying_Done", result] }],
      };
    }

    case "start-game": {
      const result = startGame(msg[1], model);

      if (isErr(result)) {
        return {
          model,
          cmd: [sendBack(ctx, ["StartGame_Done", result])],
        };
      }

      const modelNew = result.value;
      return {
        model: modelNew,
        cmd: [{ t: "send-to-space", msg: ["StartGame_Done", result] }],
      };
    }

    case "resign": {
      const result = resign(msg[1], model);

      if (isErr(result)) {
        return {
          model,
          cmd: [sendBack(ctx, ["resign_Done", result])],
        };
      }

      const modelNew = result.value;
      return {
        model: modelNew,
        cmd: [{ t: "send-to-space", msg: ["resign_Done", result] }],
      };
    }

    case "input-move": {
      const result = inputMove(msg[1], model);

      if (isErr(result)) {
        return {
          model,
          cmd: [sendBack(ctx, ["input-move-done", result])],
        };
      }

      const modelNew = result.value;
      return {
        model: modelNew,
        cmd: [{ t: "send-to-space", msg: ["input-move-done", result] }],
      };
    }

    case "NewGame": {
      const result = NewGame(msg[1], model);

      if (isErr(result)) {
        return {
          model,
          cmd: [sendBack(ctx, ["NewGame_Done", result])],
        };
      }

      const modelNew = result.value;

      return {
        model: modelNew,
        cmd: [{ t: "send-to-space", msg: ["NewGame_Done", result] }],
      };
    }

    case "InputBestOutOf": {
      const result = inputBestOutOf(msg[1], model);

      if (isErr(result)) {
        return {
          model,
          cmd: [sendBack(ctx, ["InputBestOutOf_Done", result])],
        };
      }

      const modelNew = result.value;
      return {
        model: modelNew,
        cmd: [{ t: "send-to-space", msg: ["InputBestOutOf_Done", result] }],
      };
    }

    case "RematchAccept": {
      const result = rematchAccept(msg[1], model);
      const res: Res = ["RematchAccept_Done", result];

      if (isErr(result)) {
        return {
          model,
          cmd: [sendBack(ctx, res)],
        };
      }

      return {
        model: result.value,
        cmd: [{ t: "send-to-space", msg: res }],
      };
    }

    case "RematchAsk": {
      const result = rematchAsk(msg[1], model);
      const res: Res = ["RematchAsk_Done", result];

      if (isErr(result)) {
        return {
          model,
          cmd: [sendBack(ctx, res)],
        };
      }

      return {
        model: result.value,
        cmd: [{ t: "send-to-space", msg: res }],
      };
    }

    case "RematchDecline": {
      const result = rematchDecline(msg[1], model);
      const res: Res = ["RematchDecline_Done", result];

      if (isErr(result)) {
        return {
          model,
          cmd: [sendBack(ctx, res)],
        };
      }

      return {
        model: result.value,
        cmd: [{ t: "send-to-space", msg: res }],
      };
    }

    case "Rematch_Cancel": {
      const result = rematchCancel(msg[1], model);
      const res: Res = ["Rematch_Cancel_Done", result];

      if (isErr(result)) {
        return {
          model,
          cmd: [sendBack(ctx, res)],
        };
      }

      return {
        model: result.value,
        cmd: [{ t: "send-to-space", msg: res }],
      };
    }
  }
};

export const updateFromEvent = ({
  msg,
  model,
}: {
  msg: SpaceServerEvt;
  model: Model;
}): {
  model: Model;
  cmd?: SpaceServerCmd<ToClient>[];
} => {
  if (msg.t === "user-left") {
    const { userId } = msg;

    const player: PlayerType | "none" =
      model.O === userId ? "O" : model.X === userId ? "X" : "none";

    if (player === "none") {
      return { model };
    }

    const other = toOpposite(player);

    const modelNew: Model = {
      type: "setup",
      maxRoundCount: model.maxRoundCount,
      moveTimeLimit: model.moveTimeLimit,
      X: model.X,
      O: model.O,
      [player]: "none",
      [other]: model[other],
    };

    return {
      model: modelNew,
      cmd: [{ t: "send-to-space", msg: ["player-left", modelNew] }],
    };
  }

  return {
    model,
  };
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  switch (model.type) {
    case "setup": {
      return Sub.None;
    }

    case "game-over": {
      return Sub.None;
    }

    case "game": {
      const currentRound = Round.toCurrent(model.round);

      switch (currentRound.type) {
        case "RoundStarted": {
          const turn = toTurn(currentRound.board);
          return Time.interval(
            `${intervalId}-move-count-down-${turn}`,
            TimeSpan.fromSeconds(1),
            (): Msg => ["MoveCountDown"]
          );
        }

        case "RoundStarting": {
          return Time.interval(
            `${intervalId}-round-count-down`,
            TimeSpan.fromSeconds(3 / 4),
            (): Msg => ["RoundCountDown"]
          );
        }

        case "RoundOver": {
          return Sub.None;
        }
      }
    }
  }
};
