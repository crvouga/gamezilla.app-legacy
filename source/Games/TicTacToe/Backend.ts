import * as Bridge from "../../Bridge/Backend"
import { ClientId } from "../../Bridge/Bridge"
import { Cmd, Result, Sub } from "../../Core"
import * as Board from "./Board"
import { BackendModel, BackendMsg, ToBackend, ToFrontend } from "./Types"
import * as Room from "./Room"

//
//
//
// ModelØ
//
//
//

export type Model = BackendModel

export const init: Model = {
  rooms: {},
  users: {},
}

//
//
//
// Bridge
//
//
//

const broadcast = (toFrontend: ToFrontend): Cmd.Cmd<never> => {
  // return Bridge.broadcast(["Games", ["", ]])
  return Cmd.None
}

const sendToFrontend = (
  clientId: string,
  toFrontend: ToFrontend,
): Cmd.Cmd<never> => {
  // return Bridge.sendToFrontend(clientId, ["Games", ["TicTacToe", toFrontend]])
  return Cmd.None
}

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClientDisconnected":
      return [model, broadcast(["Sync", model])]

    case "ClientConnected":
      return [model, broadcast(["Sync", model])]
  }
}

export const updateFromFrontend = (
  clientId: ClientId,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "PlayAgain": {
      const { currentUserId } = msg[1]

      const maybeCurrentRoom = Room.toRoom(currentUserId, model)
      if (maybeCurrentRoom.type === "None") {
        return [
          model,
          sendToFrontend(clientId, [
            "PlayAgainResulted",
            Result.Err("User is not in a room"),
          ]),
        ]
      }
      const room = maybeCurrentRoom.value

      const status = Room.toStatus(room)

      if (status.type === "NotReady") {
        return [
          model,
          sendToFrontend(clientId, [
            "PlayAgainResulted",
            Result.Err("To play again room must to be in a game over state"),
          ]),
        ]
      }

      if (status.status.type === "Turn") {
        return [
          model,
          sendToFrontend(clientId, [
            "PlayAgainResulted",
            Result.Err("To play again room must to be in a game over state"),
          ]),
        ]
      }

      const modelNew: Model = {
        ...model,
        rooms: {
          ...model.rooms,
          [room.roomId]: {
            ...room,
            board: Board.emptyBoard,
          },
        },
      }

      return [modelNew, Cmd.batch([broadcast(["Sync", modelNew])])]
    }

    case "RemovePlayer": {
      const { currentUserId, player } = msg[1]

      const result = Room.removePlayer({ userId: currentUserId, player }, model)

      const toFrontendCmd = sendToFrontend(clientId, [
        "RemovePlayerResulted",
        result,
      ])

      if (result.type === "Err") {
        return [model, toFrontendCmd]
      }

      return [
        result.value,
        Cmd.batch([toFrontendCmd, broadcast(["Sync", result.value])]),
      ]
    }

    case "StopPlaying": {
      const { player, currentUserId } = msg[1]

      const result = Room.stopPlaying({ userId: currentUserId, player }, model)

      const toFrontend = sendToFrontend(clientId, [
        "StopPlayingResulted",
        result,
      ])

      if (result.type === "Err") {
        return [model, toFrontend]
      }

      return [
        result.value,
        Cmd.batch([toFrontend, broadcast(["Sync", result.value])]),
      ]
    }

    case "StartPlaying": {
      const { currentUserId, player } = msg[1]

      const result = Room.startPlaying({ userId: currentUserId, player }, model)

      const toFrontend = sendToFrontend(clientId, [
        "StartPlayingResulted",
        result,
      ])

      if (result.type === "Err") {
        return [model, toFrontend]
      }

      return [
        result.value,
        Cmd.batch([toFrontend, broadcast(["Sync", result.value])]),
      ]
    }

    case "RestartGame": {
      const { currentUserId } = msg[1]

      const result = Room.restartGame({ userId: currentUserId }, model)

      const toFrontend = sendToFrontend(clientId, [
        "RestartGameResulted",
        result,
      ])

      if (result.type === "Err") {
        return [model, toFrontend]
      }

      return [
        result.value,
        Cmd.batch([toFrontend, broadcast(["Sync", result.value])]),
      ]
    }

    case "Move": {
      const { currentUserId, position } = msg[1]

      const result = Room.move({ userId: currentUserId, position }, model)

      const toFrontend = sendToFrontend(clientId, ["MoveResulted", result])

      if (result.type === "Err") {
        return [model, toFrontend]
      }

      return [
        result.value,
        Cmd.batch([toFrontend, broadcast(["Sync", result.value])]),
      ]
    }

    case "JoinRoom": {
      const { currentUserId, roomId } = msg[1]

      const result = Room.joinRoom({ userId: currentUserId, roomId }, model)

      const toFrontend = sendToFrontend(clientId, ["JoinRoomResulted", result])

      if (result.type === "Err") {
        return [model, toFrontend]
      }

      return [
        result.value,
        Cmd.batch([toFrontend, broadcast(["Sync", result.value])]),
      ]
    }

    case "LeaveRoom": {
      const { currentUserId } = msg[1]

      const result = Room.leaveRoom({ userId: currentUserId }, model)

      const toFrontend: ToFrontend = ["LeaveRoomResulted", result]

      if (result.type === "Err") {
        return [model, sendToFrontend(clientId, toFrontend)]
      }

      return [
        result.value,
        Cmd.batch([
          broadcast(["Sync", result.value]),
          sendToFrontend(clientId, toFrontend),
        ]),
      ]
    }

    case "Init":
      return [model, sendToFrontend(clientId, ["Sync", model])]

    case "CreateRoom":
      const { currentUserId } = msg[1]

      const result = Room.createRoom({ userId: currentUserId }, model)

      const toFrontend = sendToFrontend(clientId, [
        "CreateRoomResulted",
        result,
      ])

      if (result.type === "Err") {
        return [model, toFrontend]
      }

      return [
        result.value,
        Cmd.batch([toFrontend, broadcast(["Sync", result.value])]),
      ]
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (): Sub.Sub<Msg> => {
  return Sub.batch<Msg>([
    Bridge.onConnect((clientId) => ["ClientConnected", clientId]),
    Bridge.onDisconnect((clientId) => ["ClientDisconnected", clientId]),
  ])
}
