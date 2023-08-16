import { SpaceEvent } from "gamezilla/app/space/@SHARED";
import { Eff, Sub, Time } from "gamezilla/@SHARED/core";
import { PlayerType, toOpposite, toTurn } from "../tic-tic-toe/tic-tac-toe";
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
  {
    broadcast,
  }: {
    broadcast: (msg: ToClient) => Eff;
  },
  msg: Msg,
  model: Model
): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case "RoundCountDown": {
      const result = roundCountDown(model);

      const modelNew = result.t === "err" ? model : result.value;

      return [modelNew, broadcast(["RoundCountDown_Done", result])];
    }

    case "MoveCountDown": {
      const result = moveCountDown(model);

      const modelNew = result.t === "err" ? model : result.value;

      return [modelNew, broadcast(["MoveCountDown_Done", result])];
    }
  }
};

export const updateFromClient = (
  {
    sendToClient,
    broadcast,
  }: {
    sendToClient: (msg: ToClient) => Eff;
    broadcast: (msg: ToClient) => Eff;
  },
  msg: ToServer,
  model: Model
): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case "InputPlayer": {
      const result = inputPlayer(msg[1], model);

      if (result.t === "err") {
        return [model, sendToClient(["InputPlayer_Done", result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(["InputPlayer_Done", result])];
    }

    case "stop-playing": {
      const result = stopPlaying(msg[1], model);

      if (result.t === "err") {
        return [model, sendToClient(["StopPlaying_Done", result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(["StopPlaying_Done", result])];
    }

    case "start-game": {
      const result = startGame(msg[1], model);

      if (result.t === "err") {
        return [model, sendToClient(["StartGame_Done", result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(["StartGame_Done", result])];
    }

    case "resign": {
      const result = resign(msg[1], model);

      if (result.t === "err") {
        return [model, sendToClient(["resign_Done", result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(["resign_Done", result])];
    }

    case "input-move": {
      const result = inputMove(msg[1], model);

      if (result.t === "err") {
        return [model, sendToClient(["input-move-done", result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(["input-move-done", result])];
    }

    case "NewGame": {
      const result = NewGame(msg[1], model);

      if (result.t === "err") {
        return [model, sendToClient(["NewGame_Done", result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(["NewGame_Done", result])];
    }

    case "InputBestOutOf": {
      const result = inputBestOutOf(msg[1], model);

      if (result.t === "err") {
        return [model, sendToClient(["InputBestOutOf_Done", result])];
      }

      const modelNew = result.value;

      return [modelNew, broadcast(["InputBestOutOf_Done", result])];
    }

    case "RematchAccept": {
      const result = rematchAccept(msg[1], model);
      const res: Res = ["RematchAccept_Done", result];

      if (result.t === "err") {
        return [model, sendToClient(res)];
      }

      return [result.value, broadcast(res)];
    }

    case "RematchAsk": {
      const result = rematchAsk(msg[1], model);
      const res: Res = ["RematchAsk_Done", result];

      if (result.t === "err") {
        return [model, sendToClient(res)];
      }

      return [result.value, broadcast(res)];
    }

    case "RematchDecline": {
      const result = rematchDecline(msg[1], model);
      const res: Res = ["RematchDecline_Done", result];

      if (result.t === "err") {
        return [model, sendToClient(res)];
      }

      return [result.value, broadcast(res)];
    }

    case "Rematch_Cancel": {
      const result = rematchCancel(msg[1], model);
      const res: Res = ["Rematch_Cancel_Done", result];

      if (result.t === "err") {
        return [model, sendToClient(res)];
      }

      return [result.value, broadcast(res)];
    }

    default: {
      return [model, Eff.None];
    }
  }
};

export const updateFromEvent = ({
  msg,
  model,
  broadcast,
}: {
  broadcast: (m: ToClient) => Eff;
  msg: SpaceEvent;
  model: Model;
}): {
  model: Model;
  eff?: Eff<Msg>;
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

    return { model: modelNew, eff: broadcast(["player-left", modelNew]) };
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
          return Time.every(
            `${intervalId}-move-count-down-${turn}`,
            1000,
            (): Msg => ["MoveCountDown"]
          );
        }

        case "RoundStarting": {
          return Time.every(
            `${intervalId}-round-count-down`,
            750,
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
