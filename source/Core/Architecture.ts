import * as Cmd from "./Cmd"
import * as Sub from "./Sub"

//
//
//
// Update
//
//
//

export type Input<Msg, Model> = {
  msg: Msg
  model: Model
}

export type Output<Msg, Model> = {
  model: Model
  cmd?: Cmd.Cmd<Msg>
}

export interface Update<Msg, Model> {
  (input: Input<Msg, Model>): Output<Msg, Model>
}

//
//
//
// Subscriptions
//
//
//

export type Subscriptions = <Msg, Model>(model: Model) => Sub.Sub<Msg>

type Model = number

type Msg = "Increment" | "Decrement"

export const update: Update<Msg, Model> = ({ msg, model }) => {
  switch (msg) {
    case "Decrement": {
      return {
        model: model - 1,
      }
    }

    case "Increment": {
      return {
        model: model + 1,
      }
    }
  }
}
