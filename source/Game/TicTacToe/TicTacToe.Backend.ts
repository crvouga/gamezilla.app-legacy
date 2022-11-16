import { Cmd, exhaustive, Sub } from "../../Core"
import { Ok } from "../../Core/Result"
import { UserId } from "../../Data"
import {
  BackendModel,
  BackendMsg,
  ToBackend,
  ToFrontend
} from "./TicTacToe.Types"
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

export const init: Model = { mode: "None" }

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
    sendToRoom,
  }: {
    sendToRoom: (msg: ToFrontend) => Cmd
  },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "UserVsUser": {
      if (model.mode === "UserVsUser") {
        const [child, cmd] = UserVsUser.update(
          { sendToRoom: (msg) => sendToRoom(["UserVsUser", msg]) },
          msg[1],
          model.child,
        )
        return [{ mode: "UserVsUser", child }, Cmd.tag("UserVsUser", cmd)]
      }
      return [model, Cmd.None]
    }

    case "UserVsBot": {
      if (model.mode === "UserVsBot") {
        const [child, cmd] = UserVsBot.update(
          { sendToRoom: (msg) => sendToRoom(["UserVsBot", msg]) },
          msg[1],
          model.child,
        )
        return [{ mode: "UserVsBot", child }, Cmd.tag("UserVsBot", cmd)]
      }
      return [model, Cmd.None]
    }
  }
}

export const updateFromFrontend = (
  {
    sendToClient,
    sendToRoom,
  }: {
    sendToClient: (msg: ToFrontend) => Cmd
    sendToRoom: (msg: ToFrontend) => Cmd
  },
  msg: ToBackend,
  model: Model,

): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "InputMode": {
      const modelNew: BackendModel = initMode(msg[1])

      return [modelNew, sendToRoom(["InputMode_Done", Ok(modelNew)])]
    }

    case "UserVsUser": {
      if (model.mode === "UserVsUser") {
        const [child, cmd] = UserVsUser.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["UserVsUser", msg]),
            sendToRoom: (msg) => sendToRoom(["UserVsUser", msg]),
          },
          msg[1],
          model.child,
        )

        return [{ mode: "UserVsUser", child }, Cmd.tag("UserVsUser", cmd)]
      }

      return [model, Cmd.None]
    }

    case "UserVsBot": {
      if (model.mode === "UserVsBot") {
        const [child, cmd] = UserVsBot.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["UserVsBot", msg]),
            sendToRoom: (msg) => sendToRoom(["UserVsBot", msg]),
          },
          msg[1],
          model.child,
        )

        return [{ mode: "UserVsBot", child }, Cmd.tag("UserVsBot", cmd)]
      }

      return [model, Cmd.None]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

export const updateRoomLeave = ({ sendToRoom }: { sendToRoom: (m: ToFrontend) => Cmd }, userId: UserId, model: Model): [Model, Cmd<Msg>] => {
  switch (model.mode) {
    case 'None': {
      return [model, Cmd.None]
    }

    case 'UserVsBot': {
      const [child, cmd] = UserVsBot.updateRoomLeave({ sendToRoom: m => sendToRoom(['UserVsBot', m]), userId, model: model.child })
      return [{ mode: 'UserVsBot', child }, Cmd.tag("UserVsBot", cmd)]
    }

    case 'UserVsUser': {
      const [child, cmd] = UserVsUser.updateRoomLeave({ sendToRoom: m => sendToRoom(['UserVsUser', m]) }, userId, model.child)
      return [{ mode: "UserVsUser", child }, Cmd.tag("UserVsUser", cmd)]
    }
  }
}

const initMode = ({
  mode,
  userId,
}: {
  mode: BackendModel["mode"]
  userId: UserId
}): BackendModel => {
  switch (mode) {
    case "None": {
      return {
        mode: "None",
      }
    }

    case "UserVsUser": {
      return {
        mode: "UserVsUser",
        child: UserVsUser.init({ X: userId, O: "None" }),
      }
    }

    case "UserVsBot": {
      return {
        mode: "UserVsBot",
        child: UserVsBot.init({ userId }),
      }
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
  switch (model.mode) {
    case "None": {
      return Sub.None
    }

    case "UserVsUser": {
      return Sub.tag("UserVsUser", UserVsUser.subscriptions(intervalId, model.child))
    }

    case "UserVsBot": {
      return Sub.tag("UserVsBot", UserVsBot.subscriptions(model.child))
    }
  }
}
