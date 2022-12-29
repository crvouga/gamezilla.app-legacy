import { Cmd, exhaustive, Sub } from "../../Core"
import { Err, Ok } from "../../Core/Result"
import { UserId } from "../../Data"
import {
  BackendModel,
  BackendMsg,
  InputMode_Done,
  ToBackend,
  ToFrontend,
} from "./Chess.Types"
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
  { broadcast }: { broadcast: (msg: ToFrontend) => Cmd },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (model[0]) {
    case "None": {
      return [model, Cmd.None]
    }

    case "VsUser": {
      if (msg[0] === "VsUser") {
        const [child, cmd] = VsUser.update(
          { broadcast: (msg) => broadcast(["VsUser", msg]) },
          msg[1],
          model[1],
        )

        return [["VsUser", child], Cmd.tag("VsUser", cmd)]
      }

      return [model, Cmd.None]
    }

    case "VsBot": {
      if (msg[0] === "VsBot") {
        const [child, cmd] = VsBot.update(
          { broadcast: (msg) => broadcast(["VsBot", msg]) },
          msg[1],
          model[1],
        )

        return [["VsBot", child], Cmd.tag("VsBot", cmd)]
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
    broadcast,
  }: {
    hostId: UserId
    sendToClient: (msg: ToFrontend) => Cmd
    broadcast: (msg: ToFrontend) => Cmd
  },
  msg: ToBackend,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "InputMode": {
      const result = initMode({
        hostId,
        mode: msg[1].mode,
        userId: msg[1].userId,
      })

      if (result.type === "Err") {
        return [model, sendToClient(["InputMode_Done", msg[1], result])]
      }

      return [result.value, broadcast(["InputMode_Done", msg[1], result])]
    }

    case "VsBot": {
      if (model[0] === "VsBot") {
        const [child, cmd] = VsBot.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["VsBot", msg]),
            broadcast: (msg) => broadcast(["VsBot", msg]),
          },
          msg[1],
          model[1],
        )

        return [["VsBot", child], Cmd.tag("VsBot", cmd)]
      }

      return [model, Cmd.None]
    }

    case "VsUser": {
      if (model[0] === "VsUser") {
        const [child, cmd] = VsUser.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["VsUser", msg]),
            broadcast: (msg) => broadcast(["VsUser", msg]),
          },
          msg[1],
          model[1],
        )

        return [["VsUser", child], Cmd.tag("VsUser", cmd)]
      }

      return [model, Cmd.None]
    }
  }
}

export const updateRoomLeave = (
  { broadcast }: { broadcast: (msg: ToFrontend) => Cmd },
  userId: UserId,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (model[0]) {
    case "None": {
      return [model, Cmd.None]
    }

    case "VsBot": {
      const [child, cmd] = VsBot.updateRoomLeave(
        { broadcast: (msg) => broadcast(["VsBot", msg]) },
        userId,
        model[1],
      )
      return [["VsBot", child], Cmd.tag("VsBot", cmd)]
    }

    case "VsUser": {
      const [child, cmd] = VsUser.updateRoomLeave(
        { broadcast: (msg) => broadcast(["VsUser", msg]) },
        userId,
        model[1],
      )
      return [["VsUser", child], Cmd.tag("VsUser", cmd)]
    }
  }
}

const initMode = ({
  hostId,
  mode,
  userId,
}: {
  hostId: UserId
  mode: BackendModel[0]
  userId: UserId
}): InputMode_Done[2] => {
  if (hostId !== userId) {
    return Err("must_be_the_host")
  }

  switch (mode) {
    case "None": {
      const modelNew: BackendModel = ["None"]

      return Ok(modelNew)
    }

    case "VsBot": {
      const modelNew: BackendModel = [
        "VsBot",
        VsBot.init({ userId: userId }),
      ]

      return Ok(modelNew)
    }

    case "VsUser": {
      const modelNew: BackendModel = [
        "VsUser",
        VsUser.init({ userId: userId }),
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

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  switch (model[0]) {
    case "None": {
      return Sub.None
    }

    case "VsUser": {
      return Sub.tag(
        "VsUser",
        VsUser.subscriptions(intervalId, model[1]),
      )
    }

    case "VsBot": {
      return Sub.tag("VsBot", VsBot.subscriptions(intervalId, model[1]))
    }
  }
}
