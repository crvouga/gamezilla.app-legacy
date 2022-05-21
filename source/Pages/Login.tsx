import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd, react } from "Framework";
import { attempt } from "Framework/Task";
import React from "react";
import * as Session from "../Session";
import * as View from "../View";

//
//
//
// Model
//
//
//

export type Model = { type: "Idle" } | { type: "Loading" };

export const init = (): Model => {
  return { type: "Idle" };
};

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "Login" }
  | { type: "LoginFailed" }
  | { type: "LoginSucceeded" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Login":
      return [
        { type: "Loading" },
        pipe(
          Session.login,
          attempt(
            either.fold<{}, {}, Msg>(
              () => ({ type: "LoginFailed" }),
              () => ({ type: "LoginSucceeded" })
            )
          )
        ),
      ];

    case "LoginFailed":
      return [model, cmd.none];

    case "LoginSucceeded":
      return [model, cmd.none];
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
        <View.Typography variant="h1" sx={{ marginBottom: 2 }}>
          Gamezilla
        </View.Typography>

        <View.Button
          variant="contained"
          size="large"
          fullWidth
          loading={model.type === "Loading"}
          onClick={() => dispatch({ type: "Login" })}
        >
          Continue With Google
        </View.Button>
      </View.Page>
    );
