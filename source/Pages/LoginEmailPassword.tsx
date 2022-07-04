import * as EmailAddress from "EmailAddress";
import * as Route from "Route";
import * as Store from "Store";
import * as View from "View";
import { Cmd, Option, pipe } from "Core";

//
//
//
// Model
//
//
//

export type Model = {
  emailAddressInput: string;
  submission:
    | { type: "Idle" }
    | { type: "Loading" }
    | { type: "ProblemValidation"; message: string }
    | { type: "Problem"; message: string };
};

export const init: Model = {
  submission: { type: "Idle" },
  emailAddressInput: "",
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
  | { type: "InputtedEmailAddress"; emailAddressInput: string }
  | { type: "ClickedContinue" }
  | {
      type: "FindAccountResulted";
      emailAddress: EmailAddress.EmailAddress;
      result: Store.Account.FindResult;
    };

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
          emailAddressInput: msg.emailAddressInput,
        },
        Cmd.None,
      ];

    case "ClickedContinue":
      const decoded = EmailAddress.decode(model.emailAddressInput);
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
              Store.Account.findByEmailAddress({
                emailAddress: decoded.value,
              }),
              Cmd.fromTask((result) => ({
                type: "FindAccountResulted",
                emailAddress: decoded.value,
                result,
              })),
            ),
          ];
      }

    case "FindAccountResulted":
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
          switch (msg.result.value.type) {
            case "None":
              return [
                { ...model, submission: { type: "Idle" } },
                Route.push({
                  type: "LoginEmailPassword",
                  emailAddress: msg.emailAddress,
                }),
              ];

            case "Some":
              return [
                { ...model, submission: { type: "Idle" } },
                Route.push({
                  type: "LoginEmailPassword",
                  emailAddress: msg.emailAddress,
                }),
              ];
          }
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
    { emailAddress }: { emailAddress: EmailAddress.EmailAddress },
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
          title="Enter password"
        />

        <View.Box sx={{ padding: 2 }}>
          <View.Box sx={{ paddingX: 2 }}>
            <View.Typography color="text.secondary">
              Email Address
            </View.Typography>
            <View.Typography sx={{ marginBottom: 2 }}>
              {emailAddress}
            </View.Typography>
          </View.Box>

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
            onClick={() => dispatch({ type: "ClickedContinue" })}
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
