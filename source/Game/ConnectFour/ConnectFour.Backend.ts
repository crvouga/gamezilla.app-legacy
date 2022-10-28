import { Cmd, Sub, tagCmd, tagSub } from "../../Core"
import {
  BackendModel,
  BackendMsg,
  ToBackend,
  ToFrontend,
  Mode
} from "./ConnectFour.Types"
import * as UserVsUser from "./UserVsUser/UserVsUser.Backend"
import * as UserVsBot from "./UserVsBot/UserVsBot.Backend"
import { UserId } from "../../Data/UserId"

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

export const update = ({ sendToRoom }: { sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never> }, msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case 'UserVsUser': {
      if (model.type === 'UserVsUser') {
        const [child, cmd] = UserVsUser.update(
          { sendToRoom: msg => sendToRoom(['UserVsUser', msg]) },
          msg[1],
          model.child
        )
        return [{ type: "UserVsUser", child }, tagCmd("UserVsUser", cmd)]
      }

      return [model, Cmd.None]
    }

    case 'UserVsBot': {
      if (model.type === 'UserVsBot') {
        const [child, cmd] = UserVsBot.update(
          msg[1],
          model.child
        )
        return [{ type: "UserVsBot", child }, tagCmd("UserVsBot", cmd)]
      }

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

      const modelNew = initMode(mode, userId)

      return [modelNew, sendToRoom(['InputMode_Done', modelNew])]
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

    case 'UserVsBot': {
      if (model.type === 'UserVsBot') {
        const [child, cmd] = UserVsBot.updateFromFrontend(
          { sendToClient: msg => sendToClient(['UserVsBot', msg]), sendToRoom: msg => sendToRoom(['UserVsBot', msg]) },
          msg[1],
          model.child
        )
        return [{ type: "UserVsBot", child }, tagCmd("UserVsBot", cmd)]
      }

      return [model, Cmd.None]
    }
  }
}

export const updateRoomLeave = ({ userId, sendToRoom, model }: { userId: UserId, model: Model, sendToRoom: (m: ToFrontend) => Cmd.Cmd }): [Model, Cmd.Cmd<Msg>] => {
  switch (model.type) {
    case 'None': {
      return [model, Cmd.None]
    }

    case 'UserVsBot': {
      const [child, cmd] = UserVsBot.updateRoomLeave({ userId, model: model.child, sendToRoom: m => sendToRoom(['UserVsBot', m]) })
      return [{ type: "UserVsBot", child }, tagCmd("UserVsBot", cmd)]
    }

    case 'UserVsUser': {
      const [child, cmd] = UserVsUser.updateRoomLeave({ userId, model: model.child, sendToRoom: m => sendToRoom(['UserVsUser', m]) })
      return [{ type: "UserVsUser", child }, tagCmd("UserVsUser", cmd)]
    }
  }
}


const initMode = (mode: Mode, userId: UserId): Model => {
  switch (mode) {
    case 'None': {
      return { type: "None" }
    }

    case 'UserVsBot': {
      return {
        type: "UserVsBot",
        child: UserVsBot.init({ player: userId })
      }
    }

    case 'UserVsUser': {
      return {
        type: "UserVsUser",
        child: UserVsUser.init({ PlayerOne: userId, PlayerTwo: "None" })
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
  switch (model.type) {
    case 'None': {
      return Sub.None
    }

    case 'UserVsBot': {
      return Sub.None
    }

    case 'UserVsUser': {
      return tagSub("UserVsUser", UserVsUser.subscriptions(intervalId, model.child))
    }
  }
}
