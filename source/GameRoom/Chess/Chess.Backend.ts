import {
  Cmd,
  exhaustive,
  Option,
  Result,
  Sub,
  tagCmd,
  tagSub,
} from "../../Core"
import { UserId } from "../../Data"
import {
  BackendModel,
  BackendMsg,
  InputMode,
  InputMode_Done,
  ToBackend,
  ToFrontend,
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
  { sendToRoom }: { sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never> },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
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
    sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>
    sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never>
  },
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "InputMode": {
      const result = inputMode({ hostId }, msg[1], model)

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

const inputMode = (
  { hostId }: { hostId: UserId.UserId },
  { mode, userId }: InputMode[1],
  model: BackendModel,
): InputMode_Done[2] => {
  if (hostId !== userId) {
    return Result.Err("must_be_the_host")
  }

  switch (mode) {
    case "None": {
      const modelNew: BackendModel = ["None"]

      return Result.Ok(modelNew)
    }

    case "UserVsBot": {
      const modelNew: BackendModel = [
        "UserVsBot",
        UserVsBot.init({ userId: Option.Some(userId) }),
      ]

      return Result.Ok(modelNew)
    }

    case "UserVsUser": {
      const modelNew: BackendModel = [
        "UserVsUser",
        UserVsUser.init({ userId: Option.Some(userId) }),
      ]

      return Result.Ok(modelNew)
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
): Sub.Sub<Msg> => {
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
