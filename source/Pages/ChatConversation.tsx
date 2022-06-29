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

export type Msg =
  | { type: "UserClickedBackButton" }
  | { type: "UserClickedSendMessageButton" }

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "UserClickedBackButton":
      return [model, Route.back]

    case "UserClickedSendMessageButton":
      return [model, Route.push({ type: "ChatNew" })]
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
              onClick={() => dispatch({ type: "UserClickedBackButton" })}
            />
          }
          title="Chat"
        />
      </View.Page>
    )
  }
