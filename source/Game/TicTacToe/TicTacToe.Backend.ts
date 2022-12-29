import { Cmd, exhaustive, Sub } from "../../Core"
import { Ok } from "../../Core/Result"
import { UserId } from "../../Data"
import {
  BackendModel,
  BackendMsg,
  ToBackend,
  ToFrontend,
} from "./TicTacToe.Types"
import * as UserVsBot from "./UserVsBot/UserVsBot.Backend"
import * as VsUser from "./VsUser/VsUser.Backend"

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
    broadcast,
  }: {
    broadcast: (msg: ToFrontend) => Cmd
  },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "VsUser": {
      if (model.mode === "VsUser") {
        const [child, cmd] = VsUser.update(
          { broadcast: (msg) => broadcast(["VsUser", msg]) },
          msg[1],
          model.child,
        )
        return [{ mode: "VsUser", child }, Cmd.tag("VsUser", cmd)]
      }
      return [model, Cmd.None]
    }

    case "UserVsBot": {
      if (model.mode === "UserVsBot") {
        const [child, cmd] = UserVsBot.update(
          { broadcast: (msg) => broadcast(["UserVsBot", msg]) },
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
    broadcast,
  }: {
    sendToClient: (msg: ToFrontend) => Cmd
    broadcast: (msg: ToFrontend) => Cmd
  },
  msg: ToBackend,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "InputMode": {
      const modelNew: BackendModel = initMode(msg[1])

      return [modelNew, broadcast(["InputMode_Done", Ok(modelNew)])]
    }

    case "VsUser": {
      if (model.mode === "VsUser") {
        const [child, cmd] = VsUser.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["VsUser", msg]),
            broadcast: (msg) => broadcast(["VsUser", msg]),
          },
          msg[1],
          model.child,
        )

        return [{ mode: "VsUser", child }, Cmd.tag("VsUser", cmd)]
      }

      return [model, Cmd.None]
    }

    case "UserVsBot": {
      if (model.mode === "UserVsBot") {
        const [child, cmd] = UserVsBot.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["UserVsBot", msg]),
            broadcast: (msg) => broadcast(["UserVsBot", msg]),
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

export const updateRoomLeave = (
  { broadcast }: { broadcast: (m: ToFrontend) => Cmd },
  userId: UserId,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (model.mode) {
    case "None": {
      return [model, Cmd.None]
    }

    case "UserVsBot": {
      const [child, cmd] = UserVsBot.updateRoomLeave({
        broadcast: (m) => broadcast(["UserVsBot", m]),
        userId,
        model: model.child,
      })
      return [{ mode: "UserVsBot", child }, Cmd.tag("UserVsBot", cmd)]
    }

    case "VsUser": {
      const [child, cmd] = VsUser.updateRoomLeave(
        { broadcast: (m) => broadcast(["VsUser", m]) },
        userId,
        model.child,
      )
      return [{ mode: "VsUser", child }, Cmd.tag("VsUser", cmd)]
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

    case "VsUser": {
      return {
        mode: "VsUser",
        child: VsUser.init({ X: userId, O: "None" }),
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

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  switch (model.mode) {
    case "None": {
      return Sub.None
    }

    case "VsUser": {
      return Sub.tag(
        "VsUser",
        VsUser.subscriptions(intervalId, model.child),
      )
    }

    case "UserVsBot": {
      return Sub.tag("UserVsBot", UserVsBot.subscriptions(model.child))
    }
  }
}
