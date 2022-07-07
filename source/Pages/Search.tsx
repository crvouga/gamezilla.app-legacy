import * as UI from "UI";
import { Cmd, Sub } from "Core";

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

export type Msg = { type: "Noop" };

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  return [model, Cmd.None];
};

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.None;
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
  (dispatch) => {
    return (
      <>
        <UI.TextField
          label="Search"
          fullWidth
          InputProps={{
            endAdornment: (
              <UI.InputAdornment position="end">
                <UI.IconButton>
                  <UI.Icons.Close />
                </UI.IconButton>
              </UI.InputAdornment>
            ),
          }}
        />
        <UI.Box sx={{ flex: 1 }}></UI.Box>
      </>
    );
  };
