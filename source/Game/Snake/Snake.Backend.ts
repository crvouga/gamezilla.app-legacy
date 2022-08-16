import * as Bridge from "../../Bridge"
import { Cmd, Result, Sub, Time } from "../../Core"
import { ClientId, RoomId } from "../../Data"
import {
  BackendModel,
  BackendMsg,
  ChangeDirection,
  ChangeDirectionResult,
  ChangePlayer,
  ChangePlayerResult,
  initSharedModel,
  SharedModel,
  ToBackend,
  ToFrontend,
  ToggleStatus,
  ToggleStatusResult,
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
    ["Game", roomId, ["Snake", msg]],
  ])
}

export const broadcast = (roomId: RoomId.RoomId, msg: ToFrontend) => {
  return Bridge.broadcast(["GameRoom", ["Game", roomId, ["Snake", msg]]])
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
      const modelNew: Model = { ...Snake.step(model), player: model.player }

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
    case "ToggleStatus": {
      const result = toggleStatus(msg[1], model)

      const toFrontend = sendToFrontend([clientId], roomId, [
        "ToggleStatusResulted",
        result,
      ])

      if (result.type === "Err") {
        return [model, toFrontend]
      }

      const modelNew = result.value

      return [
        modelNew,
        Cmd.batch([toFrontend, broadcast(roomId, ["Sync", modelNew])]),
      ]
    }

    case "ChangeDirection": {
      const result = changeDirection(msg[1], model)

      const toFrontend = sendToFrontend([clientId], roomId, [
        "ChangeDirectionResulted",
        result,
      ])

      if (result.type === "Err") {
        return [model, toFrontend]
      }

      const modelNew = result.value

      return [
        modelNew,
        Cmd.batch([toFrontend, broadcast(roomId, ["Sync", modelNew])]),
      ]
    }

    case "ChangePlayer": {
      const result = changePlayer(msg[1], model)

      const toFrontend = sendToFrontend([clientId], roomId, [
        "ChangePlayerResulted",
        result,
      ])

      if (result.type === "Err") {
        return [model, toFrontend]
      }

      const modelNew = result.value

      return [
        modelNew,
        Cmd.batch([toFrontend, broadcast(roomId, ["Sync", modelNew])]),
      ]
    }
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (
  roomId: RoomId.RoomId,
  model: Model,
): Sub.Sub<Msg> => {
  switch (model.status) {
    case "Paused": {
      return Sub.None
    }

    case "Playing": {
      return Time.every<Msg>(roomId, model.tickRate, () => ["Tick"])
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

export const changePlayer = (
  { player }: ChangePlayer[1],
  model: SharedModel,
): ChangePlayerResult => {
  const modelNew: SharedModel = {
    ...model,
    player: player,
  }

  return Result.Ok(modelNew)
}

export const changeDirection = (
  { direction, userId }: ChangeDirection[1],
  model: SharedModel,
): ChangeDirectionResult => {
  if (model.player[0] === "None") {
    return Result.Err("user_must_be_the_current_player")
  }

  const playerUserId = model.player[1]

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
  if (model.player[0] === "None") {
    return Result.Err("user_must_be_the_current_player")
  }

  if (model.player[1] !== userId) {
    return Result.Err("user_must_be_the_current_player")
  }

  const modelNew: SharedModel = {
    ...model,
    status: model.status === "Paused" ? "Playing" : "Paused",
  }

  return Result.Ok(modelNew)
}
