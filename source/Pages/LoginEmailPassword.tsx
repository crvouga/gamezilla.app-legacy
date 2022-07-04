import * as EmailAddress from "EmailAddress";
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
  password: string;
  submission:
    | { type: "Idle" }
    | { type: "Loading" }
    | { type: "ProblemValidation"; message: string }
    | { type: "Problem"; message: string };
};

export const init: Model = {
  submission: { type: "Idle" },
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
  | { type: "InputtedPassword"; password: string }
  | { type: "ClickedLogin" };

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedBack":
      return [model, Route.back];

    case "InputtedPassword":
      const submissionNew: Model["submission"] =
        model.submission.type === "ProblemValidation"
          ? { type: "Idle" }
          : model.submission;

      return [
        {
          ...model,
          submission: submissionNew,
          password: msg.password,
        },
        Cmd.None,
      ];

    case "ClickedLogin":
      const decoded = EmailAddress.decode(model.password);
      switch (decoded.type) {
        case "Err":
          return [
            {
              ...model,
              submission: {
                type: "ProblemValidation",
                message: decoded.error.message,
              },
            },
            Cmd.None,
          ];

        case "Ok":
          return [
            {
              ...model,
              submission: { type: "Loading" },
            },
            Cmd.None,
          ];
      }
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
  (
    {
      emailAddress,
    }: {
      userId: string;
      emailAddress: EmailAddress.EmailAddress;
    },
    model: Model,
  ): View.View<Msg> =>
  (dispatch) => {
    return (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ type: "ClickedBack" })}
            />
          }
          title="Login With Password"
        />

        <View.Box sx={{ padding: 2 }}>
          <View.Typography color="text.secondary">
            Email Address
          </View.Typography>
          <View.Typography variant="h6" sx={{ marginBottom: 2 }}>
            {emailAddress}
          </View.Typography>

          <View.TextField
            autoFocus
            sx={{ marginBottom: 2 }}
            type="password"
            fullWidth
            label="Password"
            // value={emailAddress}
            // InputProps={{ readOnly: true }}
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
        </View.Box>
      </View.Page>
    );
  };
