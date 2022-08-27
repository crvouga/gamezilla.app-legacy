import { Cmd, exhaustive, Sub, tagCmd, tagSub } from "../../Core"
import { ClientId, RoomId } from "../../Data"
import { BackendModel, BackendMsg, ToBackend, ToFrontend } from "./Chess.Types"
import * as UserVsUser from "./UserVsUser/UserVsUser.Backend"

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init: Model = {
  type: "UserVsUser",
  child: UserVsUser.init,
}

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = (
  { broadcast }: { broadcast: (msg: ToFrontend) => Cmd.Cmd<never> },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "UserVsUser": {
      if (model.type === "UserVsUser") {
        const [child, childCmd] = UserVsUser.update(
          { broadcast: (msg) => broadcast(["UserVsUser", msg]) },
          msg[1],
          model.child,
        )
        return [{ type: "UserVsUser", child }, tagCmd("UserVsUser", childCmd)]
      }
      return [model, Cmd.None]
    }
  }
}

export const updateFromFrontend = (
  { clientId, roomId }: { roomId: RoomId.RoomId; clientId: ClientId.ClientId },
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "UserVsUser": {
      if (model.type === "UserVsUser") {
        const [child, childCmd] = UserVsUser.updateFromFrontend(
          { clientId, roomId },
          msg[1],
          model.child,
        )
        return [{ type: "UserVsUser", child }, tagCmd("UserVsUser", childCmd)]
      }

      return [model, Cmd.None]
    }

    default: {
      return exhaustive(msg[0])
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

export const subscriptions = (
  intervalId: string,
  model: Model,
): Sub.Sub<Msg> => {
  switch (model.type) {
    case "UserVsUser": {
      return tagSub(
        "UserVsUser",
        UserVsUser.subscriptions(intervalId, model.child),
      )
    }
  }
}
