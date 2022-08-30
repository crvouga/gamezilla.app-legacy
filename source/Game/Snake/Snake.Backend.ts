import { Cmd, Result, Sub, Time } from "../../Core"
import { ClientId, RoomId } from "../../Data"
import * as Snake from "./Snake"
import {
  BackendModel,
  BackendMsg,
  initSharedModel,
  InputDirection,
  InputDirectionResulted,
  InputPlayer,
  InputPlayerResulted,
  Response,
  SharedModel,
  startGame,
  ToBackend,
  ToFrontend,
  ToggleStatus,
  ToggleStatusResult,
} from "./Snake.Types"

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init = initSharedModel

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = (
  { sendToRoom }: { sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never> },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Tick": {
      const modelNew: Model = {
        ...Snake.step(model),
        gameStatus: model.gameStatus,
      }

      return [modelNew, sendToRoom(["Sync", modelNew])]
    }
  }
}

export const updateFromFrontend = (
  {
    sendToClient,
    sendToRoom,
  }: {
    sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>
    sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never>
  },
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "StartGame": {
      return updateRequest(
        { sendToClient, sendToRoom },
        ["StartGameResulted", startGame(model)],
        model,
      )
    }

    case "ToggleStatus": {
      return updateRequest(
        { sendToClient, sendToRoom },
        ["ToggleStatusResulted", toggleStatus(msg[1], model)],
        model,
      )
    }

    case "InputDirection": {
      return updateRequest(
        { sendToClient, sendToRoom },
        ["InputDirectionResulted", inputDirection(msg[1], model)],
        model,
      )
    }

    case "InputPlayer": {
      return updateRequest(
        { sendToClient, sendToRoom },
        ["InputPlayerResulted", inputPlayer(msg[1], model)],
        model,
      )
    }
  }
}

const updateRequest = (
  {
    sendToClient,
    sendToRoom,
  }: {
    sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>
    sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never>
  },
  response: Response,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  if (response[1].type === "Err") {
    return [model, sendToClient(response)]
  }

  const modelNew = response[1].value

  return [
    modelNew,
    Cmd.batch([sendToRoom(response), sendToRoom(["Sync", modelNew])]),
  ]
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (
  intervalId: string,
  model: Model,
): Sub.Sub<Msg> => {
  switch (model.status) {
    case "Paused": {
      return Sub.None
    }

    case "Playing": {
      return Time.every<Msg>(intervalId, model.tickRate, () => ["Tick"])
    }
  }
}

//
//
//
//
//
//
//

export const inputPlayer = (
  player: InputPlayer[1],
  model: SharedModel,
): InputPlayerResulted[1] => {
  if (model.gameStatus.type !== "GameSetup") {
    return Result.Err("must_be_in_game_setup")
  }

  const modelNew: SharedModel = {
    ...model,
    gameStatus: {
      type: "GameSetup",
      player: player,
    },
  }

  return Result.Ok(modelNew)
}

export const inputDirection = (
  { direction, userId }: InputDirection[1],
  model: SharedModel,
): InputDirectionResulted[1] => {
  if (model.gameStatus.type !== "GameStarted") {
    return Result.Err("must_be_in_game_started")
  }

  const playerUserId = model.gameStatus.player[1]

  if (playerUserId !== userId) {
    return Result.Err("user_must_be_the_current_player")
  }

  const modelNew: SharedModel = {
    ...model,
    ...Snake.enqueueDirection(direction, model),
    status: "Playing",
  }

  return Result.Ok(modelNew)
}

export const toggleStatus = (
  { userId }: ToggleStatus[1],
  model: SharedModel,
): ToggleStatusResult => {
  if (model.gameStatus.type !== "GameStarted") {
    return Result.Err("must_be_in_game_started")
  }

  if (model.gameStatus.player[1] !== userId) {
    return Result.Err("user_must_be_the_current_player")
  }

  const modelNew: SharedModel = {
    ...model,
    status: model.status === "Paused" ? "Playing" : "Paused",
  }

  return Result.Ok(modelNew)
}
