import * as Route from "Route";
import * as Profile from "Store/Profile";
import * as UI from "UI";
import { Cmd } from "Core";

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
  | { type: "UserClickedBackButton" }
  | { type: "UserClickedNameLink" }
  | { type: "UserClickedUsernameLink" }
  | { type: "UserClickedAvatar" }
  | { type: "UserClickedChangeAvatarButton" }
  | { type: "UserClickedThemeLink" };

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "UserClickedAvatar":
      return [
        model,
        Route.push({
          type: "ProfileUpdateAvatar",
        }),
      ];

    case "UserClickedChangeAvatarButton":
      return [
        model,
        Route.push({
          type: "ProfileUpdateAvatar",
        }),
      ];

    case "UserClickedBackButton":
      return [model, Route.back];

    case "UserClickedNameLink":
      return [model, Route.push({ type: "ProfileUpdateName" })];

    case "UserClickedUsernameLink":
      return [model, Route.push({ type: "ProfileUpdateUsername" })];

    case "UserClickedThemeLink":
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
      <UI.Page>
        <UI.Header
          left={
            <UI.HeaderBackButton
              onClick={() => dispatch({ type: "UserClickedBackButton" })}
            />
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
          onClick={() => dispatch({ type: "UserClickedAvatar" })}
        />

        <UI.Button
          sx={{ display: "block", marginX: "auto", marginBottom: 2 }}
          onClick={() => dispatch({ type: "UserClickedChangeAvatarButton" })}
        >
          Change Avatar
        </UI.Button>

        <UI.List>
          <UI.Field
            label="Username"
            value={profile.username}
            onClick={() => dispatch({ type: "UserClickedUsernameLink" })}
          />

          <UI.Field
            label="Name"
            value={profile.name}
            onClick={() => dispatch({ type: "UserClickedNameLink" })}
          />

          <UI.Field
            label="Theme"
            value={profile.themeMode}
            onClick={() => dispatch({ type: "UserClickedThemeLink" })}
          />
        </UI.List>
      </UI.Page>
    );
