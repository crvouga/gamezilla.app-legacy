import { Eff, Result, Sub, Time } from "gamezilla/@SHARED/core";
import * as Snake from "./@SHARED/snake";
import {
  CoreModel,
  InputDirection,
  InputDirection_Done,
  InputPlayer,
  InputPlayer_Done,
  Response,
  ServerModel,
  MsgServer,
  MsgToServer,
  ToggleStatus,
  ToggleStatusResult,
  initCoreModel,
  startGame,
} from "./snake.core";

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

export type Msg = MsgServer;

export const update = (msg: Msg, model: Model): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case "tick": {
      const modelNew: Model = {
        ...Snake.step(model),
        gameStatus: model.gameStatus,
      };

      return [modelNew, Eff.None];
    }
  }
};

export const updateFromClient = (
  msg: MsgToServer,
  model: Model
): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case "start-game": {
      return updateRequest(["StartGame_Done", startGame(model)], model);
    }

    case "ToggleStatus": {
      return updateRequest(
        ["ToggleStatus_Done", toggleStatus(msg[1], model)],
        model
      );
    }

    case "input-direction": {
      return updateRequest(
        ["InputDirection_Done", inputDirection(msg[1], model)],
        model
      );
    }

    case "InputPlayer": {
      return updateRequest(
        ["InputPlayer_Done", inputPlayer(msg[1], model)],
        model
      );
    }
  }
};

const updateRequest = (response: Response, model: Model): [Model, Eff<Msg>] => {
  if (response[1].t === "err") {
    return [model, Eff.None];
  }

  const modelNew = response[1].value;

  return [modelNew, Eff.None];
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
      return Time.interval<Msg>(intervalId, model.tickRate, () => ["tick"]);
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
  model: CoreModel
): InputPlayer_Done[1] => {
  if (model.gameStatus.type !== "GameSetup") {
    return Result.err("must_be_in_game_setup");
  }

  const modelNew: CoreModel = {
    ...model,
    gameStatus: {
      type: "GameSetup",
      player: player,
    },
  };

  return Result.ok(modelNew);
};

export const inputDirection = (
  { direction, userId }: InputDirection[1],
  model: CoreModel
): InputDirection_Done[1] => {
  if (model.gameStatus.type !== "GameStarted") {
    return Result.err("must_be_in_game_started");
  }

  const playerUserId = model.gameStatus.player[1];

  if (playerUserId !== userId) {
    return Result.err("user_must_be_the_current_player");
  }

  const modelNew: CoreModel = {
    ...model,
    ...Snake.enqueueDirection(direction, model),
    status: "Playing",
  };

  return Result.ok(modelNew);
};

export const toggleStatus = (
  { userId }: ToggleStatus[1],
  model: CoreModel
): ToggleStatusResult => {
  if (model.gameStatus.type !== "GameStarted") {
    return Result.err("must_be_in_game_started");
  }

  if (model.gameStatus.player[1] !== userId) {
    return Result.err("user_must_be_the_current_player");
  }

  const modelNew: CoreModel = {
    ...model,
    status: model.status === "Paused" ? "Playing" : "Paused",
  };

  return Result.ok(modelNew);
};
