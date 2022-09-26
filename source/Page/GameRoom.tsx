import { Cmd, pipe, tag } from "../Core"
import { UserId } from "../Data"
import * as GameRoom from "../Game/GameRoom.Frontend"
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

export type Msg = ["GameRoom", GameRoom.Msg]

type OutAction = GameRoom.Action

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

export const View = ({
  currentUserId,
  gameRoom,
  store,
  dispatch,
  model,
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
