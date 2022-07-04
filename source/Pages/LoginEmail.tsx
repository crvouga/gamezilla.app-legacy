import * as EmailAddress from "EmailAddress";
import * as Route from "Route";
import * as Store from "Store";
import * as View from "View";
import { Cmd, Result, pipe } from "Core";

//
//
//
// Model
//
//
//

export type Model = {
  emailAddress: string;
  submission:
    | { type: "Idle" }
    | { type: "Loading" }
    | { type: "ProblemValidation"; message: string }
    | { type: "Problem"; message: string };
};

export const init: Model = {
  submission: { type: "Idle" },
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
  | { type: "InputtedEmailAddress"; emailAddress: string }
  | { type: "ClickedSubmit" }
  | { type: "FindUserResulted"; result: Store.User.FindResult };

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedBack":
      return [model, Route.back];

    case "InputtedEmailAddress":
      const submissionNew: Model["submission"] =
        model.submission.type === "ProblemValidation"
          ? { type: "Idle" }
          : model.submission;

      return [
        {
          ...model,
          submission: submissionNew,
          emailAddress: msg.emailAddress,
        },
        Cmd.None,
      ];

    case "ClickedSubmit":
      const decoded = EmailAddress.decode(model.emailAddress);
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
            pipe(
              Store.User.findByEmailAddress({
                emailAddress: decoded.value,
              }),
              Cmd.fromTask((result) => ({ type: "FindUserResulted", result })),
            ),
          ];
      }

    case "FindUserResulted":
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
          return [{ ...model, submission: { type: "Idle" } }, Cmd.None];
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

        <View.Box sx={{ padding: 2 }}>
          <View.TextField
            autoFocus
            sx={{ marginBottom: 2 }}
            type="email"
            fullWidth
            inputMode="email"
            label="Email Address"
            value={model.emailAddress}
            helperText={
              model.submission.type === "ProblemValidation"
                ? model.submission.message
                : ""
            }
            error={model.submission.type === "ProblemValidation"}
            onChange={(event) => {
              dispatch({
                type: "InputtedEmailAddress",
                emailAddress: event.target.value,
              });
            }}
          />

          <View.Button
            variant="contained"
            size="large"
            fullWidth
            loading={model.submission.type === "Loading"}
            onClick={() => dispatch({ type: "ClickedSubmit" })}
          >
            Continue
          </View.Button>

          {model.submission.type === "Problem" && (
            <View.Alert severity="error" sx={{ marginTop: 2 }}>
              {model.submission.message}
            </View.Alert>
          )}
        </View.Box>
      </View.Page>
    );
