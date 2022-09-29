import { Cmd, exhaustive, Sub, tagCmd, tagSub } from "../../Core"
import { Ok } from "../../Core/Result"
import {
  BackendModel,
  BackendMsg,
  ToBackend,
  ToFrontend
} from "./TicTacToe.Types"
import * as UserVsUser from "./UserVsUser/UserVsUser.Backend"

//
//
//
// ModelØ
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

export const update = ({
  sendToRoom,
}: {
  sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never>
},
  msg: Msg,
  model: Model
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "UserVsUser": {
      if (model.mode === 'UserVsUser') {
        const [child, cmd] = UserVsUser.update({ sendToRoom: msg => sendToRoom(['UserVsUser', msg]) }, msg[1], model.child)
        return [{ mode: "UserVsUser", child }, tagCmd("UserVsUser", cmd)]
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
    sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>
    sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never>
  },
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "InputMode": {
      const { mode } = msg[1]

      const modelNew: BackendModel = initMode(mode)

      return [modelNew, sendToClient(['InputMode_Done', Ok(modelNew)])]
    }

    case 'UserVsUser': {
      if (model.mode === 'UserVsUser') {
        const [child, cmd] = UserVsUser.updateFromFrontend(
          {
            sendToClient: msg => sendToClient(['UserVsUser', msg]),
            sendToRoom: msg => sendToRoom(['UserVsUser', msg])
          },
          msg[1],
          model.child,
        )

        return [{ mode: "UserVsUser", child }, tagCmd("UserVsUser", cmd)]
      }

      return [model, Cmd.None]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

const initMode = (mode: BackendModel['mode']): BackendModel => {
  switch (mode) {
    case 'None': {
      return {
        mode: "None"
      }
    }

    case 'UserVsUser': {
      return {
        mode: "UserVsUser",
        child: UserVsUser.init({ X: 'None', O: "None" })
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

export const subscriptions = (intervalId: string, model: Model): Sub.Sub<Msg> => {
  switch (model.mode) {
    case 'None': {
      return Sub.None
    }

    case 'UserVsUser': {
      return tagSub("UserVsUser", UserVsUser.subscriptions(intervalId, model.child))
    }
  }
}
