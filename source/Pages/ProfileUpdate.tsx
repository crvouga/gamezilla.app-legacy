import * as Route from "Route";
import * as Profile from "Store/Profile";
import * as View from "View";
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
  (profile: Profile.Profile, _model: Model): View.View<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ type: "UserClickedBackButton" })}
            />
          }
          title="Update Profile"
        />

        <View.Avatar
          src={profile.avatarUrl}
          sx={{
            marginX: "auto",
            width: "150px",
            height: "150px",
            marginBottom: 1,
          }}
          onClick={() => dispatch({ type: "UserClickedAvatar" })}
        />

        <View.Button
          sx={{ display: "block", marginX: "auto", marginBottom: 2 }}
          onClick={() => dispatch({ type: "UserClickedChangeAvatarButton" })}
        >
          Change Avatar
        </View.Button>

        <View.List>
          <View.Field
            label="Username"
            value={profile.username}
            onClick={() => dispatch({ type: "UserClickedUsernameLink" })}
          />

          <View.Field
            label="Name"
            value={profile.name}
            onClick={() => dispatch({ type: "UserClickedNameLink" })}
          />

          <View.Field
            label="Theme"
            value={profile.themeMode}
            onClick={() => dispatch({ type: "UserClickedThemeLink" })}
          />
        </View.List>
      </View.Page>
    );
