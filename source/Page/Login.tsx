import { LoadingButton } from "@mui/lab";
import { Typography } from "@mui/material";
import React from "react";
import * as Auth from "../Auth";
import { cmd, react } from "../Framework";
import * as View from "../View";

//
//
//
//
// Model
//
//
//
//

export type Model = { type: "Idle" } | { type: "Loading" };

export const init = (): Model => {
  return { type: "Idle" };
};

/*


Update


*/

export type Msg = { group: "Login"; type: "Login" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Login":
      return [{ type: "Loading" }, Auth.login()];
  }
};

//
//
//
//
// View
//
//
//
//

export const view =
  (model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <View.Page
        sx={{
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Typography variant="h1" sx={{ marginBottom: 2 }}>
          Gamezilla
        </Typography>

        <LoadingButton
          variant="outlined"
          size="large"
          fullWidth
          loading={model.type === "Loading"}
          onClick={() => dispatch({ group: "Login", type: "Login" })}
        >
          Continue With Google
        </LoadingButton>
      </View.Page>
    );
