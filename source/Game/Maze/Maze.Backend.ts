import { Time, Cmd, Sub } from "../../Core"
import { UserId } from "../../Data"
import {
  BackendModel,
  BackendMsg,
  handle,
  initShared,
  Res,
  tick,
  ToBackend,
  ToFrontend
} from "./Maze.Types"
//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init = initShared({})

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = ({ broadcast }: { broadcast: (msg: ToFrontend) => Cmd }, msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "Tick": {
      const modelNew = tick(model)
      return [modelNew, broadcast(['Tick', modelNew])]
    }
  }
}

export const updateFromFrontend = (
  { broadcast }: { broadcast: (m: ToFrontend) => Cmd },
  msg: ToBackend,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'StopGame':
    case "InputDirection":
    case "InputSeed":
    case "StartGame":
    case "StopPlaying":
    case "StartPlaying": {
      const res: Res = [...msg, handle(msg, model)]
      const modelNew = res[2].type === "Ok" ? res[2].value : model
      return [modelNew, broadcast(res)]
    }
  }
}

export const updateRoomLeave = (
  _userId: UserId,
  model: Model,
): [Model, Cmd<Msg>] => {
  return [model, Cmd.None]
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (intervalId: string, model: BackendModel): Sub<Msg> => {
  if (model.type === 'Game') {
    return Time.every(intervalId, 100, () => ['Tick'])
    // return Sub.None

  }
  return Sub.None
}
