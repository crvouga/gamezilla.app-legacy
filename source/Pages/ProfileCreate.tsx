import { either } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { cmd } from "Framework";
import { attempt } from "Framework/Task";
import * as Navigation from "Framework/Navigation";
import * as Profile from "Profile";
import * as ProfileAvatar from "ProfileAvatar";
import * as Route from "Route";
import * as View from "View";

//
//
//
//
// Model
//
//
//
//

type Form = {
  username: string;
  name: string;
  avatarUrl: string;
};

const initForm = ({ defaultName }: { defaultName: string }): Form => {
  const username = defaultName.replace(" ", "").toLowerCase();

  return {
    username,
    name: defaultName,
    avatarUrl: ProfileAvatar.toUrl({
      seed: ProfileAvatar.toSeed(username),
      style: "adventurer-neutral",
    }),
  };
};

export type Model = {
  status: "Idle" | "CreatingProfile" | "ConfirmLogout" | "LoggingOut";
  form: Form;
};

export const init = ({ defaultName }: { defaultName: string }): Model => {
  return {
    status: "Idle",
    form: initForm({ defaultName }),
  };
};

//
//
//
//
// Update
//
//
//
//

export type Msg =
  | { type: "EnteredUsername"; username: string }
  | { type: "EnteredName"; name: string }
  | { type: "Submit" }
  | { type: "SubmitSucceeded" }
  | { type: "SubmitFailed" }
  | { type: "UserClickedLogoutButton" };

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "EnteredName":
      return [{ ...model, form: { ...model.form, ...msg } }, cmd.none];

    case "EnteredUsername":
      return [{ ...model, form: { ...model.form, ...msg } }, cmd.none];

    case "Submit":
      return [
        { ...model, status: "CreatingProfile" },
        pipe(
          Profile.create({
            userId,
            ...model.form,
          }),
          attempt(
            either.fold<{}, Profile.Profile, Msg>(
              () => ({ type: "SubmitFailed" }),
              () => ({ type: "SubmitSucceeded" })
            )
          )
        ),
      ];

    case "SubmitSucceeded":
      return [model, Navigation.reload()];

    case "SubmitFailed":
      return [{ ...model, status: "Idle" }, cmd.none];

    case "UserClickedLogoutButton":
      return [model, Navigation.push(Route.encode({ type: "Logout" }))];
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
  (model: Model): View.View<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.Button
              sx={{ marginLeft: -1 }}
              onClick={() => dispatch({ type: "UserClickedLogoutButton" })}
            >
              Logout
            </View.Button>
          }
          title="Create Profile"
        />

        <View.LoadingDialog
          open={model.status === "CreatingProfile"}
          title="Creating profile..."
        />

        <View.Box sx={{ p: 2, width: "100%" }}>
          <View.Avatar
            src={model.form.avatarUrl}
            sx={{
              marginX: "auto",
              width: "150px",
              height: "150px",
              marginBottom: 1,
            }}
          />

          <View.Button
            sx={{ display: "block", marginX: "auto", marginBottom: 2 }}
          >
            Change Avatar
          </View.Button>

          <View.TextField
            value={model.form.username}
            sx={{ marginBottom: 2 }}
            label="Username"
            fullWidth
            onChange={(event) =>
              dispatch({
                type: "EnteredUsername",
                username: event.currentTarget.value,
              })
            }
          />

          <View.TextField
            value={model.form.name}
            sx={{ marginBottom: 4 }}
            label="Name"
            fullWidth
            onChange={({ currentTarget: { value: name } }) =>
              dispatch({ type: "EnteredName", name })
            }
          />

          <View.Button
            fullWidth
            size="large"
            variant="contained"
            loading={model.status === "CreatingProfile"}
            onClick={() => dispatch({ type: "Submit" })}
          >
            Create Profile
          </View.Button>
        </View.Box>
      </View.Page>
    );
