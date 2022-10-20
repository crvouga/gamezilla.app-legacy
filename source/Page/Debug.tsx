import { Sub } from "../Core"
import * as Debug from "../Debug/Debug.Frontend"
import * as Route from "../Route"

//
//
//
// Model
//
//
//

export type Model = {}

export const init: Model = {}

//
//
//
// Update
//
//
//

export type Msg = ["DebugMsg", Debug.Msg]

export type OutAction = Debug.Action | Route.Action

export const update = (msg: Msg, model: Model): [Model, OutAction[]] => {
  switch (msg[0]) {
    case "DebugMsg": {
      return [model, [["Debug", ["Msg", msg[1]]]]]
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

export const subscriptions = (_model: Model): Sub.Sub<Msg> => {
  return Sub.None
}

//
//
//
// View
//
//
//

export const View = ({
  debug,
  dispatch,
}: {
  debug: Debug.Model
  model: Model
  dispatch: (msg: Msg) => void
}) => {
  return (
    <Debug.View
      model={debug}
      dispatch={(msg) => dispatch(["DebugMsg", msg])}
    />
  )
}
