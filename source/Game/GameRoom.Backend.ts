import { Cmd, exhaustive, p, Sub } from "../Core"
import { RoomId, UserId } from "../Data"
import * as Game from "./Game.Backend"
import {
  BackendModel,
  BackendMsg,
  BackendRoom,
  handle,
  Req,
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
    sendToUser: (userIds: UserId[], msg: ToFrontend) => Cmd
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
          broadcast: (msg) => sendToRoom({ sendToUser, model, roomId, msg: ["Games", roomId, msg] }),
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

type Wire = {
  sendToClient: (msg: ToFrontend) => Cmd
  sendToUser: (userId: UserId[], msg: ToFrontend) => Cmd
  broadcast: (msg: ToFrontend) => Cmd
}

export const updateFromFrontend = (
  wire: Wire,
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
          sendToClient: (msg) => wire.sendToClient(["Games", roomId, msg]),
          broadcast: (msg) => sendToRoom({ sendToUser: wire.sendToUser, model, roomId, msg: ["Games", roomId, msg] }),
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
      return updateRequest(wire, msg, model)
    }

    case "RoomLeave": {
      return updateRoomLeave(wire, msg, model)
    }

    case 'RoomLeaveThenJoin': {
      const roomLeft = updateRoomLeave(wire, ['RoomLeave', { userId: msg[1].userId }], model)
      const roomJoined = updateRequest(wire, ['RoomJoin', { roomId: msg[1].roomId, userId: msg[1].userId }], roomLeft[0])
      return [
        roomJoined[0],
        Cmd.batch([
          roomLeft[1],
          roomJoined[1]
        ])
      ]
    }

    default:
      return exhaustive(msg[0])
  }
}

const updateRequest = (wire: Wire, msg: Req, model: Model): [Model, Cmd<Msg>] => {
  const res: Res = [...msg, handle(msg, model)]

  if (res[2].type === "Err") {
    return [model, wire.sendToClient(res)]
  }

  return [res[2].value, wire.broadcast(res)]
}



const updateRoomLeave = (wire: Wire, msg: ToBackend, model: Model): [Model, Cmd<Msg>] => {

  if (msg[0] !== 'RoomLeave') {
    return [model, Cmd.None]
  }

  const res: Res = [...msg, handle(msg, model)]

  if (res[2].type === "Err") {
    return [model, wire.sendToClient(res)]
  }

  const modelAfter = res[2].value

  const user = model.users[msg[1].userId]

  if (!user) {
    return [res[2].value, wire.broadcast(res)]
  }

  const room = model.rooms[user.roomId]

  if (!room) {
    return [res[2].value, wire.broadcast(res)]
  }

  const [gameNew, cmd] = Game.updateRoomLeave(
    { broadcast: msg => sendToRoom({ sendToUser: wire.sendToUser, model: modelAfter, roomId: room.roomId, msg: ['Games', room.roomId, msg] }) },
    user.userId,
    room.game
  )

  const roomNew: BackendRoom = {
    ...room,
    game: gameNew
  }

  const modelNew: Model = {
    ...res[2].value,
    rooms: {
      ...res[2].value.rooms,
      [roomNew.roomId]: roomNew
    }
  }

  return [
    modelNew,
    Cmd.batch([
      wire.broadcast(res),
      p(cmd, Cmd.map((msg): Msg => ['Games', room.roomId, msg]))
    ])
  ]
}

const sendToRoom = ({
  model,
  sendToUser,
  roomId,
  msg,
}: {
  model: Model,
  sendToUser: (userIds: UserId[], msg: ToFrontend) => Cmd,
  roomId: RoomId,
  msg: ToFrontend,
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
