import * as Route from "Route";
import * as Store from "Store";
import * as View from "View";
import { Cmd } from "Core";

//
//
//
// Model
//
//
//

export type Model = { name: string };

export const init = ({ name }: { name: string }): Model => {
  return {
    name,
  };
};

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "EnteredName"; name: string }
  | { type: "ClickedCancel" }
  | { type: "ClickedSubmit" };

export type OutAction = Store.Action;

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg.type) {
    case "EnteredName":
      return [{ ...model, ...msg }, Cmd.None, []];

    case "ClickedSubmit":
      return [
        model,
        Route.back,
        [Store.Profile.Edit(userId, { name: model.name })],
      ];

    case "ClickedCancel":
      return [model, Route.back, []];
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
            <View.Button
              sx={{ marginLeft: -1 }}
              onClick={() => dispatch({ type: "ClickedCancel" })}
            >
              Cancel
            </View.Button>
          }
          title="Name"
          right={
            <View.Button
              sx={{ marginRight: -1 }}
              onClick={() => dispatch({ type: "ClickedSubmit" })}
            >
              Done
            </View.Button>
          }
        />

        <View.Box sx={{ padding: 2 }}>
          <View.TextField
            value={model.name}
            sx={{ marginBottom: 4 }}
            label="Name"
            fullWidth
            onChange={(event) =>
              dispatch({
                type: "EnteredName",
                name: event.currentTarget.value,
              })
            }
          />
        </View.Box>
      </View.Page>
    );
