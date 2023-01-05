import { Cmd, exhaustive } from "../Core"
import { PartyId, UserId } from "../Data"
import {
  BackendModel,
  BackendMsg,
  handle,
  Res,
  ToBackend,
  ToFrontend,
} from "./Party.Types"

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init: Model = {
  parties: {},
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
  _wire: {
    sendToUser: (userIds: UserId[], msg: ToFrontend) => Cmd
    broadcast: (msg: ToFrontend) => Cmd
  },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "none": {
      return [model, Cmd.None]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

export const updateFromFrontend = (
  {
    sendToClient,
    broadcast,
  }: {
    broadcast: (msg: ToFrontend) => Cmd
    sendToUser: (userId: UserId[], msg: ToFrontend) => Cmd
    sendToClient: (msg: ToFrontend) => Cmd
  },
  msg: ToBackend,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "PartyCreate":
    case "PartyDestroy":
    case "PartyJoin":
    case "PartyGet":
    case "PartyLeave": {
      const res: Res = [...msg, handle(msg, model)]
      if (res[2].type === "Err") {
        return [model, sendToClient(res)]
      }
      return [res[2].value, broadcast(res)]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

export const sendToParty = ({
  model,
  partyId,
  msg,
  sendToUser,
}: {
  model: Model
  partyId: PartyId
  msg: ToFrontend
  sendToUser: (userIds: UserId[], msg: ToFrontend) => Cmd
}): Cmd => {
  const userIds: UserId[] = []

  for (const userId in model.users) {
    if (UserId.is(userId) && model.users[userId]?.partyId === partyId) {
      userIds.push(userId)
    }
  }

  return sendToUser(userIds, msg)
}
