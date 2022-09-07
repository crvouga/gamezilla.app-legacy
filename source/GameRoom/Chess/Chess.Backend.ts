import { Cmd, Sub, tagCmd, tagSub } from "../../Core";
import { BackendModel, BackendMsg, ToBackend, ToFrontend } from "./Chess.Types";
import * as UserVsUser from "./UserVsUser/UserVsUser.Backend"

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init: Model = ['UserVsUser', UserVsUser.init]


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
    case "UserVsUser": {
      if (msg[0] === 'UserVsUser') {

        const [child, cmd] = UserVsUser.update({ sendToRoom: msg => sendToRoom(['UserVsUser', msg]) }, msg[1], model[1])

        return [['UserVsUser', child], tagCmd("UserVsUser", cmd)]
      }

      return [model, Cmd.None]
    }
  }
};

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
    case 'UserVsUser': {
      const [child, cmd] = UserVsUser.updateFromFrontend({ sendToClient: msg => sendToClient(['UserVsUser', msg]), sendToRoom: (msg) => sendToRoom(['UserVsUser', msg]) }, msg[1], model[1])
      return [['UserVsUser', child], tagCmd("UserVsUser", cmd)]
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
  switch (model[0]) {
    case 'UserVsUser': {
      return tagSub("UserVsUser", UserVsUser.subscriptions(intervalId, model[1]))
    }
  }
};
