import * as Route from "Route";
import * as View from "View";
import { Cmd } from "Core";

//
//
//
// Model
//
//
//

export type Model = {
  emailAddress: string;
};

export const init: Model = {
  emailAddress: "",
};

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "ClickedBack" }
  | { type: "InputtedEmailAddress"; emailAddress: string };

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedBack":
      return [model, Route.back];

    case "InputtedEmailAddress":
      return [{ ...model, emailAddress: msg.emailAddress }, Cmd.None];
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
              onClick={() => dispatch({ type: "ClickedBack" })}
            />
          }
          title="Continue With Email"
        />
        <View.Box sx={{ paddingX: 2 }}>
          <View.TextField
            autoFocus
            sx={{ marginBottom: 2 }}
            type="email"
            fullWidth
            label="Email Address"
            value={model.emailAddress}
            onChange={(event) => {
              dispatch({
                type: "InputtedEmailAddress",
                emailAddress: event.target.value,
              });
            }}
          />

          <View.Button variant="contained" size="large" fullWidth>
            Next
          </View.Button>
        </View.Box>
      </View.Page>
    );
