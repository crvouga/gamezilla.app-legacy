import { Cmd, exhaustive, Option, Result, Sub, tagCmd, tagSub } from "../../Core"
import { BackendModel, BackendMsg, ToBackend, ToFrontend } from "./Chess.Types"
import * as UserVsUser from "./UserVsUser/UserVsUser.Backend"
import * as UserVsBot from "./UserVsBot/UserVsBot.Backend"

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init: Model = ["None"]
// ['UserVsUser', UserVsUser.init]

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
    sendToClient,
    sendToRoom,
  }: {
    sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>
    sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never>
  },
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "InputMode": {
      const { mode, userId } = msg[1]

      switch (mode) {
        case "None": {
          const modelNew: Model = ["None"]

          return [
            modelNew,
            sendToRoom(["InputMode_Done", msg[1], Result.Ok(modelNew)]),
          ]
        }

        case "UserVsBot": {
          const modelNew: Model = ["UserVsBot", UserVsBot.init({ userId: Option.Some(userId) })]

          return [
            modelNew,
            sendToRoom(["InputMode_Done", msg[1], Result.Ok(modelNew)]),
          ]
        }

        case "UserVsUser": {
          const modelNew: Model = ["UserVsUser", UserVsUser.init({ userId: Option.Some(userId) })]

          return [
            modelNew,
            sendToRoom(["InputMode_Done", msg[1], Result.Ok(modelNew)]),
          ]
        }
      }
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
