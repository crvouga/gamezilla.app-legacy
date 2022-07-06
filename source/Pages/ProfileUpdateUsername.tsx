import * as Route from "Route";
import * as Store from "Store";
import * as UI from "UI";
import { Cmd } from "Core";

//
//
//
// Model
//
//
//

export type Model = { username: string };

export const init = ({ username }: { username: string }): Model => {
  return {
    username,
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
  | { type: "UserClickedCancelButton" }
  | { type: "UserEnteredUsername"; username: string }
  | { type: "UserClickedSubmitButton" };

export type OutMsg = Store.Action;

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutMsg[]] => {
  switch (msg.type) {
    case "UserEnteredUsername":
      return [{ ...model, username: msg.username }, Cmd.None, []];

    case "UserClickedCancelButton":
      return [model, Route.back, []];

    case "UserClickedSubmitButton":
      return [
        model,
        Route.back,
        [Store.Profile.Edit(userId, { username: model.username })],
      ];
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
  (model: Model): UI.View<Msg> =>
  (dispatch) =>
    (
      <UI.Page>
        <UI.Header
          left={
            <UI.Button
              sx={{ marginLeft: -1 }}
              onClick={() => dispatch({ type: "UserClickedCancelButton" })}
            >
              Cancel
            </UI.Button>
          }
          title="Username"
          right={
            <UI.Button
              sx={{ marginRight: -1 }}
              onClick={() => dispatch({ type: "UserClickedSubmitButton" })}
            >
              Done
            </UI.Button>
          }
        />

        <UI.Box sx={{ p: 2, width: "100%" }}>
          <UI.TextField
            value={model.username}
            sx={{ marginBottom: 4 }}
            label="Username"
            fullWidth
            onChange={(event) =>
              dispatch({
                type: "UserEnteredUsername",
                username: event.currentTarget.value,
              })
            }
          />
        </UI.Box>
      </UI.Page>
    );
