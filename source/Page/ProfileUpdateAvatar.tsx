import { Avatar, List } from "@mui/material";
import * as React from "react";
import { cmd, react } from "../Framework";
import * as ProfileAvatar from "../ProfileAvatar";
import * as Router from "../Navigation";
import * as View from "../View";

/* 


Model


*/

export type Model = {
  status: "Idle" | "Loading";
  seed: ProfileAvatar.Seed;
  style: ProfileAvatar.Style;
};

export const init = ({ avatarUrl }: { avatarUrl: string }): Model => {
  return {
    status: "Idle",
    ...ProfileAvatar.parseUrl(avatarUrl),
  };
};

/* 


Update


*/

export type Msg =
  | { type: "Back" }
  | { type: "ClickedStyle" }
  | { type: "ClickedSeed" };

export const update =
  ({ userId }: { userId: string }) =>
  (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
    switch (msg.type) {
      case "Back":
        return [model, Router.replace("ProfileUpdate")];

      case "ClickedSeed":
        return [model, Router.push("ProfileUpdate")];

      case "ClickedStyle":
        return [model, Router.push("ProfileUpdate")];
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
            <View.HeaderBackButton onClick={() => dispatch({ type: "Back" })} />
          }
          title="Avatar"
        />

        <Avatar
          src={profile.avatarUrl}
          sx={{
            marginX: "auto",
            width: "150px",
            height: "150px",
            marginBottom: 1,
          }}
        />

        <List>
          <View.Field
            label="Style"
            value={ProfileAvatar.formatStyle(model.style)}
            onClick={() => dispatch({ type: "ClickedStyle" })}
          />

          <View.Field
            label="Seed"
            value={model.seed}
            onClick={() => dispatch({ type: "ClickedSeed" })}
          />
        </List>
      </View.Page>
    );
