import { Cmd, Sub } from "../../Core"
import { UserId } from "../../Data/UserId"
import {
  BackendModel,
  BackendMsg,
  Mode,
  ToBackend,
  ToFrontend,
} from "./ConnectFour.Types"
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

export const init: Model = { type: "None" }

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = (
  { broadcast }: { broadcast: (msg: ToFrontend) => Cmd },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "VsUser": {
      if (model.type === "VsUser") {
        const [child, cmd] = VsUser.update(
          { broadcast: (msg) => broadcast(["VsUser", msg]) },
          msg[1],
          model.child,
        )
        return [{ type: "VsUser", child }, Cmd.tag("VsUser", cmd)]
      }

      return [model, Cmd.None]
    }

    case "UserVsBot": {
      if (model.type === "UserVsBot") {
        const [child, cmd] = UserVsBot.update(
          { broadcast: (m) => broadcast(["UserVsBot", m]) },
          msg[1],
          model.child,
        )
        return [{ type: "UserVsBot", child }, Cmd.tag("UserVsBot", cmd)]
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
      const { mode, userId } = msg[1]

      const modelNew = initMode(mode, userId)

      return [modelNew, broadcast(["InputMode_Done", modelNew])]
    }
    case "VsUser": {
      if (model.type === "VsUser") {
        const [child, cmd] = VsUser.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["VsUser", msg]),
            broadcast: (msg) => broadcast(["VsUser", msg]),
          },
          msg[1],
          model.child,
        )
        return [{ type: "VsUser", child }, Cmd.tag("VsUser", cmd)]
      }
      return [model, Cmd.None]
    }

    case "UserVsBot": {
      if (model.type === "UserVsBot") {
        const [child, cmd] = UserVsBot.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["UserVsBot", msg]),
            broadcast: (msg) => broadcast(["UserVsBot", msg]),
          },
          msg[1],
          model.child,
        )
        return [{ type: "UserVsBot", child }, Cmd.tag("UserVsBot", cmd)]
      }

      return [model, Cmd.None]
    }
  }
}

export const updateRoomLeave = ({
  userId,
  broadcast,
  model,
}: {
  userId: UserId
  model: Model
  broadcast: (m: ToFrontend) => Cmd
}): [Model, Cmd<Msg>] => {
  switch (model.type) {
    case "None": {
      return [model, Cmd.None]
    }

    case "UserVsBot": {
      const [child, cmd] = UserVsBot.updateRoomLeave({
        userId,
        model: model.child,
        broadcast: (m) => broadcast(["UserVsBot", m]),
      })
      return [{ type: "UserVsBot", child }, Cmd.tag("UserVsBot", cmd)]
    }

    case "VsUser": {
      const [child, cmd] = VsUser.updateRoomLeave({
        userId,
        model: model.child,
        broadcast: (m) => broadcast(["VsUser", m]),
      })
      return [{ type: "VsUser", child }, Cmd.tag("VsUser", cmd)]
    }
  }
}

const initMode = (mode: Mode, userId: UserId): Model => {
  switch (mode) {
    case "None": {
      return { type: "None" }
    }

    case "UserVsBot": {
      return {
        type: "UserVsBot",
        child: UserVsBot.init({ player: userId }),
      }
    }

    case "VsUser": {
      return {
        type: "VsUser",
        child: VsUser.init({ PlayerOne: userId, PlayerTwo: "None" }),
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
  switch (model.type) {
    case "None": {
      return Sub.None
    }

    case "UserVsBot": {
      return Sub.None
    }

    case "VsUser": {
      return Sub.tag(
        "VsUser",
        VsUser.subscriptions(intervalId, model.child),
      )
    }
  }
}
