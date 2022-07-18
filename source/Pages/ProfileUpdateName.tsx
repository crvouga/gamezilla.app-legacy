import * as Route from "../Route";
import * as Store from "../Store";
import * as UI from "../UI";
import { Cmd } from "../Core";

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
  | ["EnteredName", string]
  | ["ClickedCancel"]
  | ["ClickedSubmit"];

export type OutAction = ["Store", Store.Action];

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "EnteredName":
      return [{ ...model, name: msg[1] }, Cmd.None, []];

    case "ClickedSubmit":
      return [
        model,
        Route.back,
        [["Store", Store.Profile.Edit(userId, { name: model.name })]],
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
  (model: Model): UI.View<Msg> =>
  (dispatch) =>
    (
      <UI.Page>
        <UI.Header
          left={
            <UI.Button
              sx={{ marginLeft: -1 }}
              onClick={() => dispatch(["ClickedCancel"])}
            >
              Cancel
            </UI.Button>
          }
          title="Name"
          right={
            <UI.Button
              sx={{ marginRight: -1 }}
              onClick={() => dispatch(["ClickedSubmit"])}
            >
              Done
            </UI.Button>
          }
        />

        <UI.Box sx={{ padding: 2 }}>
          <UI.TextField
            value={model.name}
            sx={{ marginBottom: 4 }}
            label="Name"
            fullWidth
            onChange={(event) =>
              dispatch(["EnteredName", event.currentTarget.value])
            }
          />
        </UI.Box>
      </UI.Page>
    );
