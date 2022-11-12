import { Cmd } from "../Core"
import { UserId } from "../Data"
import * as GameRoom from "./GameRoom.Frontend"
import * as Store from "../Store"

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

export type Msg = ["GameRoom", GameRoom.Msg]

type OutAction = GameRoom.Action

export const update = (msg: Msg, model: Model): [Model, OutAction[]] => {
  switch (msg[0]) {
    case "GameRoom": {
      return [model, [["GameRoom", ["Msg", msg[1]]]]]
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

export const View = ({
  currentUserId,
  gameRoom,
  store,
  dispatch,
}: {
  gameRoom: GameRoom.Model
  currentUserId: UserId.UserId
  store: Store.Model
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  return (
    <GameRoom.View
      currentUserId={currentUserId}
      store={store}
      model={gameRoom}
      dispatch={(msg) => dispatch(["GameRoom", msg])}
    />
  )
}
