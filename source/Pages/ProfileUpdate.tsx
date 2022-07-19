import * as Route from "../Route";
import * as Profile from "../Store/Profile";
import * as UI from "../UI";
import { Cmd } from "../Core";

//
//
//
// Model
//
//
//

export type Model = {};

export const init: Model = {};

//
//
//
// Update
//
//
//

export type Msg =
  | ["ClickedBack"]
  | ["ClickedName"]
  | ["ClickedUsername"]
  | ["ClickedAvatar"]
  | ["ClickedChangedAvatar"]
  | ["ClickedTheme"];

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedAvatar":
      return [
        model,
        Route.push({
          type: "ProfileUpdateAvatar",
        }),
      ];

    case "ClickedChangedAvatar":
      return [
        model,
        Route.push({
          type: "ProfileUpdateAvatar",
        }),
      ];

    case "ClickedBack":
      return [model, Route.back];

    case "ClickedName":
      return [model, Route.push({ type: "ProfileUpdateName" })];

    case "ClickedUsername":
      return [model, Route.push({ type: "ProfileUpdateUsername" })];

    case "ClickedTheme":
      return [model, Route.push({ type: "ProfileUpdateTheme" })];
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
  (profile: Profile.Profile, _model: Model): UI.View<Msg> =>
    (dispatch) =>
    (
      <UI.FillBox>
        <UI.Header
          left={
            <UI.HeaderBackButton onClick={() => dispatch(["ClickedBack"])} />
          }
          title="Update Profile"
        />

        <UI.Avatar
          src={profile.avatarUrl}
          sx={{
            marginX: "auto",
            width: "150px",
            height: "150px",
            marginBottom: 1,
          }}
          onClick={() => dispatch(["ClickedAvatar"])}
        />

        <UI.Button
          sx={{ display: "block", marginX: "auto", marginBottom: 2 }}
          onClick={() => dispatch(["ClickedChangedAvatar"])}
        >
          Change Avatar
        </UI.Button>

        <UI.List>
          <UI.Field
            label="Username"
            value={profile.username}
            onClick={() => dispatch(["ClickedUsername"])}
          />

          <UI.Field
            label="Name"
            value={profile.name}
            onClick={() => dispatch(["ClickedName"])}
          />

          <UI.Field
            label="Theme"
            value={profile.themeMode}
            onClick={() => dispatch(["ClickedTheme"])}
          />
        </UI.List>
      </UI.FillBox>
    );
