import * as Bridge from "../Bridge/Backend"
import { ClientId } from "../Bridge/Bridge"
import { Cmd, exhaustive, Sub } from "../Core"
import * as Rooms from "./Rooms"
import { BackendModel, BackendMsg, ToBackend, ToFrontend } from "./Types"

//
//
//
// Model
//
//
//

type Model = BackendModel

export const init: Model = {
  rooms: Rooms.init,
}

//
//
//
// Bridge
//
//
//

const broadcast = (toFrontend: ToFrontend) => {
  return Bridge.broadcast(["GameRoom", toFrontend])
}

const sendToFrontend = (
  clientIds: string | string[],
  toFrontend: ToFrontend,
) => {
  return Bridge.sendToFrontend(clientIds, ["GameRoom", toFrontend])
}

//
//
//
// Update
//
//
//

export const update = (
  msg: BackendMsg,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "Noop": {
      return [model, Cmd.None]
    }
  }
}

export const updateFromFrontend = (
  clientId: ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "CreateRoom": {
      const result = Rooms.createRoom(msg[1], model.rooms)

      const toFrontend = sendToFrontend(clientId, [
        "CreateRoomResulted",
        result,
      ])

      if (result.type === "Err") {
        return [model, toFrontend]
      }

      const modelNew: Model = {
        ...model,
        rooms: result.value.model,
      }

      return [
        modelNew,
        Cmd.batch([broadcast(["Sync", modelNew.rooms]), toFrontend]),
      ]
    }

    case "Init": {
      return [
        model,
        Cmd.batch([sendToFrontend(clientId, ["Sync", model.rooms])]),
      ]
    }

    case "LeaveRoom": {
      const result = Rooms.leaveRoom(msg[1], model.rooms)

      const toFrontend = sendToFrontend(clientId, ["LeaveRoomResulted", result])

      if (result.type === "Err") {
        return [model, toFrontend]
      }

      const modelNew: Model = {
        ...model,
        rooms: result.value,
      }

      return [
        modelNew,
        Cmd.batch([broadcast(["Sync", modelNew.rooms]), toFrontend]),
      ]
    }

    case "JoinRoom": {
      const result = Rooms.joinRoom(msg[1], model.rooms)

      const toFrontend = sendToFrontend(clientId, ["JoinRoomResulted", result])

      if (result.type === "Err") {
        return [model, toFrontend]
      }

      const modelNew: Model = {
        ...model,
        rooms: result.value,
      }

      return [
        modelNew,
        Cmd.batch([broadcast(["Sync", modelNew.rooms]), toFrontend]),
      ]
    }

    case "StartGame": {
      const result = Rooms.startGame(msg[1], model.rooms)

      const toFrontend = sendToFrontend(clientId, ["StartGameResulted", result])

      if (result.type === "Err") {
        return [model, toFrontend]
      }

      const modelNew: Model = {
        ...model,
        rooms: result.value,
      }

      return [
        modelNew,
        Cmd.batch([toFrontend, broadcast(["Sync", modelNew.rooms])]),
      ]
    }

    case "StopGame": {
      const result = Rooms.stopGame(msg[1], model.rooms)

      const toFrontend = sendToFrontend(clientId, ["StopGameResulted", result])

      if (result.type === "Err") {
        return [model, toFrontend]
      }

      const modelNew: Model = {
        ...model,
        rooms: result.value,
      }

      return [
        modelNew,
        Cmd.batch([toFrontend, broadcast(["Sync", modelNew.rooms])]),
      ]
    }

    default:
      return exhaustive(msg[0])
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (): Sub.Sub<BackendMsg> => {
  return Sub.None
}
