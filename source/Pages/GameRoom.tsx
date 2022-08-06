import { Cmd, pipe, tag } from "../Core"
import { UserId } from "../Data"
import * as GameRoom from "../GameRoom"
import * as Store from "../Store"
import * as UI from "../UI"

//
//
//
// Model
//
//
//

export type Model = {
  drawer: "Opened" | "Closed"
}

export const init: [Model, Cmd.Cmd<Msg>] = [{ drawer: "Closed" }, Cmd.None]

//
//
//
// Update
//
//
//

export type Msg = ["GameRoom", GameRoom.FrontendMsg]

type OutAction = GameRoom.Frontend.Action

export const update = (
  { currentUserId }: { currentUserId: UserId.UserId },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "GameRoom": {
      return [model, Cmd.None, [["GameRoom", ["Msg", msg[1]]]]]
    }
  }
}

//
//
//
// View
//
//
//

export const view = (
  {
    currentUserId,
    gameRoom,
    store,
  }: {
    gameRoom: GameRoom.FrontendModel
    currentUserId: UserId.UserId
    store: Store.Model
  },
  model: Model,
): UI.View<Msg> => {
  return pipe(
    GameRoom.Frontend.view({ currentUserId, store }, gameRoom),
    UI.map(tag("GameRoom")),
  )
}
