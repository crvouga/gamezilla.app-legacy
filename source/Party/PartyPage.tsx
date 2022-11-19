import { Cmd } from "../Core"
import { UserId } from "../Data"
import * as Party from "./Party.Frontend"
import * as ProfileStore from "../Profile/Profile.Store"

//
//
//
// Model
//
//
//

export type Model = {}

export const init: [Model, Cmd<Msg>] = [{}, Cmd.None]

//
//
//
// Update
//
//
//

export type Msg = ["Party", Party.Msg]

type OutAction = Party.Action

export const update = (
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "Party": {
      return [model, Cmd.None, [["Party", ["Msg", msg[1]]]]]
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
  party,
  store,
  $d,
}: {
  party: Party.Model
  currentUserId: UserId
  store: ProfileStore.Model
  model: Model
  $d: (msg: Msg) => void
}) => {
  return (
    <Party.View
      currentUserId={currentUserId}
      store={store}
      model={party}
      $d={(msg) => $d(["Party", msg])}
    />
  )
}
