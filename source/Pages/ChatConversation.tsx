import { Cmd } from "Core/Cmd";
import * as Navigation from "Core/Navigation";
import * as Route from "Route";
import * as View from "View";

//
//
//
// Model
//
//
//

export type Model = {};

export const init: Model = {};

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "UserClickedBackButton" }
  | { type: "UserClickedSendMessageButton" };

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg.type) {
    case "UserClickedBackButton":
      return [model, Navigation.back()];

    case "UserClickedSendMessageButton":
      return [model, Navigation.push(Route.encode({ type: "ChatNew" }))];
  }
};

//
//
//
// View
//
//
//

export const view =
  (model: Model): View.View<Msg> =>
  (dispatch) =>
    (
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
    );
