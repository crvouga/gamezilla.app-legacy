import { Cmd, Result, Sub, Time } from "@gamezilla/shared/core";
import * as Snake from "./snake";
import {
  ServerModel,
  ServerMsg,
  initSharedModel,
  InputDirection,
  InputDirection_Done,
  InputPlayer,
  InputPlayer_Done,
  Response,
  SharedModel,
  startGame,
  ToServer,
  ToClient,
  ToggleStatus,
  ToggleStatusResult,
} from "./snake.shared";

//
//
//
// Model
//
//
//

export type Model = ServerModel;

export const init = initSharedModel;

//
//
//
// Update
//
//
//

export type Msg = ServerMsg;

export const update = (
  { broadcast }: { broadcast: (msg: ToClient) => Cmd },
  msg: Msg,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "tick": {
      const modelNew: Model = {
        ...Snake.step(model),
        gameStatus: model.gameStatus,
      };

      return [modelNew, broadcast(["tick", modelNew])];
    }
  }
};

export const updateFromClient = (
  {
    sendToClient,
    broadcast,
  }: {
    sendToClient: (msg: ToClient) => Cmd;
    broadcast: (msg: ToClient) => Cmd;
  },
  msg: ToServer,
  model: Model
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "start-game": {
      return updateRequest(
        { sendToClient, broadcast },
        ["StartGame_Done", startGame(model)],
        model
      );
    }

    case "ToggleStatus": {
      return updateRequest(
        { sendToClient, broadcast },
        ["ToggleStatus_Done", toggleStatus(msg[1], model)],
        model
      );
    }

    case "input-direction": {
      return updateRequest(
        { sendToClient, broadcast },
        ["InputDirection_Done", inputDirection(msg[1], model)],
        model
      );
    }

    case "InputPlayer": {
      return updateRequest(
        { sendToClient, broadcast },
        ["InputPlayer_Done", inputPlayer(msg[1], model)],
        model
      );
    }
  }
};

const updateRequest = (
  {
    sendToClient,
    broadcast,
  }: {
    sendToClient: (msg: ToClient) => Cmd;
    broadcast: (msg: ToClient) => Cmd;
  },
  response: Response,
  model: Model
): [Model, Cmd<Msg>] => {
  if (response[1].t === "err") {
    return [model, sendToClient(response)];
  }

  const modelNew = response[1].value;

  return [
    modelNew,
    Cmd.batch([broadcast(response), broadcast(["tick", modelNew])]),
  ];
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  switch (model.status) {
    case "Paused": {
      return Sub.None;
    }

    case "Playing": {
      return Time.every<Msg>(intervalId, model.tickRate, () => ["tick"]);
    }
  }
};

//
//
//
//
//
//
//

export const inputPlayer = (
  player: InputPlayer[1],
  model: SharedModel
): InputPlayer_Done[1] => {
  if (model.gameStatus.type !== "GameSetup") {
    return Result.Err("must_be_in_game_setup");
  }

  const modelNew: SharedModel = {
    ...model,
    gameStatus: {
      type: "GameSetup",
      player: player,
    },
  };

  return Result.Ok(modelNew);
};

export const inputDirection = (
  { direction, userId }: InputDirection[1],
  model: SharedModel
): InputDirection_Done[1] => {
  if (model.gameStatus.type !== "GameStarted") {
    return Result.Err("must_be_in_game_started");
  }

  const playerUserId = model.gameStatus.player[1];

  if (playerUserId !== userId) {
    return Result.Err("user_must_be_the_current_player");
  }

  const modelNew: SharedModel = {
    ...model,
    ...Snake.enqueueDirection(direction, model),
    status: "Playing",
  };

  return Result.Ok(modelNew);
};

export const toggleStatus = (
  { userId }: ToggleStatus[1],
  model: SharedModel
): ToggleStatusResult => {
  if (model.gameStatus.type !== "GameStarted") {
    return Result.Err("must_be_in_game_started");
  }

  if (model.gameStatus.player[1] !== userId) {
    return Result.Err("user_must_be_the_current_player");
  }

  const modelNew: SharedModel = {
    ...model,
    status: model.status === "Paused" ? "Playing" : "Paused",
  };

  return Result.Ok(modelNew);
};
