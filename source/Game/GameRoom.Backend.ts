import { Cmd, exhaustive, p, Sub } from "../Core"
import { RoomId, UserId } from "../Data"
import * as Game from "./Game.Backend"
import {
  BackendModel,
  BackendMsg, BackendRoom, closeGame, createRoom, joinRoom, leaveRoom, openGame, Response,
  ToBackend,
  ToFrontend
} from "./GameRoom.Types"

//
//
//
// Model
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
// Update
//
//
//

export type Msg = BackendMsg

export const update = (
  {
    sendToUser,
  }: {
    sendToUser: (userIds: UserId.UserId[], msg: ToFrontend) => Cmd.Cmd<never>
  },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  const sendToRoom = makeSendToRoom({ sendToUser, model })

  switch (msg[0]) {
    case "Games": {
      const roomId = msg[1]

      const room = model.rooms[roomId]

      if (!room) {
        return [model, Cmd.None]
      }

      const gameMsg = msg[2]

      const [gameNew, gameCmd] = Game.update(
        {
          sendToRoom: (msg) => sendToRoom(roomId, ["Games", roomId, msg]),
        },
        gameMsg,
        room.game,
      )


      const roomNew: BackendRoom = {
        ...room,
        game: gameNew,
      }

      const modelNew: Model = {
        ...model,
        rooms: {
          ...model.rooms,
          [roomId]: roomNew,
        },
      }

      return [
        modelNew,
        p(
          gameCmd,
          Cmd.map((msg): Msg => ["Games", roomId, msg]),
        ),
      ]
    }
  }
}

export const updateFromFrontend = (
  {
    sendToClient,
    sendToUser,
    broadcast,
  }: {
    sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>
    sendToUser: (userId: UserId.UserId[], msg: ToFrontend) => Cmd.Cmd<never>
    broadcast: (msg: ToFrontend) => Cmd.Cmd<never>
  },
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<BackendMsg>] => {
  const sendToRoom = makeSendToRoom({ sendToUser, model })

  switch (msg[0]) {
    case "Games": {
      const roomId = msg[1]

      const room = model.rooms[roomId]

      if (!room) {
        return [model, Cmd.None]
      }

      const gameMsg = msg[2]

      const [gameNew, gameCmd] = Game.updateFromFrontend(
        {
          hostId: room.hostId,
          sendToClient: (msg) => sendToClient(["Games", roomId, msg]),
          sendToRoom: (msg) => sendToRoom(roomId, ["Games", roomId, msg]),
        },
        gameMsg,
        room.game,
      )

      const roomNew: BackendRoom = {
        ...room,
        game: gameNew,
      }

      const modelNew: Model = {
        ...model,
        rooms: {
          ...model.rooms,
          [roomId]: roomNew,
        },
      }

      return [
        modelNew,
        p(
          gameCmd,
          Cmd.map((msg): Msg => ["Games", roomId, msg]),
        ),
      ]
    }

    case "CreateRoom": {
      return updateResponse({ sendToClient, broadcast }, model, [
        "CreateRoom_Done",
        createRoom(msg[1], model),
      ])
    }

    case "LeaveRoom": {
      return updateResponse({ sendToClient, broadcast }, model, [
        "LeaveRoom_Done",
        leaveRoom(msg[1], model),
      ])
    }

    case "JoinRoom": {
      return updateResponse({ sendToClient, broadcast }, model, [
        "JoinRoom_Done",
        joinRoom(msg[1], model),
      ])
    }

    case "OpenGame": {
      return updateResponse({ sendToClient, broadcast }, model, [
        "OpenGame_Done",
        openGame(msg[1], model),
      ])
    }

    case "CloseGame": {
      return updateResponse({ sendToClient, broadcast }, model, [
        "CloseGame_Done",
        closeGame(msg[1], model),
      ])
    }

    default:
      return exhaustive(msg[0])
  }
}

const updateResponse = (
  {
    sendToClient,
    broadcast,
  }: {
    sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>
    broadcast: (msg: ToFrontend) => Cmd.Cmd<never>
  },
  model: Model,
  response: Response,
): [Model, Cmd.Cmd<BackendMsg>] => {
  if (response[1].type === "Err") {
    return [
      model,
      Cmd.batch([
        sendToClient(response),
        // is this needed?
        sendToClient(["Sync", model])
      ]),
    ]
  }

  const modelNew = response[1].value

  return [
    modelNew,
    Cmd.batch([broadcast(response),]),
  ]
}


const makeSendToRoom = ({ model, sendToUser }: { model: Model, sendToUser: (userIds: UserId.UserId[], msg: ToFrontend) => Cmd.Cmd<never> }) => (
  roomId: RoomId.RoomId,
  msg: ToFrontend,
): Cmd.Cmd<never> => {
  const userIds: UserId.UserId[] = []

  for (const userId in model.users) {
    if (!UserId.is(userId)) {
      continue
    }

    const user = model.users[userId]

    if (!user) {
      continue
    }

    if (user.roomId === roomId) {
      userIds.push(userId)
    }

  }

  return sendToUser(userIds, msg)
}


//
//
//
//
//
//
//

export const onClientConnected = (
  { sendToClient }: { sendToClient: (msg: ToFrontend) => Cmd.Cmd<Msg> },
  model: Model,
): Cmd.Cmd<Msg> => {
  return sendToClient(["Sync", model])
}


//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  const subs: Sub.Sub<Msg>[] = []

  for (const roomId in model.rooms) {
    if (!RoomId.is(roomId)) {
      continue
    }

    const room = model.rooms[roomId]

    if (!room) {
      continue
    }

    const sub = p(
      Game.subscriptions(roomId, room.game),
      Sub.map((msg): Msg => ["Games", roomId, msg]),
    )

    subs.push(sub)
  }

  return Sub.batch(subs)
}
