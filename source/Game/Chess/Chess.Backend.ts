import {
  Cmd,
  exhaustive,
  Sub,
  tagCmd,
  tagSub
} from "../../Core"
import { Err, Ok } from "../../Core/Result"
import { UserId } from "../../Data"
import {
  BackendModel,
  BackendMsg, InputMode_Done,
  ToBackend,
  ToFrontend
} from "./Chess.Types"
import * as UserVsBot from "./UserVsBot/UserVsBot.Backend"
import * as UserVsUser from "./UserVsUser/UserVsUser.Backend"

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init: Model = ["None"]

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = (
  { sendToRoom }: { sendToRoom: (msg: ToFrontend) => Cmd<never> },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (model[0]) {
    case "None": {
      return [model, Cmd.None]
    }

    case "UserVsUser": {
      if (msg[0] === "UserVsUser") {
        const [child, cmd] = UserVsUser.update(
          { sendToRoom: (msg) => sendToRoom(["UserVsUser", msg]) },
          msg[1],
          model[1],
        )

        return [["UserVsUser", child], tagCmd("UserVsUser", cmd)]
      }

      return [model, Cmd.None]
    }

    case "UserVsBot": {
      if (msg[0] === "UserVsBot") {
        const [child, cmd] = UserVsBot.update(
          { sendToRoom: (msg) => sendToRoom(["UserVsBot", msg]) },
          msg[1],
          model[1],
        )

        return [["UserVsBot", child], tagCmd("UserVsBot", cmd)]
      }

      return [model, Cmd.None]
    }

    default: {
      return exhaustive(model[0])
    }
  }
}

export const updateFromFrontend = (
  {
    hostId,
    sendToClient,
    sendToRoom,
  }: {
    hostId: UserId.UserId
    sendToClient: (msg: ToFrontend) => Cmd<never>
    sendToRoom: (msg: ToFrontend) => Cmd<never>
  },
  msg: ToBackend,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "InputMode": {
      const result = initMode({ hostId, mode: msg[1].mode, userId: msg[1].userId })

      if (result.type === "Err") {
        return [model, sendToClient(["InputMode_Done", msg[1], result])]
      }

      return [result.value, sendToRoom(["InputMode_Done", msg[1], result])]
    }

    case "UserVsBot": {
      if (model[0] === "UserVsBot") {
        const [child, cmd] = UserVsBot.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["UserVsBot", msg]),
            sendToRoom: (msg) => sendToRoom(["UserVsBot", msg]),
          },
          msg[1],
          model[1],
        )

        return [["UserVsBot", child], tagCmd("UserVsBot", cmd)]
      }

      return [model, Cmd.None]
    }

    case "UserVsUser": {
      if (model[0] === "UserVsUser") {
        const [child, cmd] = UserVsUser.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["UserVsUser", msg]),
            sendToRoom: (msg) => sendToRoom(["UserVsUser", msg]),
          },
          msg[1],
          model[1],
        )

        return [["UserVsUser", child], tagCmd("UserVsUser", cmd)]
      }

      return [model, Cmd.None]
    }
  }
}

export const updateRoomLeave = ({ sendToRoom }: { sendToRoom: (msg: ToFrontend) => Cmd<never> }, userId: UserId.UserId, model: Model): [Model, Cmd<Msg>] => {
  switch (model[0]) {
    case 'None': {
      return [model, Cmd.None]
    }

    case 'UserVsBot': {
      const [child, cmd] = UserVsBot.updateRoomLeave({ sendToRoom: msg => sendToRoom(['UserVsBot', msg]) }, userId, model[1])
      return [['UserVsBot', child], tagCmd("UserVsBot", cmd)]
    }

    case 'UserVsUser': {
      const [child, cmd] = UserVsUser.updateRoomLeave({ sendToRoom: msg => sendToRoom(['UserVsUser', msg]) }, userId, model[1])
      return [['UserVsUser', child], tagCmd("UserVsUser", cmd)]
    }
  }
}

const initMode = (
  { hostId, mode, userId, }: { hostId: UserId.UserId, mode: BackendModel[0], userId: UserId.UserId },
): InputMode_Done[2] => {
  if (hostId !== userId) {
    return Err("must_be_the_host")
  }

  switch (mode) {
    case "None": {
      const modelNew: BackendModel = ["None"]

      return Ok(modelNew)
    }

    case "UserVsBot": {
      const modelNew: BackendModel = ["UserVsBot", UserVsBot.init({ userId: userId })]

      return Ok(modelNew)
    }

    case "UserVsUser": {
      const modelNew: BackendModel = [
        "UserVsUser",
        UserVsUser.init({ userId: userId }),
      ]

      return Ok(modelNew)
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
  intervalId: string,
  model: Model,
): Sub<Msg> => {
  switch (model[0]) {
    case "None": {
      return Sub.None
    }

    case "UserVsUser": {
      return tagSub(
        "UserVsUser",
        UserVsUser.subscriptions(intervalId, model[1]),
      )
    }

    case "UserVsBot": {
      return tagSub("UserVsBot", UserVsBot.subscriptions(intervalId, model[1]))
    }
  }
}
