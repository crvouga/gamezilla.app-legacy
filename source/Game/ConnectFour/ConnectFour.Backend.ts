import { Cmd, Sub } from "../../Core"
import {
  BackendModel,
  BackendMsg,
  initSharedModel,
  ToBackend,
  ToFrontend,
} from "./ConnectFour.Types"

//
//
//
// ModelØ
//
//
//

export type Model = BackendModel

export const init: Model = initSharedModel

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
    case "None": {
      return [model, Cmd.None]
    }
  }
}

export const updateFromFrontend = (
  { sendToClient }: { sendToClient: (msg: ToFrontend) => Cmd.Cmd<never> },
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Move": {
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
