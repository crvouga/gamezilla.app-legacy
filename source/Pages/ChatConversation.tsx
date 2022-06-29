import * as Route from "Route"
import * as Store from "Store"
import * as View from "View"
import { Cmd } from "Core"

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

export type Msg = { type: "ClickedBack" } | { type: "ClickedSend" }

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedBack":
      return [model, Route.back]

    case "ClickedSend":
      return [model, Cmd.None]
  }
}

//
//
//
// View
//
//
//

export const view =
  (store: Store.Model, coversationId: string, model: Model): View.View<Msg> =>
  (dispatch) => {
    return (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ type: "ClickedBack" })}
            />
          }
          title="Chat"
        />
      </View.Page>
    )
  }
