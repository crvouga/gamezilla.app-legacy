import { Cmd, exhaustive, Sub } from "../../Core"
import { Ok } from "../../Core/Result"
import { UserId } from "../../Data"
import {
  BackendModel,
  BackendMsg,
  ToBackend,
  ToFrontend,
} from "./TicTacToe.Types"
import * as VsBot from "./VsBot/VsBot.Backend"
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

    case "VsBot": {
      if (model.mode === "VsBot") {
        const [child, cmd] = VsBot.update(
          { broadcast: (msg) => broadcast(["VsBot", msg]) },
          msg[1],
          model.child,
        )
        return [{ mode: "VsBot", child }, Cmd.tag("VsBot", cmd)]
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

    case "VsBot": {
      if (model.mode === "VsBot") {
        const [child, cmd] = VsBot.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["VsBot", msg]),
            broadcast: (msg) => broadcast(["VsBot", msg]),
          },
          msg[1],
          model.child,
        )

        return [{ mode: "VsBot", child }, Cmd.tag("VsBot", cmd)]
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

    case "VsBot": {
      const [child, cmd] = VsBot.updateRoomLeave({
        broadcast: (m) => broadcast(["VsBot", m]),
        userId,
        model: model.child,
      })
      return [{ mode: "VsBot", child }, Cmd.tag("VsBot", cmd)]
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

    case "VsBot": {
      return {
        mode: "VsBot",
        child: VsBot.init({ userId }),
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

    case "VsBot": {
      return Sub.tag("VsBot", VsBot.subscriptions(model.child))
    }
  }
}
