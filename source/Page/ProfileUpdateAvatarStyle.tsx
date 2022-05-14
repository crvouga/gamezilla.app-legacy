import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import * as React from "react";
import { cmd, react } from "../Framework";
import * as ProfileAvatar from "../ProfileAvatar";
import * as View from "../View";
import * as Routes from "../Routes";

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
  | { group: "ProfileUpdateAvatarStyle"; type: "SelectedStyle" }
  | { group: "ProfileUpdateAvatarStyle"; type: "Back" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "Back":
      return [model, Routes.replace<Msg>({ type: "ProfileUpdateAvatar" })];
  }
  return [model, cmd.none];
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
  (model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() =>
                dispatch({ group: "ProfileUpdateAvatarStyle", type: "Back" })
              }
            />
          }
          title="Choose Style"
        />
        <List sx={{ overflowY: "scroll" }}>
          {ProfileAvatar.ALL_STYLES.map((style) => (
            <ListItemButton
              onClick={() =>
                dispatch({
                  group: "ProfileUpdateAvatarStyle",
                  type: "SelectedStyle",
                })
              }
            >
              <ListItemAvatar>
                <Avatar
                  src={ProfileAvatar.toUrl({
                    style,
                    seed: ProfileAvatar.toSeed("hello"),
                  })}
                />
              </ListItemAvatar>
              <ListItemText primary={ProfileAvatar.formatStyle(style)} />
            </ListItemButton>
          ))}
        </List>
      </View.Page>
    );
