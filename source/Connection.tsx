import { ConnectionStatus, onConnectionChanged } from "./Bridge/Frontend"
import { Cmd, Sub } from "./Core"

//
//
//
//
// Model
//
//
//

export type Model = ConnectionStatus

export const init: Model = "Connecting"

//
//
//
// Update
//
//
//

export type Msg = ["Changed", Model]

export const update = (msg: Msg, _: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Changed":
      return [msg[1], Cmd.None]
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Sub.Sub<Msg> = onConnectionChanged(
  (connectionStatus): Msg => ["Changed", connectionStatus],
)
