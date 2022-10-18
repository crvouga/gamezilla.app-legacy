import { Cmd, Sub, tagCmd } from "../../Core"
import {
  BackendModel,
  BackendMsg,
  ToBackend,
  ToFrontend
} from "./ConnectFour.Types"
import * as UserVsUser from "./UserVsUser/UserVsUser.Backend"
//
//
//
// ModelØ
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

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case 'UserVsUser': {
      return [model, Cmd.None]
    }
  }
}

export const updateFromFrontend = (
  { sendToClient, sendToRoom }: { sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>, sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never> },
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case 'InputMode': {
      const { mode, userId } = msg[1]

      switch (mode) {
        case 'None': {
          const modelNew: Model = { type: "None" }
          return [modelNew, sendToRoom(['InputMode_Done', modelNew])]
        }
        case 'UserVsUser': {
          const modelNew: Model = { type: "UserVsUser", child: UserVsUser.init({ PlayerOne: userId, PlayerTwo: "None" }) }
          return [modelNew, sendToRoom(['InputMode_Done', modelNew])]
        }
        case 'UserVsBot': {
          return [model, Cmd.None]
        }
      }

    }
    case 'UserVsUser': {
      if (model.type === 'UserVsUser') {
        const [child, cmd] = UserVsUser.updateFromFrontend(
          { sendToClient: msg => sendToClient(['UserVsUser', msg]), sendToRoom: msg => sendToRoom(['UserVsUser', msg]) },
          msg[1],
          model.child
        )
        return [{ type: "UserVsUser", child }, tagCmd("UserVsUser", cmd)]
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

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.batch<Msg>([])
}
