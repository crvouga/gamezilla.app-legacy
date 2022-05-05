import { Avatar, Button, List } from "@mui/material";
import * as React from "react";
import { cmd, react } from "../Framework";
import * as Router from "../Navigation";
import * as View from "../View";

/* 


Model


*/

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

/* 


Update


*/

export type Msg =
  | { type: "ClickedBack" }
  | { type: "ClickedName" }
  | { type: "ClickedUsername" }
  | { type: "ClickedAvatar" };

export const update =
  ({ userId }: { userId: string }) =>
  (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
    switch (msg.type) {
      case "ClickedAvatar":
        return [model, Router.push("ProfileUpdateAvatar")];

      case "ClickedBack":
        return [model, Router.replace("Account")];

      case "ClickedName":
        return [model, Router.push("ProfileUpdateName")];

      case "ClickedUsername":
        return [model, Router.push("ProfileUpdateUsername")];
    }
  };

/* 


View


*/

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
              onClick={() => dispatch({ type: "ClickedBack" })}
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
          onClick={() => dispatch({ type: "ClickedAvatar" })}
        />

        <Button
          sx={{ display: "block", marginX: "auto", marginBottom: 2 }}
          onClick={() => dispatch({ type: "ClickedAvatar" })}
        >
          Change Avatar
        </Button>

        <List>
          <View.Field
            label="Username"
            value={profile.username}
            onClick={() => dispatch({ type: "ClickedUsername" })}
          />

          <View.Field
            label="Name"
            value={profile.name}
            onClick={() => dispatch({ type: "ClickedName" })}
          />
        </List>
      </View.Page>
    );
