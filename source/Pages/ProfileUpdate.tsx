import { Avatar, Button, List } from "@mui/material";
import { cmd, navigation, react } from "Framework";
import * as React from "react";
import * as Route from "Route";
import * as View from "View";

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
  | { type: "UserClickedChangeAvatarButton" };

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "UserClickedAvatar":
      return [
        model,
        navigation.push(
          Route.encode({
            type: "ProfileUpdateAvatar",
          })
        ),
      ];

    case "UserClickedChangeAvatarButton":
      return [
        model,
        navigation.push(
          Route.encode({
            type: "ProfileUpdateAvatar",
          })
        ),
      ];

    case "UserClickedBackButton":
      return [model, navigation.back()];

    case "UserClickedNameLink":
      return [
        model,
        navigation.push(Route.encode({ type: "ProfileUpdateName" })),
      ];

    case "UserClickedUsernameLink":
      return [
        model,
        navigation.push(Route.encode({ type: "ProfileUpdateUsername" })),
      ];
  }
};

//
//
//
// View
//
//
//

type Profile = { username: string; name: string; avatarUrl: string };

export const view =
  (profile: Profile, _model: Model): react.Html<Msg> =>
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

        <Avatar
          src={profile.avatarUrl}
          sx={{
            marginX: "auto",
            width: "150px",
            height: "150px",
            marginBottom: 1,
          }}
          onClick={() => dispatch({ type: "UserClickedAvatar" })}
        />

        <Button
          sx={{ display: "block", marginX: "auto", marginBottom: 2 }}
          onClick={() => dispatch({ type: "UserClickedChangeAvatarButton" })}
        >
          Change Avatar
        </Button>

        <List>
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
        </List>
      </View.Page>
    );
