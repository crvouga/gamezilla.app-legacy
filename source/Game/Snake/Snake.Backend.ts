import * as Bridge from "../../Bridge"
import { Cmd, Result, Sub, Time } from "../../Core"
import { ClientId, RoomId } from "../../Data"
import {
  BackendModel,
  BackendMsg,
  InputDirection,
  InputDirectionResulted,
  InputPlayer,
  InputPlayerResulted,
  initSharedModel,
  SharedModel,
  ToBackend,
  ToFrontend,
  ToggleStatus,
  ToggleStatusResult,
  Request,
  Response,
  startGame,
} from "./Snake.Types"
import * as Snake from "./Snake"

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
// Bridge
//
//
//

export const sendToFrontend = (
  clientIds: ClientId.ClientId[],
  roomId: RoomId.RoomId,
  msg: ToFrontend,
) => {
  return Bridge.sendToFrontend(clientIds, [
    "GameRoom",
    ["Games", roomId, ["Snake", msg]],
  ])
}

export const broadcast = (roomId: RoomId.RoomId, msg: ToFrontend) => {
  return Bridge.broadcast(["GameRoom", ["Games", roomId, ["Snake", msg]]])
}

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = (
  { roomId }: { roomId: RoomId.RoomId },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Tick": {
      const modelNew: Model = {
        ...Snake.step(model),
        gameStatus: model.gameStatus,
      }

      return [modelNew, broadcast(roomId, ["Sync", modelNew])]
    }
  }
}

export const updateFromFrontend = (
  { clientId, roomId }: { clientId: ClientId.ClientId; roomId: RoomId.RoomId },
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "StartGame": {
      return updateRequest(
        { clientId, roomId },
        ["StartGameResulted", startGame(model)],
        model,
      )
    }

    case "ToggleStatus": {
      return updateRequest(
        { clientId, roomId },
        ["ToggleStatusResulted", toggleStatus(msg[1], model)],
        model,
      )
    }

    case "InputDirection": {
      return updateRequest(
        { clientId, roomId },
        ["InputDirectionResulted", inputDirection(msg[1], model)],
        model,
      )
    }

    case "InputPlayer": {
      return updateRequest(
        { clientId, roomId },
        ["InputPlayerResulted", inputPlayer(msg[1], model)],
        model,
      )
    }
  }
}

const updateRequest = (
  { clientId, roomId }: { clientId: ClientId.ClientId; roomId: RoomId.RoomId },
  response: Response,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  const toFrontend = sendToFrontend([clientId], roomId, response)

  if (response[1].type === "Err") {
    return [model, toFrontend]
  }

  const modelNew = response[1].value

  return [
    modelNew,
    Cmd.batch([toFrontend, broadcast(roomId, ["Sync", modelNew])]),
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
