import { Avatar, Button, List } from "@mui/material";
import * as React from "react";
import { cmd, react } from "../Framework";
import * as Routes from "../Routes";
import * as View from "../View";

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

export type Model = { status: "Idle" | "Loading"; form: Form };

export const init = (form: Form): Model => {
  return {
    status: "Idle",
    form,
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
  | { group: "ProfileUpdate"; type: "ClickedBack" }
  | { group: "ProfileUpdate"; type: "ClickedName" }
  | { group: "ProfileUpdate"; type: "ClickedUsername" }
  | { group: "ProfileUpdate"; type: "ClickedAvatar" };

export const update = (
  { userId }: { userId: string },
  msg: Msg,
  model: Model
): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedAvatar":
      return [model, Routes.push({ type: "ProfileUpdateAvatar" })];

    case "ClickedBack":
      return [model, Routes.replace({ type: "Account" })];

    case "ClickedName":
      return [model, Routes.push({ type: "ProfileUpdateName" })];

    case "ClickedUsername":
      return [model, Routes.push({ type: "ProfileUpdateUsername" })];
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
  (
    profile: { username: string; name: string; avatarUrl: string },
    model: Model
  ): react.Html<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() =>
                dispatch({ group: "ProfileUpdate", type: "ClickedBack" })
              }
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
          onClick={() =>
            dispatch({ group: "ProfileUpdate", type: "ClickedAvatar" })
          }
        />

        <Button
          sx={{ display: "block", marginX: "auto", marginBottom: 2 }}
          onClick={() =>
            dispatch({ group: "ProfileUpdate", type: "ClickedAvatar" })
          }
        >
          Change Avatar
        </Button>

        <List>
          <View.Field
            label="Username"
            value={profile.username}
            onClick={() =>
              dispatch({ group: "ProfileUpdate", type: "ClickedUsername" })
            }
          />

          <View.Field
            label="Name"
            value={profile.name}
            onClick={() =>
              dispatch({ group: "ProfileUpdate", type: "ClickedName" })
            }
          />
        </List>
      </View.Page>
    );
