import { Cmd } from "../Core";
import { ProfileAvatar } from "../Data";
import * as Route from "../Route";
import * as Store from "../Store";
import * as UI from "../UI";

//
//
//
//
// Model
//
//
//
//

export type Model = {
  form: Form;
};

export const init = ({ defaultName }: { defaultName: string }): Model => {
  return {
    form: initForm({ defaultName }),
  };
};

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
  | ["EnteredUsername", string]
  | ["EnteredName", string]
  | ["ClickedSubmit"]
  | ["ClickedLogout"];

export type OutAction = Store.Action;

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "EnteredName":
      return [
        { ...model, form: { ...model.form, name: msg[1] } },
        Cmd.None,
        [],
      ];

    case "EnteredUsername":
      return [
        { ...model, form: { ...model.form, username: msg[1] } },
        Cmd.None,
        [],
      ];

    case "ClickedSubmit":
      const avatarUrl = ProfileAvatar.toUrl({ seed: ProfileAvatar.toSeed(model.form.username), style: "avataaars" })
      const profile: Store.Profile.Profile = {
        ...model.form,
        userId,
        avatarUrl,
        themeMode: "System",
      }

      return [
        model,
        Cmd.None,
        [["Store", ["Profile", ["Create", { userId, profile }]]]]
      ]

    case "ClickedLogout":
      return [model, Route.push({ type: "Logout" }), []];
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
  (model: Model): UI.View<Msg> =>
    (dispatch) =>
    (
      <UI.FillBox>
        <UI.Header
          left={
            <UI.Button
              sx={{ marginLeft: -1 }}
              onClick={() => dispatch(["ClickedLogout"])}
            >
              Logout
            </UI.Button>
          }
          title="Create Profile"
        />

        <UI.Box sx={{ p: 2, width: "100%" }}>
          <UI.Avatar
            src={model.form.avatarUrl}
            sx={{
              marginX: "auto",
              width: "150px",
              height: "150px",
              marginBottom: 1,
            }}
          />

          <UI.Button
            sx={{
              display: "block",
              marginX: "auto",
              marginBottom: 2,
            }}
          >
            Change Avatar
          </UI.Button>

          <UI.TextField
            value={model.form.username}
            sx={{ marginBottom: 2 }}
            label="Username"
            fullWidth
            onChange={(event) =>
              dispatch(["EnteredUsername", event.currentTarget.value])
            }
          />

          <UI.TextField
            value={model.form.name}
            sx={{ marginBottom: 4 }}
            label="Name"
            fullWidth
            onChange={({ currentTarget: { value: name } }) =>
              dispatch(["EnteredName", name])
            }
          />

          <UI.Button
            fullWidth
            size="large"
            variant="contained"
            onClick={() => dispatch(["ClickedSubmit"])}
          >
            Create Profile
          </UI.Button>
        </UI.Box>
      </UI.FillBox>
    );
