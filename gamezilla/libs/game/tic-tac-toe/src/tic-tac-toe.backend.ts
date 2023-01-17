import { Cmd, exhaustive, Result, Sub } from "@gamezilla/core"
import { UserId } from "@gamezilla/shared"
import {
  BackendModel,
  BackendMsg,
  ToBackend,
  ToFrontend
} from "./tic-tac-toe.types"
import * as VsBot from "./vs-bot/vs-bot.backend"
import * as VsUser from "./vs-user/vs-user.backend"

const { Ok } = Result

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init: Model = { mode: "none" }

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
    case "vs-user": {
      if (model.mode === "vs-user") {
        const [child, cmd] = VsUser.update(
          { broadcast: (msg) => broadcast(["vs-user", msg]) },
          msg[1],
          model.child,
        )
        return [{ mode: "vs-user", child }, Cmd.tag("vs-user", cmd)]
      }
      return [model, Cmd.None]
    }

    case "vs-bot": {
      if (model.mode === "vs-bot") {
        const [child, cmd] = VsBot.update(
          { broadcast: (msg) => broadcast(["vs-bot", msg]) },
          msg[1],
          model.child,
        )
        return [{ mode: "vs-bot", child }, Cmd.tag("vs-bot", cmd)]
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
      const modelNew: BackendModel = initMode(msg[1])

      return [modelNew, broadcast(["input-mode-done", Ok(modelNew)])]
    }

    case "vs-user": {
      if (model.mode === "vs-user") {
        const [child, cmd] = VsUser.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["vs-user", msg]),
            broadcast: (msg) => broadcast(["vs-user", msg]),
          },
          msg[1],
          model.child,
        )

        return [{ mode: "vs-user", child }, Cmd.tag("vs-user", cmd)]
      }

      return [model, Cmd.None]
    }

    case "vs-bot": {
      if (model.mode === "vs-bot") {
        const [child, cmd] = VsBot.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["vs-bot", msg]),
            broadcast: (msg) => broadcast(["vs-bot", msg]),
          },
          msg[1],
          model.child,
        )

        return [{ mode: "vs-bot", child }, Cmd.tag("vs-bot", cmd)]
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
    case "none": {
      return [model, Cmd.None]
    }

    case "vs-bot": {
      const [child, cmd] = VsBot.updateRoomLeave({
        broadcast: (m) => broadcast(["vs-bot", m]),
        userId,
        model: model.child,
      })
      return [{ mode: "vs-bot", child }, Cmd.tag("vs-bot", cmd)]
    }

    case "vs-user": {
      const [child, cmd] = VsUser.updateRoomLeave(
        { broadcast: (m) => broadcast(["vs-user", m]) },
        userId,
        model.child,
      )
      return [{ mode: "vs-user", child }, Cmd.tag("vs-user", cmd)]
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
    case "none": {
      return {
        mode: "none",
      }
    }

    case "vs-user": {
      return {
        mode: "vs-user",
        child: VsUser.init({ X: userId, O: "none" }),
      }
    }

    case "vs-bot": {
      return {
        mode: "vs-bot",
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
    case "none": {
      return Sub.None
    }

    case "vs-user": {
      return Sub.tag(
        "vs-user",
        VsUser.subscriptions(intervalId, model.child),
      )
    }

    case "vs-bot": {
      return Sub.tag("vs-bot", VsBot.subscriptions(model.child))
    }
  }
}
