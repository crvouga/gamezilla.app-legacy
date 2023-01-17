import { Cmd, Sub } from "@gamezilla/core"
import { UserId } from "@gamezilla/data"
import {
  BackendModel,
  BackendMsg,
  Mode,
  ToBackend,
  ToFrontend,
} from "./connect-four.types"
import * as VsBot from "./vs-bot/vs-bot.backend"
import * as VsUser from "./vs-user/vs-user.backend"

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init: Model = { type: "none" }

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
    case "vs-user": {
      if (model.type === "vs-user") {
        const [child, cmd] = VsUser.update(
          { broadcast: (msg) => broadcast(["vs-user", msg]) },
          msg[1],
          model.child,
        )
        return [{ type: "vs-user", child }, Cmd.tag("vs-user", cmd)]
      }

      return [model, Cmd.None]
    }

    case "vs-bot": {
      if (model.type === "vs-bot") {
        const [child, cmd] = VsBot.update(
          { broadcast: (m) => broadcast(["vs-bot", m]) },
          msg[1],
          model.child,
        )
        return [{ type: "vs-bot", child }, Cmd.tag("vs-bot", cmd)]
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
    case "input-mode": {
      const { mode, userId } = msg[1]

      const modelNew = initMode(mode, userId)

      return [modelNew, broadcast(["input-mode-done", modelNew])]
    }
    case "vs-user": {
      if (model.type === "vs-user") {
        const [child, cmd] = VsUser.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["vs-user", msg]),
            broadcast: (msg) => broadcast(["vs-user", msg]),
          },
          msg[1],
          model.child,
        )
        return [{ type: "vs-user", child }, Cmd.tag("vs-user", cmd)]
      }
      return [model, Cmd.None]
    }

    case "vs-bot": {
      if (model.type === "vs-bot") {
        const [child, cmd] = VsBot.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["vs-bot", msg]),
            broadcast: (msg) => broadcast(["vs-bot", msg]),
          },
          msg[1],
          model.child,
        )
        return [{ type: "vs-bot", child }, Cmd.tag("vs-bot", cmd)]
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
    case "none": {
      return [model, Cmd.None]
    }

    case "vs-bot": {
      const [child, cmd] = VsBot.updateRoomLeave({
        userId,
        model: model.child,
        broadcast: (m) => broadcast(["vs-bot", m]),
      })
      return [{ type: "vs-bot", child }, Cmd.tag("vs-bot", cmd)]
    }

    case "vs-user": {
      const [child, cmd] = VsUser.updateRoomLeave({
        userId,
        model: model.child,
        broadcast: (m) => broadcast(["vs-user", m]),
      })
      return [{ type: "vs-user", child }, Cmd.tag("vs-user", cmd)]
    }
  }
}

const initMode = (mode: Mode, userId: UserId): Model => {
  switch (mode) {
    case "none": {
      return { type: "none" }
    }

    case "vs-bot": {
      return {
        type: "vs-bot",
        child: VsBot.init({ player: userId }),
      }
    }

    case "vs-user": {
      return {
        type: "vs-user",
        child: VsUser.init({ PlayerOne: userId, PlayerTwo: "none" }),
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
    case "none": {
      return Sub.None
    }

    case "vs-bot": {
      return Sub.None
    }

    case "vs-user": {
      return Sub.tag(
        "vs-user",
        VsUser.subscriptions(intervalId, model.child),
      )
    }
  }
}
