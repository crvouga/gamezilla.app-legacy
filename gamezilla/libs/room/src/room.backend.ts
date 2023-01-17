import { Cmd, exhaustive, p, Result, Sub } from "@gamezilla/core"
import { RoomId, UserId } from "@gamezilla/shared"
import * as Game from "./game.backend"
import {
  BackendModel,
  BackendMsg,
  handle,
  Problem,
  Res,
  ToBackend,
  ToFrontend,
} from "./room.types"

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
  games: {},
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
    sendToUser: (userIds: UserId[], msg: ToFrontend) => Cmd
  },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {

  switch (msg[0]) {
    case "Game": {
      const roomId = msg[1]

      const game = model.games[roomId]

      if (!game) {
        return [model, Cmd.None]
      }

      const gameMsg = msg[2]

      const [gameNew, gameCmd] = Game.update(
        {
          broadcast: (msg) =>
            sendToRoom({ sendToUser, model, roomId, msg: ["Game", msg] }),
        },
        gameMsg,
        game,
      )

      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [roomId]: gameNew,
        }
      }

      return [
        modelNew,
        p(
          gameCmd,
          Cmd.map((msg): Msg => ["Game", roomId, msg]),
        ),
      ]
    }
  }
}

type Wire = {
  sendToClient: (msg: ToFrontend) => Cmd
  sendToUser: (userId: UserId[], msg: ToFrontend) => Cmd
  broadcast: (msg: ToFrontend) => Cmd
}

export const updateFromFrontend = (
  ctx: { currentUserId: UserId },
  wire: Wire,
  msg: ToBackend,
  model: Model,
): [Model, Cmd<BackendMsg>] => {
  switch (msg[0]) {
    case "Game": {
      const user = model.users[ctx.currentUserId]

      if (!user) {
        return [model, Cmd.None]
      }

      const room = model.rooms[user.roomId]

      if (!room) {
        return [model, Cmd.None]
      }

      const game = model.games[user.roomId]

      if (!game) {
        return [model, Cmd.None]
      }

      const gameMsg = msg[1]

      const [gameNew, gameCmd] = Game.updateFromFrontend(
        {
          hostId: room.hostId,
          ctx,
          sendToClient: (msg) => wire.sendToClient(["Game", msg]),
          broadcast: (msg) =>
            sendToRoom({
              sendToUser: wire.sendToUser,
              model,
              roomId: room.roomId,
              msg: ["Game", msg],
            }),
        },
        gameMsg,
        game,
      )


      const modelNew: Model = {
        ...model,
        games: {
          ...model.games,
          [room.roomId]: gameNew
        }
      }

      return [
        modelNew,
        p(
          gameCmd,
          Cmd.map((msg): Msg => ["Game", room.roomId, msg]),
        ),
      ]
    }

    case "InputGame":
    case "ChangeHost":
    case "RoomJoin":
    case "RoomDestroy":
    case "RoomCreate": {
      const res: Res = [...msg, handle(msg, model)]

      if (res[2].type === "Err") {
        return [model, wire.sendToClient(res)]
      }

      return [res[2].value, wire.broadcast(res)]
    }

    case "RoomLeave": {
      const roomLeaveResult = handle(
        ["RoomLeave", { userId: msg[1].userId }],
        model,
      )
      return updateRoomLeave(wire, msg[1].userId, roomLeaveResult, model)
    }

    case "RoomLeaveThenJoin": {
      const roomLeft = handle(["RoomLeave", { userId: msg[1].userId }], model)
      const roomLeftUpdate = updateRoomLeave(
        wire,
        msg[1].userId,
        roomLeft,
        model,
      )
      if (roomLeft.type === "Err") {
        return roomLeftUpdate
      }
      const roomJoined = handle(["RoomJoin", msg[1]], roomLeftUpdate[0])
      if (roomJoined.type === "Err") {
        return [
          roomLeftUpdate[0],
          wire.sendToClient(["RoomJoin", msg[1], roomJoined]),
        ]
      }
      return [
        roomJoined.value,
        Cmd.batch([
          wire.broadcast(["RoomLeave", msg[1], roomJoined]),
          roomLeftUpdate[1],
        ]),
      ]
    }

    case "RoomEndThenJoin": {
      const roomDestroyed = handle(
        ["RoomDestroy", { userId: msg[1].userId }],
        model,
      )

      if (roomDestroyed.type === "Err") {
        return [
          model,
          wire.sendToClient(["RoomDestroy", msg[1], roomDestroyed]),
        ]
      }

      const roomJoined = handle(["RoomJoin", msg[1]], roomDestroyed.value)

      if (roomJoined.type === "Err") {
        return [model, wire.sendToClient(["RoomJoin", msg[1], roomJoined])]
      }

      return [
        roomJoined.value,
        Cmd.batch([
          wire.broadcast(["RoomDestroy", msg[1], roomDestroyed]),
          wire.broadcast(["RoomJoin", msg[1], roomJoined]),
        ]),
      ]
    }

    default:
      return exhaustive(msg[0])
  }
}

const updateRoomLeave = (
  wire: Wire,
  userId: UserId,
  result: Result<Problem, Model>,
  model: Model,
): [Model, Cmd<Msg>] => {
  const res: Res = ["RoomLeave", { userId }, result]

  if (result.type === "Err") {
    return [model, wire.sendToClient(res)]
  }

  const modelAfter = result.value

  const user = model.users[userId]

  if (!user) {
    return [modelAfter, wire.sendToClient(res)]
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return [modelAfter, wire.sendToClient(res)]
  }

  const game = model.games[room.roomId]

  if (!game) {
    return [modelAfter, wire.sendToClient(res)]
  }

  const [gameNew, cmd] = Game.updateRoomLeave(
    {
      broadcast: (msg) =>
        sendToRoom({
          sendToUser: wire.sendToUser,
          model: modelAfter,
          roomId: room.roomId,
          msg: ["Game", msg],
        }),
    },
    user.userId,
    game,
  )

  const modelNew: Model = {
    ...modelAfter,
    games: {
      ...modelAfter.games,
      [user.roomId]: gameNew
    }
  }

  return [
    modelNew,
    Cmd.batch([
      wire.broadcast(res),
      p(
        cmd,
        Cmd.map((msg): Msg => ["Game", room.roomId, msg]),
      ),
    ]),
  ]
}

const sendToRoom = ({
  model,
  sendToUser,
  roomId,
  msg,
}: {
  model: Model
  sendToUser: (userIds: UserId[], msg: ToFrontend) => Cmd
  roomId: RoomId
  msg: ToFrontend
}): Cmd => {
  const userIds: UserId[] = []

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

    const game = model.games[roomId]

    if (!game) {
      continue
    }

    const sub = p(
      Game.subscriptions(`room/${roomId}`, game),
      Sub.map((msg): Msg => ["Game", roomId, msg]),
    )

    subs.push(sub)
  }

  return Sub.batch(subs)
}
