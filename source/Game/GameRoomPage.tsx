import { Cmd } from "../Core"
import { UserId } from "../Data"
import * as GameRoom from "./GameRoom.Frontend"
import * as ProfileStore from "../Profile/Profile.Store"

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
  profileStore,
  dispatch,
}: {
  gameRoom: GameRoom.Model
  currentUserId: UserId.UserId
  profileStore: ProfileStore.Model
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  return (
    <GameRoom.View
      currentUserId={currentUserId}
      profileStore={profileStore}
      model={gameRoom}
      dispatch={(msg) => dispatch(["GameRoom", msg])}
    />
  )
}
