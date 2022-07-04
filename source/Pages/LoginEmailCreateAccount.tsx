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
  password: string;
  passwordRepeat: string;
  submission:
    | { type: "Idle" }
    | { type: "Loading" }
    | { type: "Problem"; message: string };
};

export const init = ({
  emailAddress,
}: {
  emailAddress: EmailAddress.EmailAddress;
}): [Model, Cmd.Cmd<Msg>] => {
  return [
    {
      submission: { type: "Idle" },
      password: "",
      passwordRepeat: "",
    },
    pipe(
      Store.Account.findByEmailAddress({ emailAddress }),
      Cmd.fromTask((result) => ({
        type: "FindAccountResulted",
        emailAddress,
        result,
      })),
    ),
  ];
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
  | { type: "InputtedPasswordRepeat"; passwordRepeat: string }
  | { type: "ClickedCreateAccount" }
  | {
      type: "FindAccountResulted";
      emailAddress: EmailAddress.EmailAddress;
      result: Store.Account.FindResult;
    };

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedBack":
      return [model, Route.back];

    case "InputtedPassword":
      return [{ ...model, password: msg.password }, Cmd.None];

    case "InputtedPasswordRepeat":
      return [{ ...model, passwordRepeat: msg.passwordRepeat }, Cmd.None];

    case "ClickedCreateAccount":
      return [model, Cmd.None];

    case "FindAccountResulted":
      switch (msg.result.type) {
        case "Err":
          return [model, Cmd.None];

        case "Ok":
          switch (msg.result.value.type) {
            case "None":
              return [model, Cmd.None];

            case "Some":
              return [
                model,
                Route.replace({
                  type: "LoginEmailPassword",
                  emailAddress: msg.emailAddress,
                  userId: msg.result.value.value.userId,
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
          title="Create Account"
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
          />

          <View.TextField
            sx={{ marginBottom: 2 }}
            type="password"
            fullWidth
            label="Repeat Password"
          />

          <View.Button
            variant="contained"
            size="large"
            fullWidth
            loading={model.submission.type === "Loading"}
            onClick={() => dispatch({ type: "ClickedCreateAccount" })}
          >
            Create Account
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
