import * as Route from "Route";
import * as Session from "Session";
import * as View from "View";
import { Browser, Cmd, pipe } from "Core";

//
//
//
// Model
//
//
//

export type Model = {
  emailAddress: string;
  password: string;
  passwordVisibility: Visibility;
  submission:
    | { type: "Idle" }
    | { type: "Loading" }
    | { type: "Problem"; message: string };
};

type Visibility = "Showing" | "Hiding";

//
//
//
// Init
//
//
//

export const init: Model = {
  submission: { type: "Idle" },
  passwordVisibility: "Hiding",
  emailAddress: "",
  password: "",
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
  | { type: "InputtedEmailAddress"; emailAddress: string }
  | { type: "InputtedPassword"; password: string }
  | { type: "ClickedTogglePasswordVisibility" }
  | { type: "FocusResulted"; result: Browser.FocusResult }
  | { type: "ClickedLogin" }
  | { type: "ClickedCreateAccount" }
  | { type: "LoginResulted"; result: Session.LoginResult };

const passwordFieldId = "password";

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedBack":
      return [model, Route.back];

    case "InputtedEmailAddress":
      return [{ ...model, emailAddress: msg.emailAddress }, Cmd.None];

    case "InputtedPassword": {
      return [{ ...model, password: msg.password }, Cmd.None];
    }

    case "ClickedTogglePasswordVisibility":
      return [
        {
          ...model,
          passwordVisibility: toggleVisibility(model.passwordVisibility),
        },
        pipe(
          Browser.focus(passwordFieldId),
          Cmd.fromTask((result) => ({ type: "FocusResulted", result })),
        ),
      ];

    case "FocusResulted":
      return [model, Cmd.None];

    case "ClickedLogin":
      return [
        {
          ...model,
          submission: { type: "Loading" },
        },
        pipe(
          Session.loginWithEmailAndPassword({
            emailAddress: model.emailAddress,
            password: model.password,
          }),
          Cmd.fromTask((result) => ({ type: "LoginResulted", result })),
        ),
      ];

    case "LoginResulted":
      switch (msg.result.type) {
        case "Err":
          return [
            {
              ...model,
              submission: {
                type: "Problem",
                message: msg.result.error.message,
              },
            },
            Cmd.None,
          ];

        case "Ok":
          return [model, Cmd.None];
      }

    case "ClickedCreateAccount":
      return [model, Route.push({ type: "AccountCreate" })];
  }
};

const toggleVisibility = (visibility: Visibility): Visibility => {
  switch (visibility) {
    case "Hiding":
      return "Showing";

    case "Showing":
      return "Hiding";
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
  (dispatch) => {
    return (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ type: "ClickedBack" })}
            />
          }
          title="Continue With Email"
        />

        <View.Box
          sx={{
            padding: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <View.TextField
            autoFocus
            sx={{ marginBottom: 2 }}
            type="email"
            fullWidth
            inputMode="email"
            label="Email Address"
            value={model.emailAddress}
            onChange={(event) => {
              dispatch({
                type: "InputtedEmailAddress",
                emailAddress: event.target.value,
              });
            }}
          />

          <View.TextField
            sx={{ marginBottom: 2 }}
            id={passwordFieldId}
            type={model.passwordVisibility === "Hiding" ? "password" : "text"}
            fullWidth
            label="Password"
            value={model.password}
            onChange={(event) => {
              dispatch({
                type: "InputtedPassword",
                password: event.target.value,
              });
            }}
            InputProps={{
              endAdornment: (
                <View.InputAdornment position="end">
                  <View.Button
                    onClick={() =>
                      dispatch({ type: "ClickedTogglePasswordVisibility" })
                    }
                  >
                    {model.passwordVisibility === "Hiding" ? "Show" : "Hide"}
                  </View.Button>
                </View.InputAdornment>
              ),
            }}
          />

          <View.Button
            variant="contained"
            size="large"
            fullWidth
            loading={model.submission.type === "Loading"}
            onClick={() => dispatch({ type: "ClickedLogin" })}
          >
            Login
          </View.Button>

          {model.submission.type === "Problem" && (
            <View.Alert severity="error" sx={{ marginTop: 2 }}>
              {model.submission.message}
            </View.Alert>
          )}

          <View.Box sx={{ flex: 1 }} />

          <View.Typography
            align="center"
            color="text.secondary"
            sx={{ marginBottom: 1 }}
          >
            Don't have an account?
          </View.Typography>

          <View.Button
            size="large"
            fullWidth
            variant="outlined"
            sx={{ marginBottom: 1 }}
            onClick={() => dispatch({ type: "ClickedCreateAccount" })}
          >
            Create Account
          </View.Button>
        </View.Box>
      </View.Page>
    );
  };
