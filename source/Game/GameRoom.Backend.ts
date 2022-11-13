import { Cmd, exhaustive, p, Sub } from "../Core"
import { RoomId, UserId } from "../Data"
import * as Game from "./Game.Backend"
import {
  BackendModel,
  BackendMsg,
  BackendRoom,
  handle,
  Res,
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
    sendToUser: (userIds: UserId.UserId[], msg: ToFrontend) => Cmd<never>
  },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
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
          sendToRoom: (msg) => sendToRoom({ sendToUser, model, roomId, msg: ["Games", roomId, msg] }),
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
    sendToClient: (msg: ToFrontend) => Cmd<never>
    sendToUser: (userId: UserId.UserId[], msg: ToFrontend) => Cmd<never>
    broadcast: (msg: ToFrontend) => Cmd<never>
  },
  msg: ToBackend,
  model: Model,
): [Model, Cmd<BackendMsg>] => {
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
          sendToRoom: (msg) => sendToRoom({ sendToUser, model, roomId, msg: ["Games", roomId, msg] }),
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

    case 'ChangeGame':
    case 'ChangeHost':
    case 'RoomJoin':
    case 'RoomDestroy':
    case "RoomCreate": {
      const res: Res = [msg[0], handle(msg, model)]

      if (res[1].type === "Err") {
        return [model, sendToClient(res)]
      }

      return [res[1].value, broadcast(res)]
    }

    case "RoomLeave": {
      const res: Res = [msg[0], handle(msg, model)]

      if (res[1].type === "Err") {
        return [model, sendToClient(res)]
      }

      const modelAfter = res[1].value

      const user = model.users[msg[1].userId]

      if (!user) {
        return [res[1].value, broadcast(res)]
      }

      const room = model.rooms[user.roomId]

      if (!room) {
        return [res[1].value, broadcast(res)]
      }

      const [gameNew, cmd] = Game.updateRoomLeave(
        { sendToRoom: msg => sendToRoom({ sendToUser, model: modelAfter, roomId: room.roomId, msg: ['Games', room.roomId, msg] }) },
        user.userId,
        room.game
      )

      const roomNew: BackendRoom = {
        ...room,
        game: gameNew
      }

      const modelNew: Model = {
        ...res[1].value,
        rooms: {
          ...res[1].value.rooms,
          [roomNew.roomId]: roomNew
        }
      }

      return [
        modelNew,
        Cmd.batch([
          broadcast(res),
          p(cmd, Cmd.map((msg): Msg => ['Games', room.roomId, msg]))
        ])
      ]
    }

    default:
      return exhaustive(msg[0])
  }
}

const sendToRoom = ({
  model,
  sendToUser,
  roomId,
  msg,
}: {
  model: Model,
  sendToUser: (userIds: UserId.UserId[], msg: ToFrontend) => Cmd<never>,
  roomId: RoomId.RoomId,
  msg: ToFrontend,
}): Cmd<never> => {
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
  { sendToClient }: { sendToClient: (msg: ToFrontend) => Cmd<Msg> },
  model: Model,
): Cmd<Msg> => {
  return sendToClient(["Sync", model])
}


//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub<Msg> => {
  const subs: Sub<Msg>[] = []

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
